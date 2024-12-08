import { useState, useEffect } from "react"
import { Deal } from "@/components/deals/columns"

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch("/api/deals")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch deals")
        }

        setDeals(data)
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
