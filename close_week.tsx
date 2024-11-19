import React from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Check,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Shield,
  XCircle,
  ChevronRight
} from 'lucide-react'

// Modal Content Component
function CloseWeekContent() {
  const [checkedItems, setCheckedItems] = React.useState({
    invalids: false,
    deductions: false,
    billAmount: false
  })
  const [closureType, setClosureType] = React.useState('')
  const [closureNote, setClosureNote] = React.useState('')

  // Mock data
  const weekSummary = {
    totalLeads: 370,
    processedInvalids: 12,
    finalBill: 17750,
    currentBalance: 2500,
    invalidRate: "3.2%",
    deductions: 3,
    paymentStatus: "Partial"
  }

  const allChecked = Object.values(checkedItems).every(Boolean)

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Close Week</h2>
            <div className="mt-1 text-sm text-gray-500">
              Partner A | Week 11 (Mar 15-21)
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Current Balance</div>
            <div className={`text-lg font-semibold ${
              weekSummary.currentBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${weekSummary.currentBalance}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Week Summary Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4" />
            Week Summary
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Leads</span>
              <span className="font-medium">{weekSummary.totalLeads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Invalid Rate</span>
              <span className="font-medium">{weekSummary.invalidRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Processed Invalids</span>
              <span className="font-medium">{weekSummary.processedInvalids}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Deductions</span>
              <span className="font-medium">{weekSummary.deductions}</span>
            </div>
            <div className="flex justify-between col-span-2 pt-2 border-t mt-2">
              <span className="font-medium">Final Bill Amount</span>
              <span className="font-medium">${weekSummary.finalBill}</span>
            </div>
          </div>
        </div>

        {/* Required Confirmations */}
        <div className="space-y-3">
          <h3 className="font-medium">Required Confirmations</h3>
          
          <div 
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              checkedItems.invalids ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => setCheckedItems(prev => ({ ...prev, invalids: !prev.invalids }))}
          >
            <div className="flex items-center gap-3">
              {checkedItems.invalids ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 border-2 rounded-full" />
              )}
              <div>
                <div className="font-medium">Invalid Leads Processed</div>
                <div className="text-sm text-gray-500">
                  {weekSummary.processedInvalids} leads verified and processed
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div 
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              checkedItems.deductions ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => setCheckedItems(prev => ({ ...prev, deductions: !prev.deductions }))}
          >
            <div className="flex items-center gap-3">
              {checkedItems.deductions ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 border-2 rounded-full" />
              )}
              <div>
                <div className="font-medium">Quality Deductions Verified</div>
                <div className="text-sm text-gray-500">
                  {weekSummary.deductions} deductions reviewed and applied
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div 
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              checkedItems.billAmount ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => setCheckedItems(prev => ({ ...prev, billAmount: !prev.billAmount }))}
          >
            <div className="flex items-center gap-3">
              {checkedItems.billAmount ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 border-2 rounded-full" />
              )}
              <div>
                <div className="font-medium">Final Bill Amount Confirmed</div>
                <div className="text-sm text-gray-500">
                  ${weekSummary.finalBill} final amount verified
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Closure Type */}
        {allChecked && (
          <div className="space-y-3">
            <h3 className="font-medium">Closure Type</h3>
            
            <div className="space-y-2">
              <div 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  closureType === 'zero' ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setClosureType('zero')}
              >
                {closureType === 'zero' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 border-2 rounded-full" />
                )}
                <div>
                  <div className="font-medium">Close with Zero Balance</div>
                  <div className="text-sm text-gray-500">All payments received and verified</div>
                </div>
              </div>

              <div 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  closureType === 'remaining' ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setClosureType('remaining')}
              >
                {closureType === 'remaining' ? (
                  <CheckCircle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <div className="h-5 w-5 border-2 rounded-full" />
                )}
                <div>
                  <div className="font-medium">Close with Remaining Balance</div>
                  <div className="text-sm text-gray-500">${weekSummary.currentBalance} to be carried forward</div>
                </div>
              </div>
            </div>

            {closureType === 'remaining' && (
              <div className="pt-2">
                <label className="block text-sm font-medium mb-1">
                  Closure Note (Required)
                </label>
                <Textarea
                  placeholder="Explain why closing with remaining balance..."
                  value={closureNote}
                  onChange={(e) => setClosureNote(e.target.value)}
                  className="h-20"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            disabled={!allChecked || !closureType || (closureType === 'remaining' && !closureNote)}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Close Week
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Export Component
export default function CloseWeek() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 w-full bg-white hover:bg-green-50 border-2 hover:border-green-200 transition-all"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <Check className="h-6 w-6 mb-2 text-green-500" />
            <span className="text-sm font-semibold">Close Week</span>
            <span className="text-xs text-gray-500">Finalize deals</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CloseWeekContent />
      </DialogContent>
    </Dialog>
  )
}