import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import type { Deal } from "@/lib/notion"

interface QualityControlProps {
  deal?: Deal
}

export function QualityControl({ deal }: QualityControlProps) {
  const [numLeads, setNumLeads] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [documentation, setDocumentation] = React.useState("")
  const [note, setNote] = React.useState("")
  const [closureType, setClosureType] = React.useState("standard")
  const [supplierNotes, setSupplierNotes] = React.useState("")

  // Default values if deal is undefined
  const totalLeads = deal?.totalLeads || 0
  const invalid = deal?.invalid || 0
  const finalBill = deal?.finalBill || 0
  const invalidRate = totalLeads > 0 ? (invalid / totalLeads) * 100 : 0
  const threshold = 8 // Example threshold

  const calculateImpact = () => {
    const deductionNum = parseInt(numLeads) || 0
    const newInvalidRate = totalLeads > 0 ? ((invalid + deductionNum) / totalLeads) * 100 : 0
    const remainingLeads = totalLeads - invalid - deductionNum
    const updatedBill = finalBill * (remainingLeads / totalLeads)

    return { newInvalidRate, remainingLeads, updatedBill }
  }

  const impact = calculateImpact()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 w-full bg-white hover:bg-green-50 border-2 hover:border-green-200 transition-all"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <Shield className="h-6 w-6 mb-2 text-green-500" />
            <span className="text-sm font-semibold">Quality Control</span>
            <span className="text-xs text-gray-500">Review deal quality</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <DialogTitle className="text-xl">Quality Control</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">Manage deductions and supplier performance</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Week Performance */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Week Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Base Leads</p>
                <p className="text-lg font-semibold">{totalLeads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Invalids</p>
                <p className="text-lg font-semibold">
                  {invalid} ({invalidRate.toFixed(1)}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invalid Threshold</p>
                <p className="text-lg font-semibold">{threshold}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={invalidRate > threshold ? "destructive" : "success"}>
                  {invalidRate > threshold ? "Above Threshold" : "Within Limits"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Supplier Notes */}
          <div>
            <Label>Supplier Week Notes</Label>
            <Textarea
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              placeholder="Record any notable events, communications, or issues with the supplier this week..."
              className="h-20"
            />
          </div>

          {/* Add Deductions */}
          <div className="grid gap-4">
            <div>
              <Label>Number of Leads</Label>
              <Input
                type="number"
                value={numLeads}
                onChange={(e) => setNumLeads(e.target.value)}
                placeholder="Enter number of leads..."
              />
            </div>

            <div>
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deduction reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue (our platform)</SelectItem>
                  <SelectItem value="accidental">Accidental Send (after closure)</SelectItem>
                  <SelectItem value="spam">Spam/Bot Detection</SelectItem>
                  <SelectItem value="quality">Quality Concession (good faith)</SelectItem>
                  <SelectItem value="disputed">Disputed Quality (termination)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Impact Preview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">New Invalid Rate</p>
                <p className="text-lg font-semibold">
                  {impact.newInvalidRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads After Deduction</p>
                <p className="text-lg font-semibold">{impact.remainingLeads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated Bill</p>
                <p className="text-lg font-semibold">
                  ${impact.updatedBill.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="space-y-4">
            <div>
              <Label>Affected Lead IDs/Emails</Label>
              <Textarea
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                placeholder="Paste affected lead information..."
                className="h-20"
              />
            </div>
            <div>
              <Label>Internal Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Document communication, specific issues, and future implications..."
                className="h-20"
              />
            </div>
          </div>

          {/* Closure Impact */}
          <div>
            <h3 className="font-semibold mb-3">Closure Impact</h3>
            <RadioGroup value={closureType} onValueChange={setClosureType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard">Standard Closure (maintain relationship)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prejudice" id="prejudice" />
                <Label htmlFor="prejudice" className="text-destructive">
                  Close with Prejudice (end relationship)
                </Label>
              </div>
            </RadioGroup>
            {closureType === "prejudice" && (
              <p className="text-sm text-destructive mt-2">
                Note: Will flag account as "Do Not Renew"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {}}>
              Cancel
            </Button>
            <Button
              disabled={!numLeads || !reason || !note}
              onClick={() => {
                // Handle deductions logic
                console.log('Submitting quality control:', {
                  numLeads,
                  reason,
                  documentation,
                  note,
                  closureType,
                  supplierNotes,
                  impact
                })
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}