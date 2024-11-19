import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle, DollarSign, Check, Shield } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Timeline } from './Timeline'
import { WeeklySummary } from './WeeklySummary'

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

interface DealDetailsProps {
  deal: Deal
  expandedDeduction: string | null
  setExpandedDeduction: (id: string | null) => void
}

export function DealDetails({ 
  deal, 
  expandedDeduction, 
  setExpandedDeduction 
}: DealDetailsProps) {
  const [showInvalidsDialog, setShowInvalidsDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showCloseWeekDialog, setShowCloseWeekDialog] = useState(false)
  const [showQualityControlDialog, setShowQualityControlDialog] = useState(false)

  return (
    <div className="bg-muted/5 p-6">
      <Timeline 
        deal={deal}
        expandedDeduction={expandedDeduction}
        setExpandedDeduction={setExpandedDeduction}
      />

      <WeeklySummary deal={deal} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <Dialog open={showInvalidsDialog} onOpenChange={setShowInvalidsDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-16"
            >
              <div className="flex flex-col items-center">
                <AlertCircle className="h-4 w-4 mb-1" />
                <span className="text-sm">Process Invalids</span>
                <span className="text-xs text-muted-foreground">{deal.invalid} pending</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Invalid Leads</DialogTitle>
            </DialogHeader>
            {/* Add invalid processing form here */}
          </DialogContent>
        </Dialog>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="h-16"
            >
              <div className="flex flex-col items-center">
                <DollarSign className="h-4 w-4 mb-1" />
                <span className="text-sm">Record Payment</span>
                <span className="text-xs text-muted-foreground">Add transaction</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            {/* Add payment form here */}
          </DialogContent>
        </Dialog>

        <Dialog open={showQualityControlDialog} onOpenChange={setShowQualityControlDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="h-16"
            >
              <div className="flex flex-col items-center">
                <Shield className="h-4 w-4 mb-1" />
                <span className="text-sm">Quality Control</span>
                <span className="text-xs text-muted-foreground">Manage deductions</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quality Control</DialogTitle>
            </DialogHeader>
            {/* Add quality control form here */}
          </DialogContent>
        </Dialog>

        <Dialog open={showCloseWeekDialog} onOpenChange={setShowCloseWeekDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="h-16"
              disabled={deal.invalid > 0}
            >
              <div className="flex flex-col items-center">
                <Check className="h-4 w-4 mb-1" />
                <span className="text-sm">Close Week</span>
                <span className="text-xs text-muted-foreground">
                  {deal.invalid > 0 ? 'Process invalids first' : 'Finalize deal'}
                </span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Week</DialogTitle>
            </DialogHeader>
            {/* Add close week form here */}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
