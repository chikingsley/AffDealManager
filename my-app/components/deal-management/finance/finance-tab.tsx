import { useState } from "react"
import { Card } from "@/components/ui/card"
import { DealsTable } from "./DealsTable"
import type { Deal } from "@/types/deals"

// Mock data for testing - replace with actual data from your database
const mockDeals: Deal[] = [
  {
    id: "1",
    partner: "Partner A",
    sources: ["Web", "Mobile"],
    geo: "US",
    language: ["en"],
    price: "$1000",
    funnels: ["Main", "Upsell"],
    formatted_display: "Partner A - US",
    formatted_funnels: "Main, Upsell",
    last_updated: new Date().toISOString()
  }
]

export function FinanceTab() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [selectedDeductionId, setSelectedDeductionId] = useState<string | null>(null)

  return (
    <div className="p-4">
      <Card className="p-4">
        <DealsTable 
          deals={mockDeals} 
          onSelectDeal={setSelectedDeal} 
          onSelectDeduction={setSelectedDeductionId}
        />
      </Card>
    </div>
  )
}
