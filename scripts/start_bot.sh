#!/bin/bash

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Check if Typesense is running
echo "Checking Typesense..."
max_retries=10
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if curl -s http://localhost:8108/health > /dev/null; then
        echo "Typesense is running"
        break
    fi
    echo "Waiting for Typesense... (attempt $((retry_count + 1))/$max_retries)"
    sleep 2
    retry_count=$((retry_count + 1))
done

if [ $retry_count -eq $max_retries ]; then
    echo "Error: Typesense is not responding"
    exit 1
fi

# Start localtunnel and get URL
echo "Starting localtunnel..."
lt --port 8443 > tunnel.txt &
LT_PID=$!
sleep 5

# Get the URL from tunnel output
TUNNEL_URL=$(grep -o 'https://.*' tunnel.txt | tr -d '\n')
if [ -z "$TUNNEL_URL" ]; then
    echo "Failed to get tunnel URL"
    kill $LT_PID
    exit 1
fi

echo "Tunnel URL: $TUNNEL_URL"
echo "Updating .env with webhook URL..."

# Update .env with webhook URL (OS-independent)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|WEBHOOK_URL=.*|WEBHOOK_URL=$TUNNEL_URL|" .env
else
    # Linux
    sed -i "s|WEBHOOK_URL=.*|WEBHOOK_URL=$TUNNEL_URL|" .env
fi

# Verify .env update
echo "Current webhook URL in .env:"
grep "WEBHOOK_URL=" .env

# Run tests to verify services
echo "Running service tests..."
python -m pytest

# Start the bot with proper Python path
echo "Starting bot..."
PYTHONPATH=$PYTHONPATH:$(pwd) python src/main.py

# Cleanup function
cleanup() {
    echo "Cleaning up..."
    kill $LT_PID 2>/dev/null
    rm tunnel.txt 2>/dev/null
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Wait for the bot process
wait $! 