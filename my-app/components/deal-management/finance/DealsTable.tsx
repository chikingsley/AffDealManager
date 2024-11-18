import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'
import type { Deal } from "@/lib/notion"

interface DealsTableProps {
  deals: Deal[]
  onSelectDeal: (deal: Deal) => void
  onShowInvalids: () => void
  onShowPayment: () => void
  onShowQC: () => void
  onShowCloseWeek: () => void
  onSelectDeduction: (deductionId: string) => void
}

export function DealsTable({ 
  deals,
  onSelectDeal,
  onShowInvalids,
  onShowPayment,
  onShowQC,
  onShowCloseWeek,
  onSelectDeduction
}: DealsTableProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null)

  const handleDealClick = (deal: Deal) => {
    const newExpandedDeal = expandedDeal === deal.id ? null : deal.id
    setExpandedDeal(newExpandedDeal)
    if (newExpandedDeal) {
      onSelectDeal(deal)
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Week</TableHead>
              <TableHead className="text-right">Total Leads</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  Invalid
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
              </TableHead>
              <TableHead className="text-right">Final Bill</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map(deal => (
              <React.Fragment key={deal.id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleDealClick(deal)}
                >
                  <TableCell>
                    {expandedDeal === deal.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{deal.partner}</TableCell>
                  <TableCell>Week {deal.weekNumber}</TableCell>
                  <TableCell className="text-right">{deal.totalLeads}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-red-500 font-medium">{deal.invalid}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    ${deal.finalBill.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${deal.balance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={deal.status === "approved" ? "success" : "warning"} 
                      className="w-full justify-center"
                    >
                      {deal.status || "pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
                {expandedDeal === deal.id && (
                  <TableRow key={`${deal.id}-details`}>
                    <TableCell colSpan={8} className="p-4 bg-muted/50">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowInvalids()}
                          >
                            Process Invalids
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowPayment()}
                          >
                            Record Payment
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowQC()}
                          >
                            Quality Control
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowCloseWeek()}
                          >
                            Close Week
                          </Button>
                        </div>

                        {deal.days?.map((day) => (
                          <Card key={day.date}>
                            <CardHeader>
                              <CardTitle className="text-sm">
                                Daily Breakdown - {day.date}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Geo</TableHead>
                                    <TableHead className="text-right">Leads</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="text-right">Bill</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {day.deals.map((subDeal, index) => (
                                    <TableRow 
                                      key={index}
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={() => onSelectDeduction(`${deal.id}-${day.date}`)}
                                    >
                                      <TableCell>{subDeal.geo}</TableCell>
                                      <TableCell className="text-right">{subDeal.leads}</TableCell>
                                      <TableCell className="text-right">${subDeal.rate}</TableCell>
                                      <TableCell>{subDeal.source}</TableCell>
                                      <TableCell className="text-right">
                                        ${subDeal.bill.toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
