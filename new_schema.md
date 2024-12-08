-- 1. PARTNERS table
-- Purpose: Single source of truth for all external entities you work with
-- Opinion: Unified partner table is superior to separate customer/supplier tables
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_type VARCHAR(10) NOT NULL CHECK (partner_type IN ('CUSTOMER', 'SUPPLIER')),
    sub_type VARCHAR(15) NOT NULL CHECK (sub_type IN ('BRAND', 'AFFILIATE', 'MEDIA_BUYER', 'NETWORK')),
    name VARCHAR(255) NOT NULL,
    payment_fee DECIMAL(5,2),  -- Store as 2.50 for 2.5%
    main_contact VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    integrations JSONB,  -- Flexible integration settings
    payment_terms TEXT,
    notes TEXT,
    CONSTRAINT valid_partner_types CHECK (
        (partner_type = 'CUSTOMER' AND sub_type IN ('BRAND', 'AFFILIATE')) OR
        (partner_type = 'SUPPLIER' AND sub_type IN ('MEDIA_BUYER', 'NETWORK'))
    )
);

-- 2. GEO_INTERESTS table
-- Purpose: Track which partners are interested in which geos
-- Opinion: Separate table allows better querying of interests and historical tracking
CREATE TABLE geo_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    geo_code VARCHAR(10) NOT NULL,
    interest_level VARCHAR(20) CHECK (interest_level IN ('HIGH', 'MEDIUM', 'LOW', 'NONE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, geo_code)
);

-- 3. OFFERS table
-- Purpose: Core offers available for sale
-- Opinion: Separate versions table is crucial for historical accuracy
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES partners(id),
    name VARCHAR(255) NOT NULL,
    geo VARCHAR(10) NOT NULL,
    language VARCHAR(50),
    source VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'PAUSED', 'DEPRECATED')),
    current_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    requirements JSONB,  -- Flexible field for offer requirements
    restrictions TEXT
);

-- 4. OFFER_VERSIONS table
-- Purpose: Track historical changes to offer prices
-- Opinion: Essential for audit trail and historical accuracy
CREATE TABLE offer_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES offers(id),
    version INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,  -- Reference to users table if you have one
    UNIQUE(offer_id, version)
);

-- 5. OFFER_DISTRIBUTIONS table
-- Purpose: Track offer sharing and negotiation status with partners
-- Opinion: Separating this from deals allows better tracking of sales pipeline
CREATE TABLE offer_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES offers(id),
    partner_id UUID REFERENCES partners(id),
    status VARCHAR(20) CHECK (status IN ('SENT', 'NEGOTIATING', 'ACTIVE', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    negotiation_notes TEXT,
    last_contact_date TIMESTAMP WITH TIME ZONE
);

-- 6. DEALS table
-- Purpose: Actual agreed-upon deals
-- Opinion: Keep this focused on the commercial agreement, separate from performance
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_version_id UUID REFERENCES offer_versions(id),
    partner_id UUID REFERENCES partners(id),
    selling_price DECIMAL(10,2) NOT NULL,
    buying_price DECIMAL(10,2) NOT NULL,  -- From offer_version but can be overridden
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    payment_terms TEXT,
    special_conditions JSONB
);

-- 7. DEAL_SCHEDULES table
-- Purpose: Handle multiple dates/caps for same deal
-- Opinion: This is better than duplicating entire deals
CREATE TABLE deal_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id),
    schedule_date DATE NOT NULL,
    cap INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    notes TEXT,
    UNIQUE(deal_id, schedule_date)
);

-- 8. LEADS table
-- Purpose: Store actual lead data
-- Opinion: Keep this separate from performance metrics
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_schedule_id UUID REFERENCES deal_schedules(id),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('NEW', 'VERIFIED', 'INVALID', 'CONVERTED')),
    -- Additional fields
    raw_data JSONB,  -- Store complete raw lead data
    validation_results JSONB  -- Store validation details
);

-- 9. PAYMENTS table
-- Purpose: Track all financial transactions
-- Opinion: Separate from deals for better financial management
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('PREPAID', 'INVOICE')),
    status VARCHAR(20) CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    transaction_reference VARCHAR(255),
    payment_method VARCHAR(50),
    notes TEXT
);

-- 10. PAYMENT_ALLOCATIONS table
-- Purpose: Track how payments are used across deals
-- Opinion: Essential for accurate financial tracking
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id),
    deal_id UUID REFERENCES deals(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    notes TEXT
);

-- 11. PERFORMANCE_METRICS table
-- Purpose: Track actual performance data
-- Opinion: Separate from deals for better analytics and reporting
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    offer_id UUID REFERENCES offers(id),
    deal_id UUID REFERENCES deals(id),
    geo VARCHAR(10) NOT NULL,
    leads_received INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields
    conversion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN leads_received > 0 
        THEN (leads_converted::DECIMAL / leads_received * 100)
        ELSE 0 
        END
    ) STORED
);

-- Useful indexes for common queries
CREATE INDEX idx_partners_type ON partners(partner_type, sub_type);
CREATE INDEX idx_geo_interests_geo ON geo_interests(geo_code);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(period_start, period_end);