import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"
import { getFromCache, setInCache, generateCacheKey } from "@/lib/redis"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.OFFERS_DATABASE_ID

const formatPrice = (props: any) => {
  // Get CPA, CRG, and CPL values from the brand selling properties
  const cpa = props["CPA | Brand | Selling"]?.number
  const crg = props["CRG | Brand | Selling"]?.number ? 
    (props["CRG | Brand | Selling"].number * 100) : undefined
  const cpl = props["CPL | Brand | Selling"]?.number
  
  // Format numbers to avoid floating point errors
  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "0"
    // Handle potential floating point errors
    const fixed = Number(num.toFixed(2))
    return fixed === Math.floor(fixed) ? fixed.toString() : fixed.toFixed(2)
  }
  
  console.log('Price values:', { cpa, crg, cpl })
  
  const hasCPA = typeof cpa === 'number' || typeof crg === 'number'
  const hasCPL = typeof cpl === 'number'

  // If no values are set, return warning
  if (!hasCPA && !hasCPL) {
    return " Not Set"
  }

  if (hasCPA && hasCPL) {
    return `${formatNumber(cpa)}+${formatNumber(crg)}% OR ${formatNumber(cpl)} CPL`
  } else if (hasCPA) {
    return `${formatNumber(cpa)}+${formatNumber(crg)}%`
  } else if (hasCPL) {
    return `${formatNumber(cpl)} CPL`
  }
  
  return " Not Set"
}

async function fetchAllOffers() {
  let allResults = []
  let hasMore = true
  let nextCursor = undefined

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      start_cursor: nextCursor,
      page_size: 100,
      sorts: [
        {
          property: "Partner",
          direction: "ascending",
        },
      ],
    })

    allResults.push(...response.results)
    hasMore = response.has_more
    nextCursor = response.next_cursor
  }

  return allResults
}

export async function GET() {
  if (!process.env.NOTION_TOKEN || !process.env.OFFERS_DATABASE_ID) {
    console.error('Missing environment variables:', {
      hasToken: !!process.env.NOTION_TOKEN,
      hasDatabaseId: !!process.env.OFFERS_DATABASE_ID
    })
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 }
    )
  }

  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey('offers')
    const cachedOffers = await getFromCache<any[]>(cacheKey)
    
    if (cachedOffers) {
      console.log('Serving offers from cache')
      return NextResponse.json(cachedOffers)
    }

    console.log('Cache miss, fetching from Notion')
    const results = await fetchAllOffers()
    console.log('Total results from Notion:', results.length)
    
    // Log a sample offer's price properties
    if (results.length > 0) {
      const sampleProps = results[0].properties
      console.log('Sample price properties:', {
        cpa: sampleProps["CPA | Brand | Selling"],
        crg: sampleProps["CRG | Brand | Selling"],
        cpl: sampleProps["CPL | Brand | Selling"]
      })
    }

    const offers = results.map((page: any) => {
      const props = page.properties
      console.log('Processing offer with partner:', props.Partner?.formula?.string)
      
      const offer = {
        id: page.id,
        partner: props.Partner?.formula?.string || "",
        sources: props.Sources?.multi_select?.map((s: any) => s.name) || [],
        geo: props.GEO?.formula?.string || "",
        language: props.Language?.multi_select?.map((l: any) => l.name) || [],
        price: formatPrice(props),
        funnels: props.Funnels?.multi_select?.map((f: any) => f.name) || [],
        formatted_display: props.FormattedDisplay?.formula?.string || "",
        formatted_funnels: props.FormattedFunnels?.formula?.string || "",
        last_updated: new Date().toISOString(),
      }
      
      console.log('Processed offer:', {
        partner: offer.partner,
        price: offer.price
      })
      
      return offer
    })

    // Cache the processed offers
    await setInCache(cacheKey, offers)
    console.log('Offers cached successfully')

    return NextResponse.json(offers)
  } catch (error: any) {
    console.error('Notion API Error:', {
      message: error.message,
      code: error.code,
      body: error.body,
      stack: error.stack
    })
    return NextResponse.json(
      { error: error.message || "Failed to fetch offers" },
      { status: 500 }
    )
  }
}
