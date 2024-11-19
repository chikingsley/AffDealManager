import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

// Mock data - replace with actual data from your API
const mockInvalidLeads = [
  { id: '1', partner: 'Partner A', date: '2024-02-20', reason: 'Invalid Email', status: 'pending' },
  { id: '2', partner: 'Partner B', date: '2024-02-21', reason: 'Duplicate Entry', status: 'approved' },
  { id: '3', partner: 'Partner A', date: '2024-02-22', reason: 'Wrong Format', status: 'rejected' },
]

interface Deal {
  partner: string
  weekNumber: number
}

interface ProcessInvalidsProps {
  deal?: Deal
}

export function ProcessInvalids({ deal }: ProcessInvalidsProps) {
  const [selectedLeads, setSelectedLeads] = React.useState<string[]>([])
  
  const handleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === mockInvalidLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(mockInvalidLeads.map(lead => lead.id))
    }
  }

  const handleProcessSelected = async () => {
    console.log('Processing leads:', selectedLeads)
    // Implement your processing logic here
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 w-full bg-white hover:bg-yellow-50 border-2 hover:border-yellow-200 transition-all"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative">
              <AlertCircle className="h-6 w-6 mb-2 text-yellow-500" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {mockInvalidLeads.length}
              </div>
            </div>
            <span className="text-sm font-semibold">Process Invalids</span>
            <span className="text-xs text-gray-500">{mockInvalidLeads.length} pending verification</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="text-xl font-semibold mb-2">Process Invalid Leads</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-4">
          {deal ? `Review and process invalid leads for ${deal.partner} - Week ${deal.weekNumber}` : 'Review and process invalid leads'}
        </DialogDescription>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-9"
              >
                {selectedLeads.length === mockInvalidLeads.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedLeads.length} selected
              </span>
            </div>
            <Button
              size="sm"
              disabled={selectedLeads.length === 0}
              onClick={handleProcessSelected}
              className="h-9"
            >
              Process Selected
            </Button>
          </div>

          <Card className="border rounded-lg">
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvalidLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.partner}</TableCell>
                      <TableCell>{lead.date}</TableCell>
                      <TableCell>{lead.reason}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={
                            lead.status === 'approved' ? 'success' : 
                            lead.status === 'rejected' ? 'destructive' : 
                            'warning'
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Approve', lead.id)
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Reject', lead.id)
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}