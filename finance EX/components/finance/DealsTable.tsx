import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'
import { Deal } from '@/types/finance'
import { DealDetails } from './DealDetails'

interface DealsTableProps {
  deals: Deal[]
}

export function DealsTable({ deals }: DealsTableProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null)
  const [expandedDeduction, setExpandedDeduction] = useState<string | null>(null)

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
                  onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
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
                      variant={deal.status === "Closed" ? "success" : "warning"} 
                      className="w-full justify-center"
                    >
                      {deal.status}
                    </Badge>
                  </TableCell>
                </TableRow>
                {expandedDeal === deal.id && (
                  <TableRow key={`${deal.id}-details`}>
                    <TableCell colSpan={8} className="p-0">
                      <DealDetails 
                        deal={deal}
                        expandedDeduction={expandedDeduction}
                        setExpandedDeduction={setExpandedDeduction}
                      />
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