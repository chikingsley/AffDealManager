"""Notion integration service."""
from typing import List, Dict, Optional
import asyncio
from datetime import datetime
import logging
import re
from notion_client import AsyncClient
from notion_client.errors import APIResponseError, HTTPResponseError

from ..config.settings import Settings
from ..models.exceptions import NotionSyncError

logger = logging.getLogger(__name__)

class NotionService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = AsyncClient(auth=settings.NOTION_TOKEN)
        self.database_id = settings.OFFERS_DATABASE_ID
        self.advertisers_db_id = settings.ADVERTISERS_DATABASE_ID
        self.max_retries = 3
        self.retry_delay = 5  # seconds
        self._advertiser_cache = {}
        
    async def _query_with_retry(self, func, *args, **kwargs):
        """Execute a Notion API call with retry logic."""
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except (APIResponseError, HTTPResponseError) as e:
                if e.code == 502 or e.code == 429:  # Bad Gateway or Rate Limited
                    if attempt < self.max_retries - 1:
                        delay = self.retry_delay * (attempt + 1)  # Exponential backoff
                        logger.warning(f"Notion API error (attempt {attempt + 1}/{self.max_retries}): {str(e)}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                logger.error(f"Notion API error after {attempt + 1} attempts: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error in Notion API call: {str(e)}")
                raise
    
    async def _query_database(self, start_cursor: Optional[str] = None) -> Dict:
        """Query Notion database with pagination."""
        return await self._query_with_retry(
            self.client.databases.query,
            database_id=self.database_id,
            start_cursor=start_cursor,
            page_size=100
        )
    
    async def sync_deals(self) -> List[Dict]:
        """Sync deals from Notion database."""
        try:
            deals = []
            has_more = True
            start_cursor = None
            
            while has_more:
                response = await self._query_database(start_cursor)
                processed_pages = await self._process_pages(response["results"])
                deals.extend(processed_pages)
                has_more = response["has_more"]
                start_cursor = response["next_cursor"]
                
            logger.info(f"Successfully synced {len(deals)} deals from Notion")
            return deals
            
        except Exception as e:
            logger.error(f"Unexpected error during Notion sync: {str(e)}")
            raise NotionSyncError(f"Sync failed: {str(e)}")
    
    async def _process_pages(self, pages: List[Dict]) -> List[Dict]:
        """Process Notion pages into deal format."""
        deals = []
        for page in pages:
            try:
                deal = await self._extract_deal_data(page)
                if deal:
                    deals.append(deal)
            except Exception as e:
                logger.error(f"Error processing page {page.get('id')}: {str(e)}", exc_info=True)
                continue
        return deals
    
    async def _fetch_advertiser_name(self, advertiser_id: str) -> str:
        """Get advertiser name from relation ID with caching."""
        if advertiser_id in self._advertiser_cache:
            return self._advertiser_cache[advertiser_id]
        
        try:
            # Directly retrieve the page using the advertiser_id
            page = await self.client.pages.retrieve(page_id=advertiser_id)
            
            # Get the title from the page properties
            title_prop = page["properties"].get("title", {})
            name = self._get_text_property({"type": "title", "title": title_prop.get("title", [])})
            
            if name:
                self._advertiser_cache[advertiser_id] = name
                logger.info(f"Found advertiser: {name} (ID: {advertiser_id})")
                return name
            
            logger.warning(f"No title found for advertiser ID: {advertiser_id}")
            return "Unknown Advertiser"
            
        except Exception as e:
            logger.error(f"Error getting advertiser name: {str(e)}")
            return "Unknown Advertiser"
    
    async def _extract_deal_data(self, page: Dict) -> Optional[Dict]:
        """Extract deal data from Notion page."""
        props = page.get("properties", {})
        
        try:
            partner = self._get_formula_property(props.get("Partner", {}))
            sources = self._get_multi_select_property(props.get("Sources", {}))
            
            # Handle UK -> GB conversion for flags
            geo = self._get_formula_property(props.get("GEO", {}))
            geo = "GB" if geo == "UK" else geo  # Convert UK to GB for flag API
            
            language = self._get_multi_select_property(props.get("Language", {}))
            price = self._get_price_data(props)
            funnels = self._get_multi_select_property(props.get("Funnels", {}))
            
            # Format the sources with square brackets
            formatted_sources = f"[{', '.join(sources)}]" if sources else ""
            language_str = ', '.join(language).replace("[", "").replace("]", "").replace("'", "")
            funnels_str = ', '.join(funnels).replace("[", "").replace("]", "").replace("'", "")
            
            # Format display strings
            formatted_display = f"{partner} {formatted_sources} {geo} {language_str} {price}"
            formatted_funnels = f"Funnels: {funnels_str}" if funnels_str else ""
            
            return {
                "id": page["id"],
                "partner": partner,
                "sources": sources,
                "geo": geo,  # Will be GB instead of UK
                "language": language,
                "price": price,
                "funnels": funnels,
                "formatted_display": formatted_display.strip(),
                "formatted_funnels": formatted_funnels,
                "last_updated": datetime.now().isoformat()
            }
        except KeyError as e:
            logger.error(f"Missing required property: {str(e)}", exc_info=True)
            return None
    
    def _get_relation_property(self, prop: Dict) -> str:
        """Extract first related item name from relation property."""
        try:
            relation_id = prop.get("relation", [{}])[0].get("id", "")
            if relation_id:
                return relation_id
        except (IndexError, KeyError):
            pass
        return ""
    
    def _get_price_data(self, props: Dict) -> str:
        """Extract and format price data based on available fields."""
        try:
            # Get Network values
            cpa = props.get("CPA | Network | Selling", {}).get("number")
            crg = props.get("CRG | Network | Selling", {}).get("number")
            cpl = props.get("CPL | Network | Selling", {}).get("formula", {}).get("number")
            
            # Format based on available values
            if cpl is not None:
                if cpa is not None and crg is not None:
                    # Both CPA+CRG and CPL available
                    return f"{cpa:g}+{crg*100:g}% OR {cpl:g} CPL"
                else:
                    # Only CPL available
                    return f"{cpl:g} CPL"
            elif cpa is not None and crg is not None:
                # Only CPA+CRG available
                return f"{cpa:g}+{crg*100:g}%"
            
            return "Price not set"
            
        except Exception as e:
            logger.error(f"Error formatting price: {str(e)}", exc_info=True)
            return "Price error"
    
    def _get_text_property(self, prop: Dict) -> str:
        """Extract text from Notion text property."""
        try:
            if prop.get("type") == "title":
                return prop.get("title", [{}])[0].get("plain_text", "")
            elif prop.get("type") == "formula":  # Handle formula fields (like GEO)
                return prop.get("formula", {}).get("string", "")
            return prop.get("rich_text", [{}])[0].get("plain_text", "")
        except (IndexError, KeyError, TypeError):
            return ""
    
    def _get_multi_select_property(self, prop: Dict) -> List[str]:
        """Extract values from Notion multi-select property."""
        try:
            return [option.get("name", "") for option in prop.get("multi_select", [])]
        except (KeyError, TypeError):
            return []
    
    @staticmethod
    def _get_number_property(prop: Dict) -> float:
        """Extract number from Notion number property."""
        return prop.get("number", 0.0)
    
    async def is_healthy(self) -> bool:
        """Check if Notion is healthy."""
        try:
            # Try to query database with limit 1 to check access
            await self.client.databases.query(
                database_id=self.database_id,
                page_size=1
            )
            return True
        except Exception as e:
            logger.error(f"Notion health check failed: {str(e)}")
            return False
    
    def _get_formula_property(self, prop: Dict) -> str:
        """Extract value from formula property."""
        try:
            if prop.get("type") == "formula":
                formula_value = prop.get("formula", {})
                if "string" in formula_value:
                    return formula_value["string"]
                elif "number" in formula_value:
                    return str(formula_value["number"])
            return ""
        except (KeyError, TypeError):
            return ""

