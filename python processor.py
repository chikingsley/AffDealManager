# processor.py
import json
from supabase import create_client
from datetime import datetime

# Initialize Supabase client
SUPABASE_URL = 'your-supabase-url'
SUPABASE_KEY = 'your-supabase-key'
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def process_brands(brands_json):
    brands = brands_json.get('properties', [])
    
    transformed_brands = []
    for brand in brands:
        props = brand.get('properties', {})
        transformed_brands.append({
            'name': props.get('Affiliate | Brand', {}).get('title', [{}])[0].get('plain_text', ''),
            'payment_fee': props.get('Payment Fee', {}).get('number', 0),
            'geos_interest': [g['name'] for g in props.get('GEOs Interest', {}).get('multi_select', [])],
            'integrations': props.get('Integrations', {}).get('rich_text', [{}])[0].get('plain_text', ''),
            'main_telegram': props.get('Main Telegram', {}).get('rich_text', [{}])[0].get('plain_text', ''),
            'status': props.get('Status', {}).get('select', {}).get('name', '')
        })
    
    response = supabase.table('brands').insert(transformed_brands).execute()
    if hasattr(response, 'error') and response.error:
        print(f"Error inserting brands: {response.error}")
    else:
        print(f"Inserted {len(transformed_brands)} brands")

def process_offers(offers_json):
    offers = offers_json.get('properties', [])
    
    transformed_offers = []
    for offer in offers:
        props = offer.get('properties', {})
        transformed_offers.append({
            'geo': props.get('GEO', {}).get('formula', {}).get('string', ''),
            'brand_id': props.get('⚡ ALL ADVERTISERS | Kitchen', {}).get('relation', [{}])[0].get('id'),
            'language': [l['name'] for l in props.get('Language', {}).get('multi_select', [])],
            'sources': [s['name'] for s in props.get('Sources', {}).get('multi_select', [])],
            'funnels': [f['name'] for f in props.get('Funnels', {}).get('multi_select', [])],
            'cpa_buying': props.get('CPA | Buying', {}).get('number'),
            'crg_buying': props.get('CRG | Buying', {}).get('number'),
            'cpl_buying': props.get('CPL | Buying', {}).get('formula', {}).get('number'),
            'cpa_selling': props.get('CPA | Brand | Selling', {}).get('number'),
            'crg_selling': props.get('CRG | Brand | Selling', {}).get('number'),
            'cpl_selling': props.get('CPL brand sell manual', {}).get('number'),
            'final_deduction': props.get('Final Deduction %', {}).get('formula', {}).get('number')
        })
    
    response = supabase.table('offers').insert(transformed_offers).execute()
    if hasattr(response, 'error') and response.error:
        print(f"Error inserting offers: {response.error}")
    else:
        print(f"Inserted {len(transformed_offers)} offers")

def process_deals(deals_json):
    deals = deals_json.get('properties', [])
    
    transformed_deals = []
    for deal in deals:
        props = deal.get('properties', {})
        transformed_deals.append({
            'deal_date': props.get('Deal Date', {}).get('date', {}).get('start'),
            'cap': props.get('cap', {}).get('number', 0),
            'leads_received': props.get('Leads Recieved', {}).get('number', 0),
            'ftds': props.get('FTDs', {}).get('number', 0),
            'working_hours_start': props.get('WH Start', {}).get('date', {}).get('start'),
            'working_hours_end': props.get('WH End', {}).get('date', {}).get('end'),
            'prepay_amount': props.get('Prepay Owed (no fee)', {}).get('formula', {}).get('number', 0),
            'prepay_received': props.get('Prepay Received', {}).get('number', 0)
        })
    
    response = supabase.table('deals').insert(transformed_deals).execute()
    if hasattr(response, 'error') and response.error:
        print(f"Error inserting deals: {response.error}")
    else:
        print(f"Inserted {len(transformed_deals)} deals")

def main():
    try:
        # Load JSON files
        with open('ALL BRANDS | Kitchen.json', 'r') as f:
            brands_json = json.load(f)
        with open('Individual OFFERS | Kitchen.json', 'r') as f:
            offers_json = json.load(f)
        with open('ALL DEALS | Kitchen.json', 'r') as f:
            deals_json = json.load(f)

        # Process in sequence to maintain referential integrity
        process_brands(brands_json)
        process_offers(offers_json)
        process_deals(deals_json)

    except Exception as e:
        print(f"Error processing files: {e}")

if __name__ == "__main__":
    main()