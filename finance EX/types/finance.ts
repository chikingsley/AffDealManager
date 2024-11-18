export interface Deal {
  id: string
  partner: string
  weekNumber: number
  totalLeads: number
  invalid: number
  finalBill: number
  balance: number
  status: string
  payments: Payment[]
  days: DayRecord[]
}

export interface Payment {
  date: string
  amount: number
  txHash: string
  startBalance: number
  endBalance: number
}

export interface DayRecord {
  date: string
  totalLeads: number
  invalid: number
  dailyBill: number
  startBalance: number
  endBalance: number
  deals: SubDeal[]
}

export interface SubDeal {
  geo: string
  leads: number
  rate: string
  source: string
  bill: number
}

export interface WeekOption {
  value: string
  label: string
  dateRange: string
  totalValue: number
}