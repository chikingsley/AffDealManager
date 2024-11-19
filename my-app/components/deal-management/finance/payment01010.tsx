import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Loader2, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'

// Modal Content Component
function RecordPaymentContent() {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [txHash, setTxHash] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [validationStatus, setValidationStatus] = React.useState(null)

  const handleValidate = async () => {
    setIsProcessing(true)
    // Simulate blockchain validation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setValidationStatus('success')
    setIsProcessing(false)
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <DialogTitle className="text-xl font-semibold mb-2">Record Payment</DialogTitle>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mt-1 text-sm text-gray-500">
              Partner A | Week 11 (Mar 15-21)
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Outstanding Balance</div>
            <div className="text-lg font-semibold text-red-600">$17,750</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Transaction Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction Hash
            </label>
            <div className="relative">
              <Input
                placeholder="Enter transaction hash..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="pr-24"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleValidate}
                disabled={!txHash || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Validate'
                )}
              </Button>
            </div>
            {validationStatus === 'success' && (
              <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Transaction verified
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-6"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
            </div>
          </div>
        </div>

        {/* Balance Impact Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Balance Impact</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Balance</span>
              <span className="font-medium">$17,750</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Payment Amount</span>
              <span className="font-medium">-${amount || '0'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">New Balance</span>
              <span className="font-medium">
                ${(17750 - (parseFloat(amount) || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Warning for Unverified Transaction */}
        {txHash && !validationStatus && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800">Transaction Unverified</div>
              <div className="text-yellow-700">Please validate the transaction hash before proceeding.</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            disabled={!txHash || !amount || !validationStatus || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Export Component
export default function RecordPayment() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 w-full bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <DollarSign className="h-6 w-6 mb-2 text-blue-500" />
            <span className="text-sm font-semibold">Record Payment</span>
            <span className="text-xs text-gray-500">Add transaction</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <RecordPaymentContent />
      </DialogContent>
    </Dialog>
  )
}