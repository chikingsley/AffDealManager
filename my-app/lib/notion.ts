import { Client } from "@notionhq/client"

if (!process.env.NOTION_TOKEN) {
  throw new Error("Missing NOTION_TOKEN environment variable")
}

if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("Missing NOTION_DATABASE_ID environment variable")
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

export const databaseId = process.env.NOTION_DATABASE_ID

export interface Deal {
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
  days: DayRecord[]
  payments: Payment[]
}

export interface DayRecord {
  date: string
  deals: DealFlow[]
  dailyBill: number
  endBalance: number
}

export interface DealFlow {
  geo: string
  leads: number
  rate: string
  source: string
  bill: number
}

export interface Payment {
  date: string
  amount: number
  txHash: string
  endBalance: number
}

export async function getDeals() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "last_updated",
          direction: "descending",
        },
      ],
    })

    return response.results.map((page) => {
      const properties = page.properties as any
      return {
        id: page.id,
        partner: properties.partner?.title?.[0]?.plain_text || "",
        weekNumber: properties.week_number?.number || 0,
        totalLeads: properties.total_leads?.number || 0,
        invalid: properties.invalid_leads?.number || 0,
        finalBill: properties.final_bill?.number || 0,
        balance: properties.balance?.number || 0,
        status: properties.status?.select?.name || 'Open',
        hash: properties.transaction_hash?.rich_text?.[0]?.plain_text || undefined,
        link: properties.payment_link?.url || undefined,
        days: JSON.parse(properties.daily_breakdown?.rich_text?.[0]?.plain_text || '[]'),
        payments: JSON.parse(properties.payments?.rich_text?.[0]?.plain_text || '[]'),
      }
    })
  } catch (error) {
    console.error("Error fetching deals:", error)
    throw new Error("Failed to fetch deals from Notion")
  }
}

export async function updateDealFinance(
  dealId: string,
  data: Partial<Pick<Deal, 
    'totalLeads' | 'invalid' | 'finalBill' | 'balance' | 'status' | 
    'hash' | 'link' | 'days' | 'payments'
  >>
) {
  try {
    const properties: any = {}
    
    if (data.totalLeads !== undefined) {
      properties.total_leads = { number: data.totalLeads }
    }
    if (data.invalid !== undefined) {
      properties.invalid_leads = { number: data.invalid }
    }
    if (data.finalBill !== undefined) {
      properties.final_bill = { number: data.finalBill }
    }
    if (data.balance !== undefined) {
      properties.balance = { number: data.balance }
    }
    if (data.status !== undefined) {
      properties.status = { select: { name: data.status } }
    }
    if (data.hash !== undefined) {
      properties.transaction_hash = {
        rich_text: [{ text: { content: data.hash } }]
      }
    }
    if (data.link !== undefined) {
      properties.payment_link = { url: data.link }
    }
    if (data.days !== undefined) {
      properties.daily_breakdown = {
        rich_text: [{ text: { content: JSON.stringify(data.days) } }]
      }
    }
    if (data.payments !== undefined) {
      properties.payments = {
        rich_text: [{ text: { content: JSON.stringify(data.payments) } }]
      }
    }

    await notion.pages.update({
      page_id: dealId,
      properties,
    })
  } catch (error) {
    console.error("Error updating deal finance:", error)
    throw new Error("Failed to update deal finance in Notion")
  }
}
