import asyncio
import pytest
import redis.asyncio as redis
import os
from dotenv import load_dotenv

@pytest.mark.asyncio
async def test_redis_connection():
    load_dotenv()
    
    client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True
    )
    
    try:
        result = await client.ping()
        print("Redis connection successful!")
        assert result == True
    except Exception as e:
        print(f"Connection failed: {str(e)}")
        assert False, f"Connection failed: {str(e)}"
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(test_redis_connection()) 