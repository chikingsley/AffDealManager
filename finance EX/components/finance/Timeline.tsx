import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, ArrowDownRight, ExternalLink, Search } from 'lucide-react'
import { Deal } from '@/types/finance'
import { useState } from 'react'

interface TimelineProps {
  deal: Deal
  expandedDeduction: string | null
  setExpandedDeduction: (id: string | null) => void
  showFilters: boolean
}

export function Timeline({ 
  deal, 
  expandedDeduction, 
  setExpandedDeduction,
  showFilters 
}: TimelineProps) {
  const [dateFilter, setDateFilter] = useState('')
  const [amountFilter, setAmountFilter] = useState('')

  const timelineItems = [...deal.payments, ...deal.days]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter(item => {
      if (!dateFilter && !amountFilter) return true
      
      const matchesDate = !dateFilter || item.date.includes(dateFilter)
      const amount = 'amount' in item ? item.amount : item.dailyBill
      const matchesAmount = !amountFilter || amount.toString().includes(amountFilter)
      
      return matchesDate && matchesAmount
    })

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Deal Timeline</h3>
          {showFilters && (
            <div className="flex gap-2">
              <div className="relative w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by date..."
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="relative w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by amount..."
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timelineItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  {'amount' in item ? (
                    <span className="flex items-center text-green-600">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      Payment Received
                    </span>
                  ) : (
                    <div>
                      <span className="flex items-center text-red-600 mb-1">
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                        Deal Flow
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {item.deals.map((deal, i) => (
                          <div key={i}>
                            {deal.geo}: {deal.leads} leads ({deal.rate}) - ${deal.bill.toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {'amount' in item ? (
                    <span className="text-green-600">+${item.amount.toLocaleString()}</span>
                  ) : (
                    <span className="text-red-600">-${item.dailyBill.toLocaleString()}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">${item.endBalance.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {'amount' in item ? (
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>{item.txHash}</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setExpandedDeduction(
                        expandedDeduction === `${deal.id}-${item.date}` 
                          ? null 
                          : `${deal.id}-${item.date}`
                      )}
                    >
                      View Deals
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}