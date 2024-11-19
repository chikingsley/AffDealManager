import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isProcessing: boolean
  onSubmit: (txHash: string, amount: number) => Promise<void>
}

export function PaymentDialog({ 
  open, 
  onOpenChange,
  isProcessing,
  onSubmit
}: PaymentDialogProps) {
  const [txHash, setTxHash] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!txHash || !amount) {
      setError('Please fill in all fields')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      await onSubmit(txHash, amountNum)
      setTxHash('')
      setAmount('')
      setError(null)
    } catch (err) {
      setError('Failed to process payment')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record New Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Transaction Hash</label>
            <Input 
              placeholder="Enter transaction hash..." 
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input 
              type="number" 
              placeholder="Enter amount..." 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false)
                setError(null)
                setTxHash('')
                setAmount('')
              }}
            >
              Cancel
            </Button>
            <Button disabled={isProcessing} onClick={handleSubmit}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}