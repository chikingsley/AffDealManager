import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarCheck2 } from 'lucide-react'
import { useState } from 'react'
import type { Deal } from "@/lib/notion"

interface CloseWeekDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  weekNumber: number
  deals: Deal[]
  onCloseWeek: () => Promise<void>
}

interface WeekSummary {
  totalDeals: number
  totalLeads: number
  totalInvalids: number
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
}

export function CloseWeekDialog({ 
  open, 
  onOpenChange,
  weekNumber,
  deals,
  onCloseWeek
}: CloseWeekDialogProps) {
  const [isClosing, setIsClosing] = useState(false)

  const weekSummary: WeekSummary = deals.reduce((summary, deal) => ({
    totalDeals: summary.totalDeals + 1,
    totalLeads: summary.totalLeads + deal.totalLeads,
    totalInvalids: summary.totalInvalids + (deal.invalid || 0),
    totalBilled: summary.totalBilled + deal.finalBill,
    totalPaid: summary.totalPaid + (deal.finalBill - deal.balance),
    outstandingBalance: summary.outstandingBalance + deal.balance
  }), {
    totalDeals: 0,
    totalLeads: 0,
    totalInvalids: 0,
    totalBilled: 0,
    totalPaid: 0,
    outstandingBalance: 0
  })

  const handleCloseWeek = async () => {
    setIsClosing(true)
    try {
      await onCloseWeek()
      onOpenChange(false)
    } catch (error) {
      console.error('Error closing week:', error)
    } finally {
      setIsClosing(false)
    }
  }

  const hasOutstandingBalance = weekSummary.outstandingBalance > 0
  const hasUnreviewedDeals = deals.some(deal => !deal.status || deal.status === 'pending')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5" />
            <DialogTitle>Close Week {weekNumber}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium">Week Summary</Label>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Deals</TableCell>
                  <TableCell className="text-right">{weekSummary.totalDeals}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Leads</TableCell>
                  <TableCell className="text-right">{weekSummary.totalLeads}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Invalid Leads</TableCell>
                  <TableCell className="text-right">{weekSummary.totalInvalids}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Billed</TableCell>
                  <TableCell className="text-right">${weekSummary.totalBilled.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Paid</TableCell>
                  <TableCell className="text-right">${weekSummary.totalPaid.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Outstanding Balance</TableCell>
                  <TableCell className="text-right text-red-500">${weekSummary.outstandingBalance.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {(hasOutstandingBalance || hasUnreviewedDeals) && (
            <div className="space-y-2">
              <Label className="text-lg font-medium">Warnings</Label>
              <ul className="list-disc list-inside space-y-1 text-yellow-600">
                {hasOutstandingBalance && (
                  <li>There are outstanding balances totaling ${weekSummary.outstandingBalance.toLocaleString()}</li>
                )}
                {hasUnreviewedDeals && (
                  <li>Some deals have not been reviewed or approved</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCloseWeek}
              disabled={isClosing}
            >
              {isClosing ? "Closing..." : "Close Week"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
