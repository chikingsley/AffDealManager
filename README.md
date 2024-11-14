# Affiliate Deal Manager Bot

A Telegram bot that helps manage and search affiliate deals. The bot integrates with Notion for data storage, Typesense for fast searching, and Redis for caching.

## Features

- 🔍 Inline search for deals by partner, geography, language, and funnel
- 🔄 Real-time synchronization with Notion database
- ⚡ Fast search powered by Typesense
- 💾 Redis caching for improved performance
- 🌐 Supports both polling and webhook modes

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- Notion API access
- Telegram Bot Token
- Redis
- Typesense

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AffDealManager.git
cd AffDealManager
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Generate required keys:
```bash
./scripts/generate_keys.sh
```

## Configuration

Create a `.env` file with the following variables:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
REDIS_URL=redis://localhost:6379
TYPESENSE_API_KEY=your_typesense_api_key
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
WEBHOOK_URL=your_webhook_url  # Optional, for webhook mode
```

## Usage

1. Start the services:
```bash
docker-compose up -d
```

2. Verify the environment:
```bash
python scripts/verify_env.py
```

3. Start the bot:
```bash
./scripts/start_bot.sh
```

## Bot Commands

- `/start` - Start the bot
- `/help` - Show help message
- `/status` - Check services status
- `/refresh` - Force refresh deal cache

## Development

### Testing

Run tests with pytest:
```bash
pytest
```

### Code Style

The project uses:
- Black for code formatting
- isort for import sorting
- mypy for type checking

Format code:
```bash
black .
isort .
mypy .
```

## Project Structure

```
├── data/               # Data directories for Redis and Typesense
├── scripts/            # Utility scripts
├── src/               
│   ├── bot/           # Telegram bot implementation
│   ├── config/        # Configuration settings
│   ├── models/        # Data models
│   └── services/      # Core services (Notion, Redis, Typesense)
└── tests/             # Test files
```

## Services

- **Notion Service**: Manages deal data in Notion database
- **Search Service**: Handles search functionality using Typesense
- **Cache Service**: Manages Redis caching for improved performance

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
