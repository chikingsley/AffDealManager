"""Search service implementation."""
from typing import List, Dict, Optional
import typesense
import logging

from ..config.settings import Settings
from ..models.exceptions import SearchError

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self, settings: Settings):
        self.client = typesense.Client({
            'api_key': settings.TYPESENSE_API_KEY,
            'nodes': settings.TYPESENSE_NODES,
            'connection_timeout_seconds': 2
        })
        
    async def search_deals(
        self,
        query: str,
        filters: Optional[Dict] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Search deals using Typesense."""
        try:
            search_parameters = {
                'q': query,
                'query_by': 'partner,sources,geo,language,funnels',
                'filter_by': self._build_filters(filters),
                'limit': limit,
                'sort_by': '_text_match:desc'
            }
            
            # Synchronous call
            results = self.client.collections['deals'].documents.search(
                search_parameters
            )
            
            return self._process_results(results)
            
        except Exception as e:
            logger.error(f"Search error: {str(e)}", exc_info=True)
            return []
    
    def _build_filters(self, filters: Optional[Dict]) -> str:
        """Build Typesense filter string from filter dict."""
        if not filters:
            return ""
            
        filter_parts = []
        for field, value in filters.items():
            if isinstance(value, list):
                filter_parts.append(f"{field}:=[{','.join(value)}]")
            else:
                filter_parts.append(f"{field}:={value}")
                
        return ' && '.join(filter_parts)
    
    def _process_results(self, results: Dict) -> List[Dict]:
        """Process and format search results."""
        if not results.get('hits'):
            return []
            
        return [hit['document'] for hit in results['hits']] 
    
    async def update_index(self, deals: List[Dict]) -> None:
        """Update search index with new deals."""
        try:
            # Ensure collection exists
            await self._ensure_collection()
            
            # Format documents for Typesense
            documents = [{
                'id': deal['id'],
                'partner': deal['partner'],
                'sources': deal['sources'],  # List of sources
                'geo': deal['geo'],
                'language': deal['language'],  # List of languages
                'price': deal['price'],
                'funnels': deal['funnels'],  # List of funnels
                'formatted_display': deal['formatted_display'],
                'formatted_funnels': deal.get('formatted_funnels', ''),
                'last_updated': deal['last_updated']
            } for deal in deals]
            
            # Update documents
            self.client.collections['deals'].documents.import_(
                documents,
                {'action': 'upsert'}
            )
            
            logger.info(f"Successfully updated {len(deals)} documents in search index")
            
        except Exception as e:
            logger.error(f"Failed to update search index: {str(e)}")
            raise SearchError(f"Index update failed: {str(e)}")
    
    async def _ensure_collection(self) -> None:
        """Ensure deals collection exists with correct schema."""
        schema = {
            'name': 'deals',
            'fields': [
                {'name': 'id', 'type': 'string'},
                {'name': 'partner', 'type': 'string'},
                {'name': 'sources', 'type': 'string[]', 'facet': True},
                {'name': 'geo', 'type': 'string', 'facet': True},
                {'name': 'language', 'type': 'string[]', 'facet': True},
                {'name': 'price', 'type': 'string'},
                {'name': 'funnels', 'type': 'string[]', 'facet': True},
                {'name': 'formatted_display', 'type': 'string'},
                {'name': 'formatted_funnels', 'type': 'string'},
                {'name': 'last_updated', 'type': 'string'}
            ]
        }
        
        try:
            self.client.collections['deals'].retrieve()
        except Exception:
            self.client.collections.create(schema)
    
    async def is_healthy(self) -> bool:
        """Check if Typesense is healthy."""
        try:
            return self.client.operations.is_healthy()
        except Exception as e:
            logger.error(f"Typesense health check failed: {str(e)}")
            return False