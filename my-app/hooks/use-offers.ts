import { useState, useEffect } from "react"
import { Offer } from "@/components/offers/columns"

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOffers() {
      try {
        const response = await fetch("/api/offers")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch offers")
        }

        setOffers(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch offers")
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  return { offers, loading, error }
}
