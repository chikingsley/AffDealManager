-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ENUMs
create type call_status as enum (
    'NEW', 
    'NoInterest',
    'DeniesRegistration',
    'NeverRegistered', 
    'Callback',
    'WrongNumber',
    'Hungup',
    'VoiceMail',
    'NoAnswer',
    'Appointment',
    'NotInterested',
    'LowPotential',
    'InvalidInfo'
);

create type deal_status as enum (
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
);

-- Create tables
create table brands (
    id uuid primary key default uuid_generate_v4(),
    notion_id text unique,  
    name text not null,
    payment_fee decimal,
    geos_interest text[],
    integrations text,
    main_telegram text,
    status text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_synced_at timestamptz  
);

create table offers (
    id uuid primary key default uuid_generate_v4(),
    notion_id text unique,  
    geo text not null,
    brand_id uuid references brands(id),
    language text[],
    sources text[],
    funnels text[],
    cpa_buying decimal,
    crg_buying decimal,
    cpl_buying decimal,
    cpa_selling decimal,
    crg_selling decimal,
    cpl_selling decimal,
    final_deduction decimal,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_synced_at timestamptz  
);

create table deals (
    id uuid primary key default uuid_generate_v4(),
    notion_id text unique,  
    offer_id uuid references offers(id),
    deal_date date not null,
    cap integer,
    leads_received integer default 0,
    ftds integer default 0,
    working_hours_start time,
    working_hours_end time,
    prepay_amount decimal,
    prepay_received decimal,
    status deal_status default 'ACTIVE',  
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_synced_at timestamptz  
);

create table leads (
    id uuid primary key default uuid_generate_v4(),
    deal_id uuid references deals(id),
    email text,
    phone text,
    country_code text,
    traffic_source text,
    status call_status default 'NEW',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table lead_matching_rules (
    id uuid primary key default uuid_generate_v4(),
    offer_id uuid references offers(id),
    geo_pattern text,
    language_pattern text,
    source_pattern text,
    priority integer default 1,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes
create index idx_offers_brand on offers(brand_id);
create index idx_deals_offer on deals(offer_id);
create index idx_leads_deal on leads(deal_id);
create index idx_leads_country on leads(country_code);
create index idx_leads_status on leads(status);
create index idx_notion_brand on brands(notion_id);
create index idx_notion_offer on offers(notion_id);
create index idx_notion_deal on deals(notion_id);