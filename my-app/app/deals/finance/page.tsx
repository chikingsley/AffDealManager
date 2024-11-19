import { FinanceTab } from "@/components/deal-management/finance/finance-tab"
import { Metadata } from "next"
import { DealsTable } from "@/components/deal-management/finance/DealsTable"
import { mockDeals } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Finance",
  description: "Track and manage your deal finances, payments, and performance metrics.",
}

export default function FinancePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Track and manage your deal finances, payments, and performance metrics.
        </p>
      </div>
      
      <DealsTable 
        deals={[
          ...mockDeals,
          {
            ...mockDeals[0],
            id: 'deal-2',
            partner: 'Partner B',
            weekNumber: 2,
            totalLeads: 850,
            invalid: 42,
            finalBill: 25500,
            balance: 12750,
            status: 'Open'
          },
          {
            ...mockDeals[0],
            id: 'deal-3',
            partner: 'Partner C',
            weekNumber: 3,
            totalLeads: 1200,
            invalid: 60,
            finalBill: 36000,
            balance: 36000,
            status: 'Open'
          }
        ]} 
        onSelectDeal={() => {}} 
        onSelectDeduction={() => {}}
      />
    </div>
  )
}
