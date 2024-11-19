import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Deal } from "@/lib/notion"
import { FileText, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface WeeklySummaryProps {
  deal: Deal
}

export function WeeklySummary({ deal }: WeeklySummaryProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate weekly totals
  const weeklyTotals = deal.days.reduce((totals, day) => {
    day.deals.forEach(d => {
      const cpaRate = parseFloat(d.rate.split('+')[0])
      const crgRate = parseFloat(d.rate.split('+')[1]) / 100
      const grossLeads = d.leads
      const deductions = Math.floor(grossLeads * 0.1) // Example deduction rate
      const netLeads = grossLeads - deductions
      const ftds = Math.floor(netLeads * 0.3) // Example conversion rate
      const ftdCost = ftds * cpaRate
      const crgCost = ftdCost * crgRate

      if (!totals.geoStats[d.geo]) {
        totals.geoStats[d.geo] = {
          grossLeads: 0,
          deductions: 0,
          netLeads: 0,
          ftds: 0,
          ftdCost: 0,
          crgCost: 0,
          totalCost: 0,
          cpaRate,
          crgRate
        }
      }
      
      totals.geoStats[d.geo].grossLeads += grossLeads
      totals.geoStats[d.geo].deductions += deductions
      totals.geoStats[d.geo].netLeads += netLeads
      totals.geoStats[d.geo].ftds += ftds
      totals.geoStats[d.geo].ftdCost += ftdCost
      totals.geoStats[d.geo].crgCost += crgCost
      totals.geoStats[d.geo].totalCost += (ftdCost + crgCost)

      totals.grossLeads += grossLeads
      totals.deductions += deductions
      totals.netLeads += netLeads
      totals.ftds += ftds
      totals.ftdCost += ftdCost
      totals.crgCost += crgCost
      totals.totalCost += (ftdCost + crgCost)
    })
    return totals
  }, {
    grossLeads: 0,
    deductions: 0,
    netLeads: 0,
    ftds: 0,
    ftdCost: 0,
    crgCost: 0,
    totalCost: 0,
    geoStats: {} as Record<string, {
      grossLeads: number
      deductions: number
      netLeads: number
      ftds: number
      ftdCost: number
      crgCost: number
      totalCost: number
      cpaRate: number
      crgRate: number
    }>
  })

  return (
    <Card>
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
              Week {deal.weekNumber} Summary
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
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GEO</TableHead>
                  <TableHead className="text-center">CPA ($)</TableHead>
                  <TableHead className="text-center">CRG (%)</TableHead>
                  <TableHead className="text-center">Gross Leads</TableHead>
                  <TableHead className="text-center">Deductions</TableHead>
                  <TableHead className="text-center">Deduction Rate %</TableHead>
                  <TableHead className="text-center">Net Leads</TableHead>
                  <TableHead className="text-center">FTDs</TableHead>
                  <TableHead className="text-center">CR %</TableHead>
                  <TableHead className="text-right">FTD Cost ($)</TableHead>
                  <TableHead className="text-right">CRG Cost ($)</TableHead>
                  <TableHead className="text-right">Total Cost ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(weeklyTotals.geoStats).map(([geo, stats]) => (
                  <TableRow key={geo}>
                    <TableCell>{geo}</TableCell>
                    <TableCell className="text-center">${stats.cpaRate}</TableCell>
                    <TableCell className="text-center">{(stats.crgRate * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-center">{stats.grossLeads}</TableCell>
                    <TableCell className="text-center text-red-500">{stats.deductions}</TableCell>
                    <TableCell className="text-center">
                      {((stats.deductions / stats.grossLeads) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center font-medium">{stats.netLeads}</TableCell>
                    <TableCell className="text-center text-green-600">{stats.ftds}</TableCell>
                    <TableCell className="text-center">
                      {((stats.ftds / stats.netLeads) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">${stats.ftdCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-purple-600">${stats.crgCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${stats.totalCost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={3}>Weekly Totals</TableCell>
                  <TableCell className="text-center">{weeklyTotals.grossLeads}</TableCell>
                  <TableCell className="text-center text-red-500">{weeklyTotals.deductions}</TableCell>
                  <TableCell className="text-center">
                    {((weeklyTotals.deductions / weeklyTotals.grossLeads) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">{weeklyTotals.netLeads}</TableCell>
                  <TableCell className="text-center text-green-600">{weeklyTotals.ftds}</TableCell>
                  <TableCell className="text-center">
                    {((weeklyTotals.ftds / weeklyTotals.netLeads) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">${weeklyTotals.ftdCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-purple-600">${weeklyTotals.crgCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${weeklyTotals.totalCost.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
