import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import type { Deal } from "@/lib/notion"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { WeeklySummary } from "./WeeklySummary"

interface DealsTableProps {
  deals: Deal[]
  onSelectDeal: (deal: Deal) => void
  onSelectDeduction: (id: string | null) => void
}

export function DealsTable({ deals, onSelectDeal, onSelectDeduction }: DealsTableProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null)

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2">
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Partner</TableHead>
          <TableHead>Week</TableHead>
          <TableHead className="text-right">Total Leads</TableHead>
          <TableHead className="text-right">Invalid</TableHead>
          <TableHead className="text-right">Final Bill</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal, index) => (
          <React.Fragment key={deal.id}>
            <TableRow 
              className={cn(
                "cursor-pointer hover:bg-muted/50",
                index !== deals.length - 1 && "border-b"
              )}
            >
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                >
                  {expandedDeal === deal.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell>{deal.partner}</TableCell>
              <TableCell>{deal.weekNumber}</TableCell>
              <TableCell className="text-right">{deal.totalLeads}</TableCell>
              <TableCell className="text-right text-red-500">{deal.invalid}</TableCell>
              <TableCell className="text-right">${deal.finalBill.toLocaleString()}</TableCell>
              <TableCell className="text-right">${deal.balance.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  deal.status === 'Closed' 
                    ? "bg-green-50 text-green-700" 
                    : "bg-yellow-50 text-yellow-700"
                )}>
                  {deal.status}
                </span>
              </TableCell>
            </TableRow>
            {expandedDeal === deal.id && (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <div className="space-y-6">
                    {/* Timeline */}
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-medium mb-4">Deal Timeline</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>GEO</TableHead>
                              <TableHead className="text-center">CPA</TableHead>
                              <TableHead className="text-center">CRG</TableHead>
                              <TableHead className="text-center">Net Leads</TableHead>
                              <TableHead className="text-center">Invalid Claims</TableHead>
                              <TableHead className="text-right">Total Cost</TableHead>
                              <TableHead className="text-right">Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...deal.payments, ...deal.days.flatMap(day => 
                              day.deals.map(d => ({
                                date: day.date,
                                ...d,
                                type: 'deal' as const
                              }))
                            )]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((item, index) => {
                              if ('amount' in item) {
                                // Payment row
                                return (
                                  <TableRow key={`payment-${index}`}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell colSpan={5} className="text-green-600">Payment Received</TableCell>
                                    <TableCell className="text-right text-green-600">
                                      +${item.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2"
                                        onClick={() => window.open(`https://tronscan.org/#/transaction/${item.txHash}`, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>View Transaction</span>
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              } else {
                                // Deal row
                                const cpaRate = parseFloat(item.rate.split('+')[0])
                                const crgRate = parseFloat(item.rate.split('+')[1]) / 100
                                const invalidClaims = Math.floor(item.leads * 0.1) // Example invalid rate
                                const ftdCost = item.leads * cpaRate
                                const crgCost = ftdCost * crgRate
                                const totalCost = ftdCost + crgCost

                                return (
                                  <TableRow key={`deal-${index}`}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.geo}</TableCell>
                                    <TableCell className="text-center">${cpaRate}</TableCell>
                                    <TableCell className="text-center">{(crgRate * 100).toFixed(1)}%</TableCell>
                                    <TableCell className="text-center">{item.leads}</TableCell>
                                    <TableCell className="text-center text-red-500">{invalidClaims}</TableCell>
                                    <TableCell className="text-right">${totalCost.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => onSelectDeduction(`${deal.id}-${item.date}-${item.geo}`)}
                                      >
                                        View Details
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              }
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    
                    {/* Weekly Summary */}
                    <WeeklySummary deal={deal} />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}
