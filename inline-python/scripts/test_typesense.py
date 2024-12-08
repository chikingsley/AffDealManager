import sys
from pathlib import Path
import typesense
import logging

# Add src to Python path
src_path = str(Path(__file__).parent.parent)
sys.path.append(src_path)

from src.config.settings import Settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_typesense_connection():
    """Test connection to Typesense."""
    settings = Settings()
    
    # Log configuration
    logger.info(f"Typesense config: {settings.TYPESENSE_NODES}")
    
    client = typesense.Client({
        'api_key': settings.TYPESENSE_API_KEY,
        'nodes': settings.TYPESENSE_NODES,
        'connection_timeout_seconds': 2
    })

    try:
        # Try to get health status
        logger.info("Checking Typesense health...")
        health = client.operations.is_healthy()
        if health:
            logger.info("✅ Typesense connection successful")
            return True
        else:
            logger.error("❌ Typesense is not healthy")
            return False
    except Exception as e:
        logger.error(f"❌ Connection failed: {str(e)}")
        logger.debug("Error details:", exc_info=True)
        return False

if __name__ == "__main__":
    test_typesense_connection() 