import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock } from 'lucide-react'

interface Deal {
  id: string
  partner: string
  weekNumber: number
  finalBill: number
  balance: number
  totalLeads: number
  invalid: number
  status: string
}

interface CloseWeekProps {
  deal: Deal
}

export function CloseWeek({ deal }: CloseWeekProps) {
  const [tasks, setTasks] = React.useState([
    { id: 'verify-leads', label: 'Verify all leads', completed: false },
    { id: 'process-invalids', label: 'Process invalid leads', completed: false },
    { id: 'check-payments', label: 'Check partner payments', completed: false },
    { id: 'review-deductions', label: 'Review deductions', completed: false },
  ])

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const allTasksCompleted = tasks.every(task => task.completed)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 w-full bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <Lock className="h-6 w-6 mb-2 text-blue-500" />
            <span className="text-sm font-semibold">Close Week</span>
            <span className="text-xs text-gray-500">Finalize weekly deals</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="text-xl font-semibold mb-2">Close Week</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-4">
          Complete the checklist to close {deal.partner}'s Week {deal.weekNumber}
        </DialogDescription>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm font-medium">Total Revenue</div>
              <div className="text-2xl font-bold">${deal.finalBill?.toLocaleString() || '0'}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-medium">Outstanding</div>
              <div className="text-2xl font-bold">${deal.balance?.toLocaleString() || '0'}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-medium">Total Leads</div>
              <div className="text-2xl font-bold">{deal.totalLeads?.toLocaleString() || '0'}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-medium">Invalid Leads</div>
              <div className="text-2xl font-bold">{deal.invalid?.toLocaleString() || '0'}</div>
            </Card>
          </div>

          {/* Checklist */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Closing Checklist</h3>
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
                  <label
                    htmlFor={task.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {task.label}
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              Cancel
            </Button>
            <Button
              disabled={!allTasksCompleted}
              onClick={() => console.log('Closing week...')}
            >
              Close Week
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
