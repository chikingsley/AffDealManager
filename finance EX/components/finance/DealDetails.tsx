import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle, DollarSign, Check, Shield } from 'lucide-react'
import { Deal } from '@/types/finance'
import { Timeline } from './Timeline'
import { DealBreakdown } from './DealBreakdown'
import { InvalidsDialog } from './InvalidsDialog'
import { PaymentDialog } from './PaymentDialog'
import { CloseWeekDialog } from './CloseWeekDialog'
import { QualityControlDialog } from './QualityControlDialog'
import { WeeklySummary } from './WeeklySummary'

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleProcessPayment = async (txHash: string, amount: number) => {
    setIsProcessingPayment(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessingPayment(false)
    setShowPaymentDialog(false)
  }

  return (
    <div className="bg-muted/5 p-6">
      <Timeline 
        deal={deal}
        expandedDeduction={expandedDeduction}
        setExpandedDeduction={setExpandedDeduction}
        showFilters={showFilters}
      />

      {expandedDeduction && (
        <DealBreakdown 
          deal={deal}
          deductionId={expandedDeduction}
        />
      )}

      <WeeklySummary deal={deal} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <Button
          variant="outline"
          className="h-16"
          onClick={() => setShowInvalidsDialog(true)}
        >
          <div className="flex flex-col items-center">
            <AlertCircle className="h-4 w-4 mb-1" />
            <span className="text-sm">Process Invalids</span>
            <span className="text-xs text-muted-foreground">{deal.invalid} pending</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          onClick={() => setShowPaymentDialog(true)}
        >
          <div className="flex flex-col items-center">
            <DollarSign className="h-4 w-4 mb-1" />
            <span className="text-sm">Record Payment</span>
            <span className="text-xs text-muted-foreground">Add transaction</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          onClick={() => setShowQualityControlDialog(true)}
        >
          <div className="flex flex-col items-center">
            <Shield className="h-4 w-4 mb-1" />
            <span className="text-sm">Quality Control</span>
            <span className="text-xs text-muted-foreground">Manage deductions</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16" 
          disabled={deal.invalid > 0}
          onClick={() => setShowCloseWeekDialog(true)}
        >
          <div className="flex flex-col items-center">
            <Check className="h-4 w-4 mb-1" />
            <span className="text-sm">Close Week</span>
            <span className="text-xs text-muted-foreground">Finalize deals</span>
          </div>
        </Button>
      </div>

      <InvalidsDialog 
        open={showInvalidsDialog}
        onOpenChange={setShowInvalidsDialog}
      />

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        isProcessing={isProcessingPayment}
        onSubmit={handleProcessPayment}
      />

      <CloseWeekDialog 
        open={showCloseWeekDialog}
        onOpenChange={setShowCloseWeekDialog}
        deal={deal}
      />

      <QualityControlDialog
        open={showQualityControlDialog}
        onOpenChange={setShowQualityControlDialog}
        deal={deal}
      />
    </div>
  )
}