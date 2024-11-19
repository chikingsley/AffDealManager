import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Deal } from "@/lib/notion"

interface DealBreakdownProps {
  deal: Deal
  deductionId: string
}

export function DealBreakdown({ deal, deductionId }: DealBreakdownProps) {
  const [dealId, date] = deductionId.split('-')
  const dayRecord = deal.days.find(day => day.date === date)

  if (!dayRecord) return null

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Deal Breakdown for {date}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Geo</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Bill</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dayRecord.deals.map((subDeal, index) => (
              <TableRow key={index}>
                <TableCell>{subDeal.geo}</TableCell>
                <TableCell>{subDeal.leads}</TableCell>
                <TableCell>${subDeal.rate}</TableCell>
                <TableCell>{subDeal.source}</TableCell>
                <TableCell className="text-right">${subDeal.bill.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}></TableCell>
              <TableCell className="font-medium">Total</TableCell>
              <TableCell className="text-right font-medium">
                ${dayRecord.deals.reduce((sum, deal) => sum + deal.bill, 0).toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
