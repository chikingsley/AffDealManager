import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield } from 'lucide-react'
import { useState } from 'react'
import type { Deal } from "@/lib/notion"

interface QualityControlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
  onSubmitQC: (data: QCData) => Promise<void>
}

interface QCData {
  duplicateCount: number
  fraudCount: number
  notes: string
  isApproved: boolean
}

export function QualityControlDialog({ 
  open, 
  onOpenChange,
  deal,
  onSubmitQC
}: QualityControlDialogProps) {
  const [duplicateCount, setDuplicateCount] = useState("0")
  const [fraudCount, setFraudCount] = useState("0")
  const [notes, setNotes] = useState("")
  const [isApproved, setIsApproved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    try {
      await onSubmitQC({
        duplicateCount: parseInt(duplicateCount),
        fraudCount: parseInt(fraudCount),
        notes,
        isApproved
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting QC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <DialogTitle>Quality Control Review</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Total Leads: {deal.totalLeads}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duplicates">Duplicate Leads</Label>
              <Input
                id="duplicates"
                type="number"
                value={duplicateCount}
                onChange={(e) => setDuplicateCount(e.target.value)}
                min="0"
                max={deal.totalLeads}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fraud">Fraudulent Leads</Label>
              <Input
                id="fraud"
                type="number"
                value={fraudCount}
                onChange={(e) => setFraudCount(e.target.value)}
                min="0"
                max={deal.totalLeads}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">QC Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any quality control notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="approval"
              checked={isApproved}
              onCheckedChange={(checked) => setIsApproved(checked as boolean)}
            />
            <Label htmlFor="approval" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Approve for Payment
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit QC"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
