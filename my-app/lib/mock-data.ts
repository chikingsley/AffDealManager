import type { Deal } from "./notion"

export const mockDeal: Deal = {
  id: "1",
  partner: "Example Partner",
  weekNumber: 23,
  totalLeads: 1500,
  invalid: 120,
  finalBill: 45000,
  balance: 15000,
  status: 'Open',
  days: [
    {
      date: "2024-01-15",
      deals: [
        {
          geo: "US",
          leads: 200,
          rate: "150+10",
          source: "Facebook",
          bill: 8000,
        },
        {
          geo: "UK",
          leads: 150,
          rate: "130+8",
          source: "Google",
          bill: 5200,
        }
      ],
      dailyBill: 13200,
      endBalance: 13200
    },
    {
      date: "2024-01-16",
      deals: [
        {
          geo: "CA",
          leads: 180,
          rate: "140+9",
          source: "Instagram",
          bill: 6800,
        }
      ],
      dailyBill: 6800,
      endBalance: 20000
    }
  ],
  payments: [
    {
      date: "2024-01-14",
      amount: 30000,
      txHash: "0x123...abc",
      endBalance: -30000
    }
  ]
}
