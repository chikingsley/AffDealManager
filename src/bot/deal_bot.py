"""Main bot implementation."""
from telegram import Update, InlineQueryResultArticle, InputTextMessageContent, BotCommand
from telegram.ext import Application, CommandHandler, InlineQueryHandler, CallbackContext
from typing import List
import asyncio
import logging
from datetime import datetime
import ssl
from pathlib import Path

from src.services.search_service import SearchService
from src.services.cache_service import CacheService
from src.config.settings import Settings
from src.services.notion_service import NotionService
from src.models.exceptions import NotionSyncError, SearchError, CacheError

logger = logging.getLogger(__name__)

class DealBot:
    def __init__(self, settings: Settings):
        # Initialize bot application with defaults
        self.app = (
            Application.builder()
            .token(settings.TELEGRAM_BOT_TOKEN)
            # Add recommended defaults
            .concurrent_updates(True)  # Allow concurrent updates
            .arbitrary_callback_data(True)  # Better callback data handling
            .post_init(self.post_init)  # Setup after initialization
            .build()
        )
        
        # Services
        self.settings = settings
        self.notion_service = NotionService(settings)
        self.search_service = SearchService(settings)
        self.cache_service = CacheService(settings)
        
        # Sync interval in seconds (5 minutes)
        self.sync_interval = 300
        
        # Register handlers in order of priority
        self.register_handlers()
        
        self._running = False
        self._scheduler_task = None

    def register_handlers(self):
        """Register handlers in proper order."""
        self.app.add_handler(CommandHandler("start", self.handle_start))
        self.app.add_handler(CommandHandler("help", self.handle_help))
        self.app.add_handler(CommandHandler("status", self.handle_status))
        self.app.add_handler(CommandHandler("refresh", self.handle_refresh))
        self.app.add_handler(InlineQueryHandler(self.handle_inline_query))
        
        # Add error handler
        self.app.add_error_handler(self.error_handler)

    async def post_init(self, application: Application) -> None:
        """Post initialization hook."""
        await application.bot.set_my_commands([
            BotCommand("start", "Start the bot"),
            BotCommand("help", "Show help message"),
            BotCommand("status", "Check bot status"),
            BotCommand("refresh", "Refresh deal data")
        ])
        
        # Perform initial sync after bot is initialized
        await self.sync_notion_data()

    async def error_handler(self, update: Update, context: CallbackContext) -> None:
        """Handle errors."""
        logger.error(f"Update {update} caused error {context.error}")

    async def run_polling(self):
        """Start the bot in polling mode."""
        try:
            self._running = True
            
            # Initial sync
            await self.sync_notion_data()
            
            # Start bot in polling mode
            logger.info("Starting bot in polling mode...")
            
            # Initialize application
            await self.app.initialize()
            await self.app.start()
            
            # Start sync scheduler
            logger.info("Starting sync scheduler...")
            self._scheduler_task = asyncio.create_task(self.start_sync_scheduler())
            
            # Start polling
            await self.app.updater.start_polling(
                drop_pending_updates=True,
                allowed_updates=["message", "inline_query", "callback_query"]
            )
            
            # Keep running until stopped
            while self._running:
                await asyncio.sleep(1)
                
        except asyncio.CancelledError:
            logger.info("Bot received shutdown signal")
        except Exception as e:
            logger.error(f"Bot startup failed: {str(e)}", exc_info=True)
            raise
        finally:
            await self.shutdown()

    async def run_webhook(self, port: int = 8443):
        """Start the bot in webhook mode."""
        try:
            self._running = True
            
            # Initial sync
            await self.sync_notion_data()
            
            # Start sync scheduler
            self._scheduler_task = asyncio.create_task(self.start_sync_scheduler())
            
            # Start bot in webhook mode
            logger.info("Starting bot in webhook mode...")
            await self.app.initialize()
            await self.app.start()
            
            # Set webhook
            webhook_url = f"{self.settings.WEBHOOK_URL}/{self.settings.TELEGRAM_BOT_TOKEN}"
            await self.app.bot.set_webhook(
                url=webhook_url,
                allowed_updates=["message", "inline_query", "callback_query"]
            )
            
            # Start webhook server
            await self.app.run_webhook(
                listen="0.0.0.0",
                port=port,
                url_path=self.settings.TELEGRAM_BOT_TOKEN,
                webhook_url=webhook_url
            )
            
        except asyncio.CancelledError:
            logger.info("Bot received shutdown signal")
        except Exception as e:
            logger.error(f"Bot startup failed: {str(e)}", exc_info=True)
            raise
        finally:
            await self.shutdown()

    async def shutdown(self):
        """Clean shutdown of bot and services."""
        logger.info("Starting bot shutdown...")
        self._running = False
        
        try:
            # Cancel scheduler if running
            if self._scheduler_task:
                logger.info("Sync scheduler cancelled")
                self._scheduler_task.cancel()
                try:
                    await self._scheduler_task
                except asyncio.CancelledError:
                    pass
            
            # Stop the application
            if self.app.running:
                logger.info("Stopping application...")
                await self.app.stop()
                await self.app.shutdown()
            
            # Close Redis connections
            logger.info("Closing Redis connections...")
            await self.cache_service.close()
            
            logger.info("Bot shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {str(e)}", exc_info=True)

    async def handle_inline_query(self, update: Update, context: CallbackContext) -> None:
        """Handle inline queries with automatic filtering."""
        query = update.inline_query.query.strip()
        
        try:
            # Get results from cache or search
            results = await self.cache_service.get_search_results(query)
            
            if not results:
                results = await self.search_service.search_deals(query)
                await self.cache_service.cache_search_results(query, results)
            
            # Format results
            inline_results = self._format_inline_results(results)
            
            await update.inline_query.answer(
                inline_results,
                cache_time=300,  # Cache results on Telegram for 5 minutes
                is_personal=True
            )
            
        except Exception as e:
            logger.error(f"Error handling inline query: {str(e)}", exc_info=True)
            await update.inline_query.answer([])
    
    def _format_inline_results(self, deals: List[dict]) -> List[InlineQueryResultArticle]:
        """Format deals as inline results."""
        return [
            InlineQueryResultArticle(
                id=deal["id"],
                title=deal["formatted_display"],
                description=deal["formatted_funnels"],
                thumbnail_url=f"https://flagsapi.com/{deal['geo']}/flat/64.png",
                thumbnail_width=64,
                thumbnail_height=64,
                input_message_content=InputTextMessageContent(
                    message_text=f"{deal['formatted_display']}\n{deal['formatted_funnels']}"
                )
            )
            for deal in deals
        ]
    
    def _format_deal_message(self, deal: dict) -> str:
        """Format deal for message display."""
        return (
            f"{deal['partner']} [{', '.join(deal['sources'])}] {deal['geo']} {deal['language']} {deal['price']}\n"
            f"Funnels: {', '.join(deal.get('funnels', ['No funnels specified']))}"
        )
    
    async def handle_start(self, update: Update, context: CallbackContext) -> None:
        """Handle /start command."""
        welcome_text = (
            "👋 Welcome to the Deals Search Bot!\n\n"
            "Use inline mode to search deals:\n"
            "1. Type @your_bot_name in any chat\n"
            "2. Enter your search terms\n\n"
            "You can search by:\n"
            "• Partner name\n"
            "• Geography\n"
            "• Language\n"
            "• Funnel name\n"
            "• Price\n\n"
            "Type /help for more information."
        )
        await update.message.reply_text(welcome_text)

    async def handle_help(self, update: Update, context: CallbackContext) -> None:
        """Handle /help command."""
        help_text = (
            "🔍 *Search Tips:*\n"
            "• Type @your_bot_name followed by your search\n"
            "• Search examples:\n"
            "  - Partner: `Amazon`\n"
            "  - Geography: `US`\n"
            "  - Language: `EN`\n"
            "  - Funnel: `Dating`\n\n"
            "📋 *Commands:*\n"
            "/start - Start the bot\n"
            "/help - Show this help message\n"
            "/status - Check services status\n"
            "/refresh - Force refresh cache\n\n"
            "💡 *Tips:*\n"
            "• Results update every 5 minutes\n"
            "• Use specific terms for better results"
        )
        await update.message.reply_text(help_text, parse_mode='Markdown')

    async def handle_status(self, update: Update, context: CallbackContext) -> None:
        """Handle the /status command."""
        try:
            # Check Redis
            redis_status = "✅" if await self.cache_service.is_healthy() else "❌"
            
            # Check Notion
            notion_status = "✅" if await self.notion_service.is_healthy() else "❌"
            
            # Check Typesense
            typesense_status = "✅" if await self.search_service.is_healthy() else "❌"
            
            # Get last sync time
            last_sync = getattr(self, '_last_sync_time', None)
            last_sync_str = last_sync.strftime("%Y-%m-%d %H:%M:%S") if last_sync else "Never"
            
            status_message = (
                "🤖 Bot Status\n\n"
                f"Cache (Redis): {redis_status}\n"
                f"Database (Notion): {notion_status}\n"
                f"Search (Typesense): {typesense_status}\n\n"
                f"Last sync: {last_sync_str}"
            )
            
            await update.message.reply_text(status_message)
            
        except Exception as e:
            logger.error(f"Error in status command: {str(e)}", exc_info=True)
            await update.message.reply_text("❌ Error checking status")

    async def handle_refresh(self, update: Update, context: CallbackContext) -> None:
        """Handle /refresh command."""
        try:
            await update.message.reply_text("🔄 Refreshing deals cache...")
            await self.sync_notion_data()
            await update.message.reply_text("✅ Refresh complete!")
        except Exception as e:
            logger.error(f"Refresh failed: {str(e)}", exc_info=True)
            await update.message.reply_text("❌ Refresh failed")

    async def _check_redis(self) -> bool:
        """Check Redis connection."""
        try:
            await self.cache_service.redis.ping()
            return True
        except Exception:
            return False

    async def _check_notion(self) -> bool:
        """Check Notion connection."""
        try:
            await self.notion_service.client.databases.retrieve(
                database_id=self.notion_service.database_id
            )
            return True
        except Exception:
            return False

    async def _check_typesense(self) -> bool:
        """Check Typesense connection."""
        try:
            self.search_service.client.health.get()
            return True
        except Exception:
            return False

    def _get_last_sync_time(self) -> str:
        """Get formatted last sync time."""
        if hasattr(self, '_last_sync_time'):
            return self._last_sync_time.strftime('%Y-%m-%d %H:%M:%S')
        return "Never"
    
    async def sync_notion_data(self):
        """Sync data from Notion to search index."""
        try:
            logger.info("Starting Notion sync...")
            
            # Get deals from Notion
            deals = await self.notion_service.sync_deals()
            logger.info(f"Retrieved {len(deals)} deals from Notion")
            
            # Update search index
            await self.search_service.update_index(deals)
            logger.info("Updated search index")
            
            # Clear search cache
            await self.cache_service.clear_search_cache()
            logger.info("Cleared search cache")
            
            # Update last sync time
            self._last_sync_time = datetime.now()
            
            logger.info(f"Successfully synced {len(deals)} deals")
            
        except Exception as e:
            logger.error(f"Sync failed: {str(e)}", exc_info=True)
            raise

    async def start_sync_scheduler(self):
        """Schedule periodic syncs."""
        logger.info(f"Starting sync scheduler (interval: {self.sync_interval}s)")
        while self._running:
            try:
                await asyncio.sleep(self.sync_interval)
                if self._running:  # Check again after sleep
                    logger.info("Running scheduled sync...")
                    await self.sync_notion_data()
            except asyncio.CancelledError:
                logger.info("Sync scheduler cancelled")
                break
            except Exception as e:
                logger.error(f"Error in sync scheduler: {str(e)}")
                await asyncio.sleep(10)  # Wait before retrying
