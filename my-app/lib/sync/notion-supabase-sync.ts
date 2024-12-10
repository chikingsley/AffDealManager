import { Client } from "@notionhq/client";
import { supabaseServer } from "../supabase-server";
import { 
  mapNotionToSupabaseDeal, 
  mapNotionToSupabaseOffer,
  mapNotionToSupabaseAdvertiser 
} from '../notion-supabase-mapper';
import { Deal, Offer, Advertiser } from '../../types/schema';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Track last sync time to avoid unnecessary syncs
let lastSyncTime: Date | null = null;
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface SyncStats {
  brands: number;
  offers: number;
  deals: number;
  advertisers: number;
  errors: Array<{ table: string; error: any }>;
  startTime: string;
  endTime: string;
  duration: number;
}

// Helper function to safely extract text from Notion rich text
function extractText(richText: any): string {
  try {
    if (!richText) return '';
    if (Array.isArray(richText)) {
      return richText.map(rt => rt.plain_text || '').join('');
    }
    return '';
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

// Helper function to safely extract array values from multi-select
function extractMultiSelect(multiSelect: any): string[] {
  try {
    if (!multiSelect || !multiSelect.multi_select) return [];
    return multiSelect.multi_select.map((item: any) => item.name || '').filter(Boolean);
  } catch (error) {
    console.error('Error extracting multi-select:', error);
    return [];
  }
}

// Helper function to safely extract numeric array
function extractNumericArray(arr: any): number[] | null {
  try {
    if (!arr) return null;
    
    // If it's already an array, filter out non-numeric values
    if (Array.isArray(arr)) {
      const numbers = arr
        .map(item => typeof item === 'number' ? item : parseFloat(item))
        .filter(num => !isNaN(num));
      return numbers.length > 0 ? numbers : null;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof arr === 'string') {
      try {
        const parsed = JSON.parse(arr);
        if (Array.isArray(parsed)) {
          const numbers = parsed
            .map(item => typeof item === 'number' ? item : parseFloat(item))
            .filter(num => !isNaN(num));
          return numbers.length > 0 ? numbers : null;
        }
      } catch (e) {
        // If JSON parsing fails, try to extract numbers from the string
        const matches = arr.match(/-?\d+(\.\d+)?/g);
        if (matches) {
          const numbers = matches.map(Number).filter(num => !isNaN(num));
          return numbers.length > 0 ? numbers : null;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting numeric array:', error);
    return null;
  }
}

// Helper function to safely extract numeric string
function extractNumericString(value: any): string | null {
  try {
    if (value === null || value === undefined) return null;
    
    // If it's already a number, convert to string
    if (typeof value === 'number') {
      return value.toString();
    }
    
    // If it's a string, try to extract numeric value
    if (typeof value === 'string') {
      const match = value.match(/-?\d+(\.\d+)?/);
      return match ? match[0] : null;
    }
    
    // If it's an array, try to get the first numeric value
    if (Array.isArray(value)) {
      const numbers = value
        .map(item => typeof item === 'number' ? item : parseFloat(item))
        .filter(num => !isNaN(num));
      return numbers.length > 0 ? numbers[0].toString() : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting numeric string:', error);
    return null;
  }
}

// Helper function to safely extract number
function extractNumber(number: any): number | null {
  try {
    if (number?.number === undefined || number?.number === null) return null;
    return number.number;
  } catch (error) {
    console.error('Error extracting number:', error);
    return null;
  }
}

// Helper function to safely extract boolean value
function extractCheckbox(checkbox: any): boolean {
  try {
    return Boolean(checkbox);
  } catch (error) {
    console.error('Error extracting checkbox:', error);
    return false;
  }
}

// Helper function to safely extract property
function getProperty(properties: any, propertyName: string): any {
  try {
    return properties?.[propertyName] || null;
  } catch (error) {
    console.error(`Error getting property ${propertyName}:`, error);
    return null;
  }
}

// Helper function to safely extract select value
function extractSelect(select: any): string | null {
  try {
    if (!select || !select.select) return null;
    return select.select.name || null;
  } catch (error) {
    console.error('Error extracting select:', error);
    return null;
  }
}

// Helper function to safely extract date
function extractDate(date: any): string | null {
  try {
    if (!date || !date.date || !date.date.start) return null;
    return date.date.start;
  } catch (error) {
    console.error('Error extracting date:', error);
    return null;
  }
}

// Helper function to safely extract formula value
function extractFormula(formula: any): any {
  try {
    if (!formula || !formula.formula) return null;
    
    // Handle different formula types
    switch (formula.formula.type) {
      case 'string':
        return formula.formula.string;
      case 'number':
        return formula.formula.number === '' ? null : formula.formula.number;
      case 'boolean':
        return formula.formula.boolean;
      case 'date':
        return formula.formula.date?.start || null;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error extracting formula:', error);
    return null;
  }
}

// Helper function to safely extract relation IDs
function extractRelations(relation: any): string[] {
  try {
    if (!relation || !relation.relation) return [];
    return relation.relation.map((rel: any) => rel.id).filter(Boolean);
  } catch (error) {
    console.error('Error extracting relations:', error);
    return [];
  }
}

// Helper function to safely extract rollup value
function extractRollup(rollup: any): any {
  try {
    if (!rollup || !rollup.rollup) return null;
    
    switch (rollup.rollup.type) {
      case 'number':
        return rollup.rollup.number;
      case 'date':
        return rollup.rollup.date?.start || null;
      case 'array':
        return rollup.rollup.array.map((item: any) => {
          if (item.type === 'relation') return item.relation.id;
          return null;
        }).filter(Boolean);
      default:
        return null;
    }
  } catch (error) {
    console.error('Error extracting rollup:', error);
    return null;
  }
}

async function syncDeals(stats: SyncStats): Promise<void> {
  try {
    const dealsResponse = await notion.databases.query({
      database_id: process.env.DEALS_DATABASE_ID!,
    });

    for (const page of dealsResponse.results) {
      try {
        const properties = (page as any).properties;
        const dealData: Partial<Deal> = {
          notion_id: page.id,
          ...mapNotionToSupabaseDeal(properties),
          created_at: page.created_time,
          updated_at: page.last_edited_time,
          last_synced_at: new Date().toISOString()
        };

        const { error } = await supabaseServer
          .from('deals')
          .upsert([dealData], {
            onConflict: 'notion_id'
          });

        if (error) throw error;
        stats.deals++;
      } catch (error) {
        console.error('Error syncing deal:', error);
        stats.errors.push({ table: 'deals', error });
      }
    }
  } catch (error) {
    console.error('Error in syncDeals:', error);
    throw error;
  }
}

async function syncBrands(stats: SyncStats): Promise<void> {
  try {
    const brandsResponse = await notion.databases.query({
      database_id: process.env.BRANDS_DATABASE_ID!,
    });

    for (const page of brandsResponse.results) {
      try {
        const properties = (page as any).properties;
        
        const brandData = {
          notion_id: page.id,
          name: extractText(properties.Name),
          brand_name: extractText(properties['Brand Name']),
          brand_url: extractText(properties['Brand URL']),
          commission_type: extractSelect(properties['Commission Type']),
          commission_amount: extractNumericString(properties['Commission Amount']),
          cookie_length_days: extractNumber(properties['Cookie Length (Days)']),
          network: extractSelect(properties.Network),
          affiliate_link: extractText(properties['Affiliate Link']),
          terms_and_conditions: extractText(properties['Terms and Conditions']),
          notes: extractText(properties.Notes),
          categories: extractMultiSelect(properties.Categories),
          tags: extractMultiSelect(properties.Tags),
          regions: extractMultiSelect(properties.Regions),
          status: extractSelect(properties.Status),
          last_checked: extractDate(properties['Last Checked']),
          min_payout: extractNumericArray(properties['Min Payout']?.rollup?.array),
          max_payout: extractNumericArray(properties['Max Payout']?.rollup?.array),
          payout_type: extractSelect(properties['Payout Type']),
          tracking_software: extractSelect(properties['Tracking Software']),
          tracking_link: extractText(properties['Tracking Link']),
          program_id: extractText(properties['Program ID']),
          created_at: page.created_time,
          updated_at: page.last_edited_time,
          last_synced_at: new Date().toISOString()
        };

        const { error } = await supabaseServer
          .from('brands')
          .upsert([brandData], {
            onConflict: 'notion_id'
          });

        if (error) throw error;
        stats.brands++;
      } catch (error) {
        console.error('Error syncing brand:', error);
        stats.errors.push({ table: 'brands', error });
      }
    }
  } catch (error) {
    console.error('Error in syncBrands:', error);
    throw error;
  }
}

async function syncOffers(stats: SyncStats): Promise<void> {
  try {
    const offersResponse = await notion.databases.query({
      database_id: process.env.OFFERS_DATABASE_ID!,
    });

    for (const page of offersResponse.results) {
      try {
        const properties = (page as any).properties;
        const offerData: Partial<Offer> = {
          notion_id: page.id,
          ...mapNotionToSupabaseOffer(properties),
          created_at: page.created_time,
          updated_at: page.last_edited_time,
          last_synced_at: new Date().toISOString()
        };

        const { error } = await supabaseServer
          .from('offers')
          .upsert([offerData], {
            onConflict: 'notion_id'
          });

        if (error) throw error;
        stats.offers++;
      } catch (error) {
        console.error('Error syncing offer:', error);
        stats.errors.push({ table: 'offers', error });
      }
    }
  } catch (error) {
    console.error('Error in syncOffers:', error);
    throw error;
  }
}

async function syncAdvertisers(stats: SyncStats): Promise<void> {
  try {
    const advertisersResponse = await notion.databases.query({
      database_id: process.env.ADVERTISERS_DATABASE_ID!,
    });

    for (const page of advertisersResponse.results) {
      try {
        const properties = (page as any).properties;
        const advertiserData: Partial<Advertiser> = {
          notion_id: page.id,
          ...mapNotionToSupabaseAdvertiser(properties),
          created_at: page.created_time,
          updated_at: page.last_edited_time,
          last_synced_at: new Date().toISOString()
        };

        const { error } = await supabaseServer
          .from('advertisers')
          .upsert([advertiserData], {
            onConflict: 'notion_id'
          });

        if (error) throw error;
        stats.advertisers++;
      } catch (error) {
        console.error('Error syncing advertiser:', error);
        stats.errors.push({ table: 'advertisers', error });
      }
    }
  } catch (error) {
    console.error('Error in syncAdvertisers:', error);
    throw error;
  }
}

export async function syncNotionToSupabase(): Promise<SyncStats> {
  const startTime = new Date();
  const stats: SyncStats = {
    brands: 0,
    offers: 0,
    deals: 0,
    advertisers: 0,
    errors: [],
    startTime: startTime.toISOString(),
    endTime: '',
    duration: 0,
  };

  // Check if enough time has passed since last sync
  if (lastSyncTime && Date.now() - lastSyncTime.getTime() < MIN_SYNC_INTERVAL_MS) {
    console.log('Skipping sync - too soon since last sync');
    return stats;
  }

  try {
    // Run all sync operations
    await Promise.all([
      syncDeals(stats),
      syncBrands(stats),
      syncOffers(stats),
      syncAdvertisers(stats)
    ]);

    // Update sync stats
    const endTime = new Date();
    stats.endTime = endTime.toISOString();
    stats.duration = endTime.getTime() - startTime.getTime();
    lastSyncTime = endTime;

    return stats;
  } catch (error) {
    console.error('Error in syncNotionToSupabase:', error);
    throw error;
  }
}
