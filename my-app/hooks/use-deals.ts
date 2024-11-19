import { useState, useEffect } from "react"
import { Deal } from "@/components/deals/columns"
import { supabase } from "@/lib/supabase"

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        // Fetch deals with related offer and brand information
        const { data, error: supabaseError } = await supabase
          .from("deals")
          .select(`
            *,
            offer:offers(
              *,
              brand:brands(*)
            )
          `)
          .order("deal_date", { ascending: false })

        if (supabaseError) throw supabaseError

        // Transform the data to match the Deal type
        const transformedDeals = data?.map(deal => ({
          id: deal.id,
          date: deal.deal_date,
          brand: deal.offer?.brand?.name || "",
          geo: deal.offer?.geo || "",
          cap: deal.cap || 0,
          leads: deal.leads_received || 0,
          ftds: deal.ftds || 0,
          status: deal.status,
          prepayAmount: deal.prepay_amount || 0,
          prepayReceived: deal.prepay_received || 0,
          workingHours: deal.working_hours_start && deal.working_hours_end 
            ? `${deal.working_hours_start}-${deal.working_hours_end}`
            : "N/A"
        })) || []

        setDeals(transformedDeals)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deals")
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  return { deals, loading, error }
}
