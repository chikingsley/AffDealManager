"""Redis caching implementation."""
from typing import Optional, List, Dict
import json
import redis.asyncio as redis
import logging

from ..config.settings import Settings
from ..models.exceptions import CacheError

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self, settings: Settings):
        self.redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        self.default_ttl = 3600  # 1 hour
        
    async def get_search_results(self, query: str) -> Optional[List[Dict]]:
        """Get cached search results."""
        try:
            cache_key = f"search:{query}"
            cached_data = await self.redis.get(cache_key)
            return json.loads(cached_data) if cached_data else None
        except Exception as e:
            logger.error(f"Cache retrieval error: {str(e)}", exc_info=True)
            return None
            
    async def cache_search_results(self, query: str, results: List[Dict], ttl: int = None) -> None:
        """Cache search results."""
        try:
            cache_key = f"search:{query}"
            await self.redis.set(
                cache_key,
                json.dumps(results),
                ex=ttl or self.default_ttl
            )
        except Exception as e:
            logger.error(f"Cache storage error: {str(e)}", exc_info=True) 
            
    async def clear_search_cache(self) -> None:
        """Clear all search caches."""
        try:
            pattern = "search:*"
            cursor = 0
            while True:
                cursor, keys = await self.redis.scan(cursor, pattern)
                if keys:
                    await self.redis.delete(*keys)
                if cursor == 0:
                    break
            logger.info("Search cache cleared successfully")
        except Exception as e:
            logger.error(f"Failed to clear search cache: {str(e)}", exc_info=True)
            raise CacheError(f"Cache clear failed: {str(e)}")

    async def close(self):
        """Close Redis connections."""
        try:
            await self.redis.close()
        except Exception as e:
            logger.error(f"Error closing Redis connection: {str(e)}")

    async def is_healthy(self) -> bool:
        """Check if Redis is healthy."""
        try:
            await self.redis.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}")
            return False