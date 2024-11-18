import { useState, useEffect } from 'react'
import { Deal, WeekOption } from '@/types/finance'

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([])

  useEffect(() => {
    // In a real app, this would be an API call
    const mockDeals: Deal[] = [
      {
        id: "deal-1",
        partner: "Partner A",
        weekNumber: 52,
        totalLeads: 370,
        invalid: 12,
        finalBill: 17750,
        balance: 2250,
        status: "Open",
        payments: [
          { 
            date: "2023-03-14", 
            amount: 20000, 
            txHash: "0x1234...5678", 
            startBalance: 0, 
            endBalance: 20000 
          }
        ],
        days: [
          { 
            date: "2023-03-15", 
            totalLeads: 100, 
            invalid: 4, 
            dailyBill: 4750, 
            startBalance: 20000, 
            endBalance: 15250,
            deals: [
              { 
                geo: "UK", 
                leads: 50, 
                rate: "1400+13", 
                source: "Facebook", 
                bill: 2350 
              },
              { 
                geo: "CA", 
                leads: 50, 
                rate: "2000+20", 
                source: "Google", 
                bill: 2400 
              }
            ]
          },
          { 
            date: "2023-03-16", 
            totalLeads: 120, 
            invalid: 3, 
            dailyBill: 5850, 
            startBalance: 15250, 
            endBalance: 9400,
            deals: [
              { 
                geo: "UK", 
                leads: 60, 
                rate: "1400+13", 
                source: "Facebook", 
                bill: 2820 
              },
              { 
                geo: "CA", 
                leads: 60, 
                rate: "2000+20", 
                source: "Google", 
                bill: 3030 
              }
            ]
          },
          { 
            date: "2023-03-17", 
            totalLeads: 150, 
            invalid: 5, 
            dailyBill: 7150, 
            startBalance: 9400, 
            endBalance: 2250,
            deals: [
              { 
                geo: "UK", 
                leads: 75, 
                rate: "1400+13", 
                source: "Facebook", 
                bill: 3525 
              },
              { 
                geo: "CA", 
                leads: 75, 
                rate: "2000+20", 
                source: "Google", 
                bill: 3625 
              }
            ]
          }
        ],
      },
      {
        id: "deal-2",
        partner: "Partner B",
        weekNumber: 52,
        totalLeads: 280,
        invalid: 8,
        finalBill: 13500,
        balance: 1800,
        status: "Open",
        payments: [
          {
            date: "2023-03-13",
            amount: 15000,
            txHash: "0x5678...9012",
            startBalance: 0,
            endBalance: 15000
          }
        ],
        days: [
          {
            date: "2023-03-14",
            totalLeads: 90,
            invalid: 3,
            dailyBill: 4200,
            startBalance: 15000,
            endBalance: 10800,
            deals: [
              {
                geo: "US",
                leads: 45,
                rate: "1600+15",
                source: "Facebook",
                bill: 2025
              },
              {
                geo: "UK",
                leads: 45,
                rate: "1400+13",
                source: "Google",
                bill: 2175
              }
            ]
          }
        ]
      }
    ]

    setDeals(mockDeals)

    // Generate week options
    const currentDate = new Date()
    const weeks: WeekOption[] = []
    
    for (let i = 0; i < 52; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() - (i * 7))
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      weeks.push({
        value: `week-${52 - i}`,
        label: i === 0 ? 'Current Week' :
               i === 1 ? 'Previous Week' :
               `Week ${52 - i}`,
        dateRange: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        totalValue: Math.floor(Math.random() * 100000)
      })
    }

    setWeekOptions(weeks)
  }, [])

  return { deals, weekOptions }
}