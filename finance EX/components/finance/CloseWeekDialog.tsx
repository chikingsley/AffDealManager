import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Deal } from "@/types/finance"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface CloseWeekDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
}

export function CloseWeekDialog({ open, onOpenChange, deal }: CloseWeekDialogProps) {
  const [closureType, setClosureType] = useState("zero")
  const [note, setNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmations, setConfirmations] = useState({
    invalids: false,
    deductions: false,
    finalBill: false,
  })

  const allConfirmed = Object.values(confirmations).every(Boolean)
  const requiresNote = closureType === "balance" && deal.balance > 0
  const canClose = allConfirmed && (!requiresNote || (requiresNote && note.trim().length > 0))

  const handleCloseWeek = async () => {
    if (!canClose) return

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Close the dialog
      onOpenChange(false)
      
      // Reset state
      setClosureType("zero")
      setNote("")
      setConfirmations({
        invalids: false,
        deductions: false,
        finalBill: false,
      })
    } catch (error) {
      console.error("Failed to close week:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Close Week - {deal.partner}, Week {deal.weekNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Week Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              📊 Week Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-lg font-semibold">{deal.totalLeads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processed Invalids</p>
                <p className="text-lg font-semibold">{deal.invalid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final Bill</p>
                <p className="text-lg font-semibold text-green-600">
                  ${deal.finalBill.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-lg font-semibold">
                  ${deal.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Required Confirmations */}
          <div className="space-y-4">
            <h3 className="font-semibold">✓ Required Confirmations</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="invalids"
                  checked={confirmations.invalids}
                  onCheckedChange={(checked) => 
                    setConfirmations(prev => ({...prev, invalids: checked as boolean}))
                  }
                />
                <Label htmlFor="invalids">
                  All invalid leads processed ({deal.invalid}/{deal.invalid})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deductions"
                  checked={confirmations.deductions}
                  onCheckedChange={(checked) => 
                    setConfirmations(prev => ({...prev, deductions: checked as boolean}))
                  }
                />
                <Label htmlFor="deductions">Additional deductions verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="finalBill"
                  checked={confirmations.finalBill}
                  onCheckedChange={(checked) => 
                    setConfirmations(prev => ({...prev, finalBill: checked as boolean}))
                  }
                />
                <Label htmlFor="finalBill">Final bill amount confirmed</Label>
              </div>
            </div>
          </div>

          {/* Closure Type */}
          <div className="space-y-4">
            <h3 className="font-semibold">Closure Type</h3>
            <RadioGroup
              value={closureType}
              onValueChange={setClosureType}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zero" id="zero" />
                <Label htmlFor="zero">Close with zero balance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balance" id="balance" />
                <Label htmlFor="balance">
                  Close with remaining balance (${deal.balance.toLocaleString()})
                </Label>
              </div>
            </RadioGroup>

            {requiresNote && (
              <Textarea
                placeholder="Required note for closing with balance..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              disabled={!canClose || isProcessing}
              onClick={handleCloseWeek}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Close Week'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}