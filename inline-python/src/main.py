"""Main entry point for the bot."""
import asyncio
import logging
import signal
import sys
import argparse
from pathlib import Path
from typing import Set, Optional

# Add src to Python path
src_path = str(Path(__file__).parent.parent)
sys.path.append(src_path)

from src.config.settings import Settings
from src.bot.deal_bot import DealBot

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("bot.log")
    ]
)

# Reduce noise from other libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("apscheduler").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

def handle_exception(loop: asyncio.AbstractEventLoop, context: dict) -> None:
    """Handle exceptions in the event loop."""
    msg = context.get("exception", context["message"])
    logger.error(f"Unhandled exception: {msg}")

async def main() -> None:
    """Start the bot."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the Deals Bot')
    parser.add_argument('--mode', 
                       choices=['polling', 'webhook'],
                       default='polling',
                       help='Bot running mode (default: polling)')
    parser.add_argument('--port',
                       type=int,
                       default=8443,
                       help='Port for webhook server (default: 8443)')
    args = parser.parse_args()

    # Get the current event loop
    loop = asyncio.get_running_loop()
    loop.set_exception_handler(handle_exception)
    
    # Store stop signals
    signals: Set[signal.Signals] = {signal.SIGINT, signal.SIGTERM}
    bot: Optional[DealBot] = None
    
    try:
        # Load settings
        settings = Settings()
        
        # Initialize bot
        bot = DealBot(settings)
        
        # Add signal handlers
        for sig in signals:
            loop.add_signal_handler(
                sig,
                lambda s=sig: asyncio.create_task(shutdown(loop, s, bot))
            )
        
        # Run the bot in specified mode
        if args.mode == 'webhook':
            await bot.run_webhook(port=args.port)
        else:
            await bot.run_polling()
        
    except Exception as e:
        logger.error(f"Bot error: {str(e)}", exc_info=True)
        if bot:
            await bot.shutdown()
    finally:
        logger.info("Bot shutdown complete")

async def shutdown(loop: asyncio.AbstractEventLoop, signal: signal.Signals, bot: Optional[DealBot]) -> None:
    """Handle shutdown gracefully."""
    logger.info(f"Received exit signal {signal.name}...")
    
    if bot:
        await bot.shutdown()
    
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    for task in tasks:
        task.cancel()
    
    logger.info(f"Cancelling {len(tasks)} outstanding tasks")
    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
