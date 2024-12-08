#!/bin/bash

# Create data directories
mkdir -p data/typesense
mkdir -p data/redis

# Generate Typesense API key
TYPESENSE_API_KEY=$(openssl rand -hex 32)

# Create/update .env file
if [ -f .env ]; then
    # Update existing TYPESENSE_API_KEY
    sed -i.bak "/TYPESENSE_API_KEY=/c\TYPESENSE_API_KEY=$TYPESENSE_API_KEY" .env
else
    # Create new .env file
    cat > .env << EOF
TELEGRAM_BOT_TOKEN=your_bot_token_here
NOTION_API_KEY=your_notion_key_here
NOTION_DATABASE_ID=your_database_id_here
TYPESENSE_API_KEY=$TYPESENSE_API_KEY
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
fi

echo "Generated Typesense API key: $TYPESENSE_API_KEY"
echo "Please update other values in .env file with your credentials" 