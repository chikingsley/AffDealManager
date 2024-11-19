import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard } from 'lucide-react'
import type { Deal } from "@/lib/notion"

interface RecordPaymentProps {
  deal?: Deal
}

export function RecordPayment({ deal }: RecordPaymentProps) {
  const [amount, setAmount] = React.useState('')
  const [reference, setReference] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Recording payment:', { amount, reference })
    // Implement your payment recording logic here
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 w-full bg-white hover:bg-purple-50 border-2 hover:border-purple-200 transition-all"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <CreditCard className="h-6 w-6 mb-2 text-purple-500" />
            <span className="text-sm font-semibold">Record Payment</span>
            <span className="text-xs text-gray-500">Log partner payment</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-2">Record Payment</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm text-muted-foreground mb-4">
          {deal ? `Record a payment from ${deal.partner} for Week ${deal.weekNumber}` : 'Record a partner payment'}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Payment Reference</Label>
            <Input
              id="reference"
              placeholder="e.g., Invoice #123"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
