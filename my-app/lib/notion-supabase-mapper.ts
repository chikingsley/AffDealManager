import { 
  Offer, 
  Deal, 
  Advertiser, 
  Brand,
  NotionPropertyValue,
  NotionDatabase
} from '../types/schema';

// Helper functions for extracting Notion values
function getNotionText(prop: NotionPropertyValue | undefined): string {
  if (!prop || !('rich_text' in prop)) return '';
  return prop.rich_text.map(t => t.text.content).join('');
}

function getNotionTitle(prop: NotionPropertyValue | undefined): string {
  if (!prop || !('title' in prop)) return '';
  return prop.title.map(t => t.text.content).join('');
}

function getNotionNumber(prop: NotionPropertyValue | undefined): number | null {
  if (!prop || !('number' in prop)) return null;
  return prop.number;
}

function getNotionSelect(prop: NotionPropertyValue | undefined): string | null {
  if (!prop || !('select' in prop)) return null;
  return prop.select?.name || null;
}

function getNotionMultiSelect(prop: NotionPropertyValue | undefined): string[] {
  if (!prop || !('multi_select' in prop)) return [];
  return prop.multi_select.map(item => item.name);
}

function getNotionDate(prop: NotionPropertyValue | undefined): string | null {
  if (!prop || !('date' in prop)) return null;
  return prop.date?.start || null;
}

function getNotionBoolean(prop: NotionPropertyValue | undefined): boolean {
  if (!prop || !('checkbox' in prop)) return false;
  return prop.checkbox;
}

function getNotionRelation(prop: NotionPropertyValue | undefined): string[] {
  if (!prop || !('relation' in prop)) return [];
  return prop.relation.map(rel => rel.id);
}

// Mapping functions for Offers
export function mapNotionToSupabaseOffer(notionProperties: Record<string, NotionPropertyValue>): Partial<Offer> {
  return {
    brand_id: getNotionRelation(notionProperties['Brand'])?.[0] || null,
    advertiser_id: getNotionRelation(notionProperties['Advertiser'])?.[0] || null,
    
    // CRs and Metrics
    cr_last_week_told: getNotionText(notionProperties['CR last week told to us']),
    cr_last_week_say: getNotionText(notionProperties['CR last week we say']),
    expected_cr: getNotionText(notionProperties['Expected CR']),
    
    // Buying Prices
    cpa_buying: getNotionNumber(notionProperties['CPA | Buying']),
    cpl_buying: getNotionNumber(notionProperties['CPL | Buying']),
    crg_buying: getNotionNumber(notionProperties['CRG | Buying']),
    
    // Network Selling Prices
    cpa_network_selling: getNotionNumber(notionProperties['CPA | Network | Selling']),
    cpl_network_selling: getNotionNumber(notionProperties['CPL | Network | Selling']),
    crg_network_selling: getNotionNumber(notionProperties['CRG | Network | Selling']),
    
    // Brand Selling Prices
    cpa_brand_selling: getNotionNumber(notionProperties['CPA | Brand | Selling']),
    cpl_brand_selling: getNotionNumber(notionProperties['CPL | Brand | Selling']),
    crg_brand_selling: getNotionNumber(notionProperties['CRG | Brand | Selling']),
    
    // PPLs and Profit
    ppl_network: getNotionText(notionProperties['PPL | Network']),
    ppl_brand: getNotionText(notionProperties['PPL | Brand']),
    percent_profit_brand: getNotionNumber(notionProperties['percent profit brand']),
    
    // Status and Flags
    priority_status: getNotionBoolean(notionProperties['Priority Status']),
    active_status: getNotionSelect(notionProperties['Active Status`']),
    latam: getNotionBoolean(notionProperties['LATAM']),
    
    // Notes
    notes_for_customers: getNotionText(notionProperties['notes for customers']),
    notes_for_us: getNotionText(notionProperties['! Notes for us ! ']),
    lpd: getNotionText(notionProperties['LPD']),
    
    // Location and Configuration
    language: getNotionMultiSelect(notionProperties['Language']),
    sources: getNotionMultiSelect(notionProperties['Sources']),
    funnels: getNotionMultiSelect(notionProperties['Funnels']),
    
    // Relations
    all_advertisers_kitchen: getNotionRelation(notionProperties['⚡ ALL ADVERTISERS | Kitchen']),
    all_deals_kitchen: getNotionRelation(notionProperties['⭐ ALL DEALS | Kitchen']),
    tm_affiliates_to_sell: getNotionRelation(notionProperties['™️ ALL AFFILIATES (to sell)']),
    funnel_change: getNotionMultiSelect(notionProperties['Funnel Change'])
  };
}

// Mapping functions for Deals
export function mapNotionToSupabaseDeal(notionProperties: Record<string, NotionPropertyValue>): Partial<Deal> {
  return {
    brand_id: getNotionRelation(notionProperties['Brand'])?.[0] || null,
    offer_id: getNotionRelation(notionProperties['Offer'])?.[0] || null,
    advertiser_id: getNotionRelation(notionProperties['Advertiser'])?.[0] || null,
    
    // Status and Dates
    deal_status: getNotionSelect(notionProperties['Deal Status']) || '',
    deal_date: getNotionDate(notionProperties['Deal Date']) || '',
    deal_confirmation_status: getNotionSelect(notionProperties['Deal Confirmation Status']) || '',
    
    // Metrics
    cap: getNotionNumber(notionProperties['Cap']),
    crg: getNotionNumber(notionProperties['CRG']),
    cpa: getNotionNumber(notionProperties['CPA']),
    cpl: getNotionNumber(notionProperties['CPL']),
    
    // Financial
    buying_cpa: getNotionNumber(notionProperties['Buying CPA']),
    buying_cpl: getNotionNumber(notionProperties['Buying CPL']),
    buying_crg: getNotionNumber(notionProperties['Buying CRG']),
    payment_fee: getNotionNumber(notionProperties['Payment Fee']),
    
    // Working Hours
    wh_start: getNotionDate(notionProperties['WH Start']),
    wh_end: getNotionDate(notionProperties['WH End']),
    
    // Arrays
    tm_all_customers: getNotionRelation(notionProperties['TM All Customers']),
    individual_offers_kitchen: getNotionRelation(notionProperties['Individual Offers Kitchen'])
  };
}

// Mapping functions for Advertisers
export function mapNotionToSupabaseAdvertiser(notionProperties: Record<string, NotionPropertyValue>): Partial<Advertiser> {
  return {
    name: getNotionTitle(notionProperties['Name']),
    
    // Status and Contact
    status: getNotionSelect(notionProperties['Status']) || '',
    main_contact: getNotionText(notionProperties['Main Contact']),
    
    // Financial
    payment_fee: getNotionNumber(notionProperties['Payment Fee']),
    deduction_advertiser: getNotionNumber(notionProperties['Deduction % | Advertiser']),
    
    // Relations
    brand_id: getNotionRelation(notionProperties['Brand'])?.[0] || null,
    
    // Kitchen Relations
    kitchen_funnels: getNotionRelation(notionProperties['🥮 Kitchen FUNNELS'])
  };
}

// Mapping functions for Brands
export function mapNotionToSupabaseBrand(notionProperties: Record<string, NotionPropertyValue>): Partial<Brand> {
  return {
    brand_name: getNotionTitle(notionProperties['Name']),
    notion_id: notionProperties['id']?.toString() || null,
    affiliate_link: getNotionText(notionProperties['Affiliate Link']),
    status: getNotionSelect(notionProperties['Status']) || null,
    description: getNotionText(notionProperties['Description']),
    notes: getNotionText(notionProperties['Notes'])
  };
}

export function mapSupabaseToNotionOffer(supabaseOffer: Offer): Record<string, NotionPropertyValue> {
  // Validate required fields
  const requiredFields: (keyof Offer)[] = ['brand_id', 'advertiser_id'];
  if (!validateSupabaseRecord(supabaseOffer, requiredFields)) {
    throw new Error('Missing required fields in Supabase Offer');
  }

  return {
    'Brand': createNotionRelation(supabaseOffer.brand_id ? [supabaseOffer.brand_id] : []),
    'Advertiser': createNotionRelation(supabaseOffer.advertiser_id ? [supabaseOffer.advertiser_id] : []),
    
    // CRs and Metrics
    'CR last week told to us': createNotionText(supabaseOffer.cr_last_week_told),
    'CR last week we say': createNotionText(supabaseOffer.cr_last_week_say),
    'Expected CR': createNotionText(supabaseOffer.expected_cr),
    
    // Buying Prices
    'CPA | Buying': createNotionNumber(supabaseOffer.cpa_buying),
    'CPL | Buying': createNotionNumber(supabaseOffer.cpl_buying),
    'CRG | Buying': createNotionNumber(supabaseOffer.crg_buying),
    
    // Network Selling Prices
    'CPA | Network | Selling': createNotionNumber(supabaseOffer.cpa_network_selling),
    'CPL | Network | Selling': createNotionNumber(supabaseOffer.cpl_network_selling),
    'CRG | Network | Selling': createNotionNumber(supabaseOffer.crg_network_selling),
    
    // Brand Selling Prices
    'CPA | Brand | Selling': createNotionNumber(supabaseOffer.cpa_brand_selling),
    'CPL | Brand | Selling': createNotionNumber(supabaseOffer.cpl_brand_selling),
    'CRG | Brand | Selling': createNotionNumber(supabaseOffer.crg_brand_selling),
    
    // PPLs and Profit
    'PPL | Network': createNotionText(supabaseOffer.ppl_network),
    'PPL | Brand': createNotionText(supabaseOffer.ppl_brand),
    'percent profit brand': createNotionNumber(supabaseOffer.percent_profit_brand),
    
    // Status and Flags
    'Priority Status': createNotionBoolean(supabaseOffer.priority_status || false),
    'Active Status`': createNotionSelect(supabaseOffer.active_status),
    'LATAM': createNotionBoolean(supabaseOffer.latam || false),
    
    // Notes
    'notes for customers': createNotionText(supabaseOffer.notes_for_customers),
    '! Notes for us ! ': createNotionText(supabaseOffer.notes_for_us),
    'LPD': createNotionText(supabaseOffer.lpd),
    
    // Location and Configuration
    'Language': createNotionMultiSelect(supabaseOffer.language || []),
    'Sources': createNotionMultiSelect(supabaseOffer.sources || []),
    'Funnels': createNotionMultiSelect(supabaseOffer.funnels || []),
    
    // Relations
    '⚡ ALL ADVERTISERS | Kitchen': createNotionRelation(supabaseOffer.all_advertisers_kitchen || []),
    '⭐ ALL DEALS | Kitchen': createNotionRelation(supabaseOffer.all_deals_kitchen || []),
    '™️ ALL AFFILIATES (to sell)': createNotionRelation(supabaseOffer.tm_affiliates_to_sell || []),
    'Funnel Change': createNotionMultiSelect(supabaseOffer.funnel_change || [])
  };
}

export function mapSupabaseToNotionDeal(supabaseDeal: Deal): Record<string, NotionPropertyValue> {
  // Validate required fields
  const requiredFields: (keyof Deal)[] = ['brand_id', 'offer_id', 'advertiser_id'];
  if (!validateSupabaseRecord(supabaseDeal, requiredFields)) {
    throw new Error('Missing required fields in Supabase Deal');
  }

  return {
    'Brand': createNotionRelation(supabaseDeal.brand_id ? [supabaseDeal.brand_id] : []),
    'Offer': createNotionRelation(supabaseDeal.offer_id ? [supabaseDeal.offer_id] : []),
    'Advertiser': createNotionRelation(supabaseDeal.advertiser_id ? [supabaseDeal.advertiser_id] : []),
    
    // Status and Dates
    'Deal Status': createNotionSelect(supabaseDeal.deal_status),
    'Deal Date': createNotionDate(supabaseDeal.deal_date),
    'Deal Confirmation Status': createNotionSelect(supabaseDeal.deal_confirmation_status),
    
    // Metrics
    'Cap': createNotionNumber(supabaseDeal.cap),
    'CRG': createNotionNumber(supabaseDeal.crg),
    'CPA': createNotionNumber(supabaseDeal.cpa),
    'CPL': createNotionNumber(supabaseDeal.cpl),
    
    // Financial
    'Buying CPA': createNotionNumber(supabaseDeal.buying_cpa),
    'Buying CPL': createNotionNumber(supabaseDeal.buying_cpl),
    'Buying CRG': createNotionNumber(supabaseDeal.buying_crg),
    'Payment Fee': createNotionNumber(supabaseDeal.payment_fee),
    
    // Working Hours
    'WH Start': createNotionDate(supabaseDeal.wh_start),
    'WH End': createNotionDate(supabaseDeal.wh_end),
    
    // Arrays
    'TM All Customers': createNotionRelation(supabaseDeal.tm_all_customers || []),
    'Individual Offers Kitchen': createNotionRelation(supabaseDeal.individual_offers_kitchen || [])
  };
}

export function mapSupabaseToNotionAdvertiser(supabaseAdvertiser: Advertiser): Record<string, NotionPropertyValue> {
  // Validate required fields
  const requiredFields: (keyof Advertiser)[] = ['name'];
  if (!validateSupabaseRecord(supabaseAdvertiser, requiredFields)) {
    throw new Error('Missing required fields in Supabase Advertiser');
  }

  return {
    'Name': createNotionTitle(supabaseAdvertiser.name),
    
    // Status and Contact
    'Status': createNotionSelect(supabaseAdvertiser.status),
    'Main Contact': createNotionText(supabaseAdvertiser.main_contact),
    
    // Financial
    'Payment Fee': createNotionNumber(supabaseAdvertiser.payment_fee),
    'Deduction % | Advertiser': createNotionNumber(supabaseAdvertiser.deduction_advertiser),
    
    // Relations
    'Brand': createNotionRelation(supabaseAdvertiser.brand_id ? [supabaseAdvertiser.brand_id] : []),
    
    // Kitchen Relations
    '🥮 Kitchen FUNNELS': createNotionRelation(supabaseAdvertiser.kitchen_funnels || [])
  };
}

export function mapSupabaseToNotionBrand(supabaseBrand: Brand): Record<string, NotionPropertyValue> {
  return {
    'Name': createNotionTitle(supabaseBrand.brand_name || ''),
    'Affiliate Link': createNotionText(supabaseBrand.affiliate_link),
    'Status': createNotionSelect(supabaseBrand.status),
    'Description': createNotionText(supabaseBrand.description),
    'Notes': createNotionText(supabaseBrand.notes)
  };
}

// Validation functions
function validateNotionProperties(properties: Record<string, NotionPropertyValue>, requiredFields: string[]): boolean {
  return requiredFields.every(field => {
    const prop = properties[field];
    return prop !== undefined && prop !== null;
  });
}

function validateSupabaseRecord<T extends { id?: string }>(record: T, requiredFields: (keyof T)[]): boolean {
  return requiredFields.every(field => {
    const value = record[field];
    return value !== undefined && value !== null;
  });
}

// Helper functions for creating Notion properties
function createNotionText(text: string | null): NotionPropertyValue {
  return {
    type: 'rich_text',
    rich_text: text ? [{ type: 'text', text: { content: text } }] : []
  };
}

function createNotionTitle(text: string): NotionPropertyValue {
  return {
    type: 'title',
    title: [{ type: 'text', text: { content: text } }]
  };
}

function createNotionNumber(num: number | null): NotionPropertyValue {
  return {
    type: 'number',
    number: num
  };
}

function createNotionSelect(value: string | null): NotionPropertyValue {
  return {
    type: 'select',
    select: value ? { name: value } : null
  };
}

function createNotionMultiSelect(values: string[]): NotionPropertyValue {
  return {
    type: 'multi_select',
    multi_select: values.map(name => ({ name }))
  };
}

function createNotionDate(date: string | null): NotionPropertyValue {
  return {
    type: 'date',
    date: date ? { start: date } : null
  };
}

function createNotionBoolean(value: boolean): NotionPropertyValue {
  return {
    type: 'checkbox',
    checkbox: value
  };
}

function createNotionRelation(ids: string[]): NotionPropertyValue {
  return {
    type: 'relation',
    relation: ids.map(id => ({ id }))
  };
}
