import pytest
from notion_client import AsyncClient
import os
from dotenv import load_dotenv

@pytest.mark.asyncio
async def test_notion_connection():
    load_dotenv()
    
    client = AsyncClient(auth=os.getenv('NOTION_TOKEN'))
    
    try:
        database_id = os.getenv('OFFERS_DATABASE_ID')
        response = await client.databases.retrieve(database_id=database_id)
        print("Notion connection successful!")
        print(f"Database title: {response['title'][0]['plain_text']}")
        assert response is not None
    except Exception as e:
        print(f"Connection failed: {str(e)}")
        assert False, f"Connection failed: {str(e)}"

if __name__ == "__main__":
    asyncio.run(test_notion_connection()) 