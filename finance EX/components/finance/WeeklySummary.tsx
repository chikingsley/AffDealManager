import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Deal } from "@/types/finance"
import { FileText, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface WeeklySummaryProps {
  deal: Deal
}

export function WeeklySummary({ deal }: WeeklySummaryProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate statistics
  const baseInvalidRate = (deal.invalid / deal.totalLeads * 100).toFixed(1)
  const additionalDeductions = 8 // Example - should come from deal data
  const additionalRate = (additionalDeductions / deal.totalLeads * 100).toFixed(1)
  const totalInvalidRate = ((deal.invalid + additionalDeductions) / deal.totalLeads * 100).toFixed(1)

  // Group deals by date and calculate daily totals
  const dailyDeals = deal.days.map(day => {
    return {
      date: day.date,
      deals: day.deals.map(d => {
        const grossLeads = d.leads
        const deductions = Math.floor(grossLeads * (Math.random() * 0.1)) // Example deduction calculation
        const netLeads = grossLeads - deductions
        const ftds = Math.floor(netLeads * (Math.random() * 0.3)) // Example FTD calculation
        const conversionRate = (ftds / netLeads * 100).toFixed(1)
        const cpaRate = parseFloat(d.rate.split('+')[0])
        const crgRate = parseFloat(d.rate.split('+')[1]) / 100
        const ftdCost = ftds * cpaRate
        const crgCost = ftdCost * crgRate
        
        return {
          ...d,
          grossLeads,
          deductions,
          deductionRate: ((deductions / grossLeads) * 100).toFixed(1),
          netLeads,
          ftds,
          conversionRate,
          cpaRate,
          crgRate,
          ftdCost,
          crgCost,
          totalCost: ftdCost + crgCost
        }
      }),
      totals: day.deals.reduce((acc, d) => ({
        grossLeads: acc.grossLeads + d.leads,
        deductions: acc.deductions + Math.floor(d.leads * (Math.random() * 0.1)),
        ftds: acc.ftds + Math.floor((d.leads - Math.floor(d.leads * (Math.random() * 0.1))) * (Math.random() * 0.3)),
        ftdCost: acc.ftdCost + d.bill,
        crgCost: acc.crgCost + (d.bill * (parseFloat(d.rate.split('+')[1]) / 100)),
        totalCost: acc.totalCost + d.bill + (d.bill * (parseFloat(d.rate.split('+')[1]) / 100))
      }), {
        grossLeads: 0,
        deductions: 0,
        ftds: 0,
        ftdCost: 0,
        crgCost: 0,
        totalCost: 0
      })
    }
  })

  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <h3 className="font-semibold">
              [Monday {new Date(deal.days[0].date).toLocaleDateString()}] WEEKLY SUMMARY
            </h3>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
        </div>

        <div className={cn(
          "border-t transition-all",
          expanded ? "block" : "hidden"
        )}>
          <div className="p-4 space-y-6">
            {/* Detailed Deal Breakdown */}
            <div className="space-y-6">
              {dailyDeals.map((day) => (
                <div key={day.date} className="space-y-2">
                  <h5 className="font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h5>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-center">GEO</TableHead>
                        <TableHead className="text-center">
                          <div>CPA</div>
                          <div className="text-xs text-muted-foreground">Rate ($)</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>CRG</div>
                          <div className="text-xs text-muted-foreground">Rate (%)</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>Gross</div>
                          <div className="text-xs text-muted-foreground">Leads</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>Deductions</div>
                          <div className="text-xs text-muted-foreground">Invalid</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>Deduction %</div>
                          <div className="text-xs text-muted-foreground">Rate</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>Net</div>
                          <div className="text-xs text-muted-foreground">Leads</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>FTDs</div>
                          <div className="text-xs text-muted-foreground">Count</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>CR%</div>
                          <div className="text-xs text-muted-foreground">Rate</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>FTD Cost</div>
                          <div className="text-xs text-muted-foreground">Total ($)</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>CRG Cost</div>
                          <div className="text-xs text-muted-foreground">Total ($)</div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div>Total Cost</div>
                          <div className="text-xs text-muted-foreground">Final ($)</div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {day.deals.map((d, i) => (
                        <TableRow key={`${day.date}-${i}`}>
                          <TableCell className="text-center">{d.geo}</TableCell>
                          <TableCell className="text-center">${d.cpaRate}</TableCell>
                          <TableCell className="text-center">{(d.crgRate * 100).toFixed(1)}%</TableCell>
                          <TableCell className="text-center">{d.grossLeads}</TableCell>
                          <TableCell className="text-center text-red-500">{d.deductions}</TableCell>
                          <TableCell className="text-center">{d.deductionRate}%</TableCell>
                          <TableCell className="text-center font-medium">{d.netLeads}</TableCell>
                          <TableCell className="text-center text-green-600">{d.ftds}</TableCell>
                          <TableCell className="text-center">{d.conversionRate}%</TableCell>
                          <TableCell className="text-center">${d.ftdCost.toLocaleString()}</TableCell>
                          <TableCell className="text-center text-purple-600">${d.crgCost.toLocaleString()}</TableCell>
                          <TableCell className="text-center font-medium">${d.totalCost.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell colSpan={3} className="text-center">Daily Totals</TableCell>
                        <TableCell className="text-center">{day.totals.grossLeads}</TableCell>
                        <TableCell className="text-center text-red-500">{day.totals.deductions}</TableCell>
                        <TableCell className="text-center">
                          {((day.totals.deductions / day.totals.grossLeads) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center">
                          {day.totals.grossLeads - day.totals.deductions}
                        </TableCell>
                        <TableCell className="text-center text-green-600">{day.totals.ftds}</TableCell>
                        <TableCell className="text-center">
                          {((day.totals.ftds / (day.totals.grossLeads - day.totals.deductions)) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center">${day.totals.ftdCost.toLocaleString()}</TableCell>
                        <TableCell className="text-center text-purple-600">
                          ${day.totals.crgCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">${day.totals.totalCost.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}

              {/* Week Totals */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-4">Week Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total FTDs</p>
                    <p className="text-lg font-semibold text-green-600">
                      {dailyDeals.reduce((acc, day) => acc + day.totals.ftds, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average CR%</p>
                    <p className="text-lg font-semibold">
                      {(dailyDeals.reduce((acc, day) => {
                        const cr = (day.totals.ftds / (day.totals.grossLeads - day.totals.deductions)) * 100
                        return acc + cr
                      }, 0) / dailyDeals.length).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-semibold">
                      ${dailyDeals.reduce((acc, day) => acc + day.totals.totalCost, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}