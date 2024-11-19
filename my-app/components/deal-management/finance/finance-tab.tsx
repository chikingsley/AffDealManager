import { useState } from "react"
import { Card } from "@/components/ui/card"
import { DealsTable } from "./DealsTable"
import type { Deal } from "@/lib/notion"
import { mockDeal } from "@/lib/mock-data"

// Mock data for testing - replace with actual data from your database
const mockDeals = [
  {
    id: "1",
    partner: "Partner A",
    weekNumber: 23,
    leads: [
      { id: "l1", amount: 100, status: "approved" },
      { id: "l2", amount: 150, status: "pending" }
    ],
    deductions: [
      { id: "d1", amount: 50, reason: "Quality Issue" },
      { id: "d2", amount: 25, reason: "Late Submission" }
    ],
    finalBill: 1000,
    balance: 500,
    status: "pending",
    totalLeads: 150,
    invalid: 5,
    days: [
      {
        date: "2024-02-20",
        deals: [
          { geo: "US", leads: 50, rate: 50, source: "Facebook", bill: 2500 },
          { geo: "CA", leads: 30, rate: 45, source: "Google", bill: 1350 },
        ]
      }
    ]
  },
  {
    id: "2",
    partner: "Partner B",
    weekNumber: 23,
    leads: [
      { id: "l3", amount: 200, status: "approved" },
      { id: "l4", amount: 250, status: "rejected" }
    ],
    deductions: [
      { id: "d3", amount: 75, reason: "Invalid Format" }
    ],
    finalBill: 2000,
    balance: 0,
    status: "paid",
    totalLeads: 200,
    invalid: 0,
    days: [
      {
        date: "2024-02-21",
        deals: [
          { geo: "UK", leads: 100, rate: 55, source: "TikTok", bill: 5500 },
          { geo: "DE", leads: 100, rate: 45, source: "Instagram", bill: 4500 },
        ]
      }
    ]
  }
]

export function FinanceTab() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [selectedDeductionId, setSelectedDeductionId] = useState<string | null>(null)

  return (
    <div className="p-4">
      <Card className="p-4">
        <DealsTable 
          deals={[mockDeal]} 
          onSelectDeal={setSelectedDeal} 
          onSelectDeduction={setSelectedDeductionId}
        />
      </Card>
    </div>
  )
}
