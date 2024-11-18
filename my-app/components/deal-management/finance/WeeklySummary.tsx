import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Deal {
  id: string
  partner: string
  weekNumber: number
  totalLeads: number
  invalid: number
  finalBill: number
  balance: number
  status: 'Open' | 'Closed'
  hash?: string
  link?: string
}

interface WeeklySummaryProps {
  deal: Deal
}

export function WeeklySummary({ deal }: WeeklySummaryProps) {
  const validLeads = deal.totalLeads - deal.invalid
  const validPercentage = (validLeads / deal.totalLeads) * 100
  const paidPercentage = ((deal.finalBill - deal.balance) / deal.finalBill) * 100

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Weekly Summary</h3>
        <div className="grid gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Valid Leads</span>
              <span>{validLeads} / {deal.totalLeads}</span>
            </div>
            <Progress value={validPercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Payment Progress</span>
              <span>
                ${(deal.finalBill - deal.balance).toLocaleString()} / ${deal.finalBill.toLocaleString()}
              </span>
            </div>
            <Progress value={paidPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Lead Price</div>
              <div className="font-medium">${(deal.finalBill / validLeads).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Invalid Rate</div>
              <div className="font-medium">
                {((deal.invalid / deal.totalLeads) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
