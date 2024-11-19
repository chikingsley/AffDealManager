import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type WeeklyRollup = {
  week_start: string
  brand: string
  total_leads: number
  total_ftds: number
  total_prepay: number
  total_received: number
}

export function FinanceReport() {
  const [weeklyRollups, setWeeklyRollups] = useState<WeeklyRollup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFinanceData() {
      try {
        const { data, error: supabaseError } = await supabase
          .rpc('get_weekly_finance_rollup')

        if (supabaseError) throw supabaseError

        setWeeklyRollups(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch finance data")
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  // Group by week
  const weeklyGroups = weeklyRollups.reduce((groups, item) => {
    const week = item.week_start
    if (!groups[week]) {
      groups[week] = []
    }
    groups[week].push(item)
    return groups
  }, {} as Record<string, WeeklyRollup[]>)

  return (
    <div className="space-y-8">
      {Object.entries(weeklyGroups).map(([week, items]) => (
        <Card key={week}>
          <CardHeader>
            <CardTitle>Week of {new Date(week).toLocaleDateString()}</CardTitle>
            <CardDescription>
              Financial summary for {items.length} brands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <Card key={`${week}-${index}`}>
                  <CardHeader>
                    <CardTitle>{item.brand}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Leads:</dt>
                        <dd>{item.total_leads}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>FTDs:</dt>
                        <dd>{item.total_ftds}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Prepay Amount:</dt>
                        <dd>${item.total_prepay.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Received:</dt>
                        <dd>${item.total_received.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
