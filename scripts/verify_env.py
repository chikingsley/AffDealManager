from dotenv import load_dotenv
import os

def verify_env():
    load_dotenv()
    
    required_vars = [
        'TELEGRAM_BOT_TOKEN',
        'NOTION_TOKEN',
        'OFFERS_DATABASE_ID',
        'ADVERTISERS_DATABASE_ID',
        'TYPESENSE_API_KEY',
        'REDIS_HOST',
        'REDIS_PORT'
    ]
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print("❌ Missing environment variables:")
        for var in missing:
            print(f"  - {var}")
    else:
        print("✅ All required environment variables are set")
        
    # Print current values (masked for sensitive data)
    print("\nCurrent configuration:")
    for var in required_vars:
        value = os.getenv(var, '')
        if var in ['TELEGRAM_BOT_TOKEN', 'NOTION_TOKEN', 'TYPESENSE_API_KEY']:
            masked = value[:4] + '...' + value[-4:] if value else 'Not set'
            print(f"{var}: {masked}")
        else:
            print(f"{var}: {value}")

if __name__ == "__main__":
    verify_env() 