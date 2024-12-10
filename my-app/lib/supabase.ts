import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lead = {
  id: number
  created_date: string
  country: string
  campaign: string
  email: string
  affiliate: string
  box: string
  call_status: string
  so_media: string
  deposit_date: string | null
  first_name: string
  last_name: string
  phone: string
  original_response: any
  created_at: string
  updated_at: string
}

export type Deal = {
  id: number
  notion_id: string
  name: string
  status: string
  brand: string
  offer: string
  advertiser: string
  affiliate_link: string
  description: string
  notes: string
  created_at: string
  updated_at: string
  last_synced_at: string | null
}

export type Brand = {
  id: number
  notion_id: string
  name: string
  status: string
  affiliate_link: string
  description: string
  notes: string
  created_at: string
  updated_at: string
  last_synced_at: string | null
}

export type Offer = {
  id: number
  notion_id: string
  geo: string
  sources: string[]
  funnels: string[]
  active_status: string
  language: string[]
  cpa_buying: number
  cpl_network_selling: string
  deduction_advertiser: number
  cr_last_week_told: string
  cr_last_week_say: string
  brands_0_fee: string
  geo_funnel_code: string
  kitchen_funnels: string[]
  created_at: string
  updated_at: string
  last_synced_at: string | null
}

export type Advertiser = {
  id: number
  notion_id: string
  status: string
  all_geos: string
  geos_available: string
  buying_deals_available: string
  selling_deals_no_filter: string
  buying_deals_no_filter: string
  text_gen_selling: string
  text_gen_selling_brand: string
  text_gen_buying: string
  deduction_advertiser: number
  kitchen_funnels: string[]
  created_at: string
  updated_at: string
  last_synced_at: string | null
}
