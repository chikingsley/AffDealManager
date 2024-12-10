import { supabase } from "./supabase";

export async function findMatchingDeal(lead: {
  country_code: string;
  traffic_source: string;
}) {
  try {
    // First, try to find a matching rule
    const { data: rules, error: rulesError } = await supabase
      .from('lead_matching_rules')
      .select(`
        *,
        offer:offers(
          id,
          geo,
          sources,
          brand:brands(name)
        )
      `)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (rulesError) throw rulesError;

    // Find the first matching rule
    const matchingRule = rules?.find(rule => {
      const geoMatches = new RegExp(rule.geo_pattern, 'i').test(lead.country_code);
      const sourceMatches = rule.source_pattern ? 
        new RegExp(rule.source_pattern, 'i').test(lead.traffic_source) : 
        true;
      
      return geoMatches && sourceMatches;
    });

    if (!matchingRule?.offer_id) {
      return null;
    }

    // Find an active deal for this offer
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('*')
      .eq('offer_id', matchingRule.offer_id)
      .eq('status', 'ACTIVE')
      .order('deal_date', { ascending: false })
      .limit(1);

    if (dealsError) throw dealsError;

    return deals?.[0] || null;
  } catch (error) {
    console.error('Error finding matching deal:', error);
    return null;
  }
}

export async function associateLeadWithDeal(
  leadId: string,
  dealId: string
) {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ deal_id: dealId })
      .eq('id', leadId);

    if (error) throw error;

    // Update deal leads count using our new function
    await supabase.rpc('count_deal_leads', { deal_id: dealId });

    return true;
  } catch (error) {
    console.error('Error associating lead with deal:', error);
    return false;
  }
}

// Function to be called when a new lead is created
export async function handleNewLead(lead: {
  id: string;
  country_code: string;
  traffic_source: string;
}) {
  const matchingDeal = await findMatchingDeal(lead);
  
  if (matchingDeal) {
    return associateLeadWithDeal(lead.id, matchingDeal.id);
  }
  
  return false;
}
