import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Copy, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import type { Deal } from "@/lib/notion"

interface InvalidsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
  onProcessInvalids: (results: string) => Promise<void>
}

interface InvalidLead {
  email: string
  phone: string
  name: string
  status: string
}

export function InvalidsDialog({ 
  open, 
  onOpenChange,
  deal,
  onProcessInvalids
}: InvalidsDialogProps) {
  const [processedResults, setProcessedResults] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // In a real app, this would come from your database
  const invalidLeads: InvalidLead[] = [
    { email: "user1@example.com", phone: "+1234567890", name: "John Doe", status: "Wrong Number" },
    { email: "user2@example.com", phone: "+1234567891", name: "Jane Smith", status: "Voicemail" },
    { email: "user3@example.com", phone: "+1234567892", name: "Mike Johnson", status: "Invalid Email" },
  ]

  const handleCopyInvalidLeads = () => {
    const formattedData = invalidLeads
      .map(lead => `${lead.name}, ${lead.email}, ${lead.phone}, ${lead.status}`)
      .join('\n')
    navigator.clipboard.writeText(formattedData)
  }

  const handleSaveResults = async () => {
    if (!processedResults.trim()) return
    
    setIsSaving(true)
    try {
      await onProcessInvalids(processedResults)
      onOpenChange(false)
    } catch (error) {
      console.error('Error processing invalids:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Process Invalid Leads</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Current invalid count: {deal.invalid}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Invalid Leads Data</h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCopyInvalidLeads}
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invalidLeads.map((lead, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Results</label>
            <Textarea
              placeholder="Paste verification results here..."
              value={processedResults}
              onChange={(e) => setProcessedResults(e.target.value)}
              className="h-32"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveResults} 
              disabled={isSaving || !processedResults.trim()}
            >
              {isSaving ? "Saving..." : "Save Results"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
