import { Card } from "@/components/ui/card"
import { Deal } from "@/types/finance"

interface DealStatsProps {
  deal: Deal
}

export function DealStats({ deal }: DealStatsProps) {
  const totalPayments = deal.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalDeductions = deal.days.reduce((sum, day) => sum + day.dailyBill, 0)
  const conversionRate = ((deal.totalLeads - deal.invalid) / deal.totalLeads * 100).toFixed(1)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Total Payments</div>
        <div className="text-2xl font-bold text-green-600">
          ${totalPayments.toLocaleString()}
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Total Deductions</div>
        <div className="text-2xl font-bold text-red-600">
          ${totalDeductions.toLocaleString()}
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Conversion Rate</div>
        <div className="text-2xl font-bold">
          {conversionRate}%
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Current Balance</div>
        <div className="text-2xl font-bold">
          ${deal.balance.toLocaleString()}
        </div>
      </Card>
    </div>
  )
}