import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Deal } from "@/lib/notion"

interface DealStatsProps {
  deal: Deal
}

export function DealStats({ deal }: DealStatsProps) {
  const validLeads = deal.totalLeads - (deal.invalid || 0)
  const validPercentage = (validLeads / deal.totalLeads) * 100
  const paidPercentage = ((deal.finalBill - deal.balance) / deal.finalBill) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deal.totalLeads}</div>
          <div className="text-xs text-muted-foreground">
            {validLeads} valid leads
          </div>
          <Progress
            value={validPercentage}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invalid Leads</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deal.invalid || 0}</div>
          <div className="text-xs text-muted-foreground">
            {validPercentage.toFixed(1)}% valid rate
          </div>
          <Progress
            value={100 - validPercentage}
            className="mt-2"
            indicatorClassName="bg-yellow-500"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Final Bill</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${deal.finalBill.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            ${(deal.finalBill / deal.totalLeads).toFixed(2)} per lead
          </div>
          <Progress
            value={paidPercentage}
            className="mt-2"
            indicatorClassName="bg-green-500"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {deal.status || 'Pending'}
          </div>
          <div className="text-xs text-muted-foreground">
            Week {deal.weekNumber}
          </div>
          <Progress
            value={deal.status === 'approved' ? 100 : deal.status === 'pending' ? 50 : 0}
            className="mt-2"
            indicatorClassName={
              deal.status === 'approved' 
                ? 'bg-green-500' 
                : deal.status === 'pending' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
