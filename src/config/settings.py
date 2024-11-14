"""Configuration management for the bot."""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Bot settings
    TELEGRAM_BOT_TOKEN: str
    
    # Notion settings
    NOTION_TOKEN: str
    OFFERS_DATABASE_ID: str
    ADVERTISERS_DATABASE_ID: str
    
    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Typesense settings
    TYPESENSE_API_KEY: str
    TYPESENSE_HOST: str = "localhost"
    TYPESENSE_PORT: str = "8108"
    TYPESENSE_PROTOCOL: str = "http"
    
    # Webhook settings
    WEBHOOK_URL: str = ""
    WEBHOOK_SECRET: str
    
    @property
    def TYPESENSE_NODES(self) -> List[dict]:
        return [{
            "host": self.TYPESENSE_HOST,
            "port": self.TYPESENSE_PORT,
            "protocol": self.TYPESENSE_PROTOCOL
        }]
    
    class Config:
        env_file = ".env"
        extra = "allow"