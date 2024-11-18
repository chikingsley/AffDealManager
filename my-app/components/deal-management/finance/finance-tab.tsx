import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DealsTable } from "./DealsTable"
import { DealStats } from "./DealStats"
import { DealBreakdown } from "./DealBreakdown"
import { InvalidsDialog } from "./InvalidsDialog"
import { PaymentDialog } from "./PaymentDialog"
import { QualityControlDialog } from "./QualityControlDialog"
import { CloseWeekDialog } from "./CloseWeekDialog"
import type { Deal } from "@/lib/notion"

// Mock data for testing - replace with actual data from your database
const mockDeals = [
  {
    id: "1",
    partner: "Partner A",
    weekNumber: 8,
    totalLeads: 150,
    invalid: 5,
    finalBill: 7250,
    balance: 2000,
    status: "pending" as const,
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
    weekNumber: 8,
    totalLeads: 200,
    invalid: 0,
    finalBill: 10000,
    balance: 0,
    status: "approved" as const,
    transactionHash: "0x123...",
    days: [
      {
        date: "2024-02-21",
        deals: [
          { geo: "UK", leads: 100, rate: 55, source: "TikTok", bill: 5500 },
          { geo: "DE", leads: 100, rate: 45, source: "Instagram", bill: 4500 },
        ]
      }
    ]
  },
]

export function FinanceTab() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [selectedDeductionId, setSelectedDeductionId] = useState<string | null>(null)
  const [showInvalids, setShowInvalids] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showQC, setShowQC] = useState(false)
  const [showCloseWeek, setShowCloseWeek] = useState(false)

  const handleProcessInvalids = async (results: string) => {
    // Implement invalid processing logic
    console.log("Processing invalids:", results)
  }

  const handleRecordPayment = async (amount: number, hash: string) => {
    // Implement payment recording logic
    console.log("Recording payment:", { amount, hash })
  }

  const handleSubmitQC = async (data: any) => {
    // Implement QC submission logic
    console.log("Submitting QC:", data)
  }

  const handleCloseWeek = async () => {
    // Implement week closing logic
    console.log("Closing week")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Finance</h2>
        <p className="text-muted-foreground">
          Track revenue, payments, and financial metrics
        </p>
      </div>
      
      {selectedDeal && (
        <DealStats deal={selectedDeal} />
      )}

      <DealsTable 
        deals={mockDeals}
        onSelectDeal={setSelectedDeal}
        onShowInvalids={() => setShowInvalids(true)}
        onShowPayment={() => setShowPayment(true)}
        onShowQC={() => setShowQC(true)}
        onShowCloseWeek={() => setShowCloseWeek(true)}
        onSelectDeduction={setSelectedDeductionId}
      />

      {selectedDeal && selectedDeductionId && (
        <DealBreakdown 
          deal={selectedDeal}
          deductionId={selectedDeductionId}
        />
      )}

      {selectedDeal && (
        <>
          <InvalidsDialog
            open={showInvalids}
            onOpenChange={setShowInvalids}
            deal={selectedDeal}
            onProcessInvalids={handleProcessInvalids}
          />

          <PaymentDialog
            open={showPayment}
            onOpenChange={setShowPayment}
            deal={selectedDeal}
            onRecordPayment={handleRecordPayment}
          />

          <QualityControlDialog
            open={showQC}
            onOpenChange={setShowQC}
            deal={selectedDeal}
            onSubmitQC={handleSubmitQC}
          />
        </>
      )}

      <CloseWeekDialog
        open={showCloseWeek}
        onOpenChange={setShowCloseWeek}
        weekNumber={8}
        deals={mockDeals}
        onCloseWeek={handleCloseWeek}
      />
    </div>
  )
}
