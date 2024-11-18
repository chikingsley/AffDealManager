import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from 'lucide-react'
import { useState } from 'react'
import type { Deal } from "@/lib/notion"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
  onRecordPayment: (amount: number, hash: string) => Promise<void>
}

export function PaymentDialog({ 
  open, 
  onOpenChange,
  deal,
  onRecordPayment
}: PaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [hash, setHash] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !hash) return

    setIsProcessing(true)
    try {
      await onRecordPayment(parseFloat(amount), hash)
      onOpenChange(false)
    } catch (error) {
      console.error('Error recording payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <DialogTitle>Record Payment</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Current balance: ${deal.balance.toLocaleString()}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                max={deal.balance}
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hash">Transaction Hash</Label>
            <Input
              id="hash"
              placeholder="0x..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing || !amount || !hash}
            >
              {isProcessing ? "Processing..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
