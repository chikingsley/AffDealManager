import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Deal {
  id: string
  partner: string
  weekNumber: number
  totalLeads: number
  invalid: number
  finalBill: number
  balance: number
  status: 'Open' | 'Closed'
  hash?: string
  link?: string
}

interface TimelineProps {
  deal: Deal
  expandedDeduction: string | null
  setExpandedDeduction: (id: string | null) => void
}

interface TimelineEvent {
  id: string
  type: 'payment' | 'invalid' | 'deduction'
  date: string
  amount: number
  description: string
  hash?: string
  link?: string
}

// This would come from your database
const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'payment',
    date: '2024-02-20',
    amount: 5000,
    description: 'Initial payment received',
    hash: '0x123...',
  },
  {
    id: '2',
    type: 'invalid',
    date: '2024-02-21',
    amount: -200,
    description: 'Invalid leads processed',
  },
  {
    id: '3',
    type: 'deduction',
    date: '2024-02-22',
    amount: -300,
    description: 'Quality control deduction',
  },
]

export function Timeline({ 
  deal,
  expandedDeduction,
  setExpandedDeduction,
}: TimelineProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Timeline</h3>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {mockTimelineEvents.map(event => (
              <div 
                key={event.id}
                className="flex items-start gap-4 text-sm"
              >
                <div className="min-w-[100px] text-muted-foreground">
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {event.type === 'deduction' && (
                      <button
                        onClick={() => setExpandedDeduction(
                          expandedDeduction === event.id ? null : event.id
                        )}
                        className="p-0.5 hover:bg-muted rounded"
                      >
                        {expandedDeduction === event.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <span>{event.description}</span>
                  </div>
                  <div className="mt-1">
                    <span className={event.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                      {event.amount < 0 ? '-' : '+'}${Math.abs(event.amount).toLocaleString()}
                    </span>
                    {event.hash && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Hash: {event.hash}
                      </span>
                    )}
                    {event.link && (
                      <a 
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-blue-500 hover:underline"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
