import { NextResponse, type Request } from "next/server"
import { Client } from "@notionhq/client"
import { getFromCache, setInCache, generateCacheKey } from "@/lib/redis"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.DEALS_DATABASE_ID
const BRANDS_DATABASE_ID = process.env.BRANDS_DATABASE_ID
const OFFERS_DATABASE_ID = process.env.OFFERS_DATABASE_ID

async function fetchAllDeals() {
  let allResults = []
  let hasMore = true
  let nextCursor = undefined

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      start_cursor: nextCursor,
      page_size: 100,
    })

    allResults.push(...response.results)
    hasMore = response.has_more
    nextCursor = response.next_cursor
  }

  return allResults
}

async function fetchBrandNames(pageIds: string[]) {
  if (!pageIds.length) return {}

  const titles: { [key: string]: string } = {}
  
  try {
    // Fetch pages directly using page IDs
    const pages = await Promise.all(
      pageIds.map(async (id) => {
        try {
          return await notion.pages.retrieve({ page_id: id })
        } catch (error) {
          console.error(`Error fetching brand page ${id}:`, error)
          return null
        }
      })
    )

    pages.forEach((page: any) => {
      if (!page) return
      
      // Get the title from properties
      const titleProperty = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any

      const title = titleProperty?.title?.[0]?.plain_text
      if (title) {
        titles[page.id] = title
      } else {
        console.log('No title found for page:', page.id, 'Properties:', JSON.stringify(page.properties, null, 2))
      }
    })

    console.log('Fetched brand titles:', titles)
  } catch (error) {
    console.error('Error fetching brand names:', error)
  }

  return titles
}

async function fetchOfferNames(pageIds: string[]) {
  if (!pageIds.length) return {}

  const titles: { [key: string]: string } = {}
  
  try {
    // Fetch pages directly using page IDs
    const pages = await Promise.all(
      pageIds.map(async (id) => {
        try {
          return await notion.pages.retrieve({ page_id: id })
        } catch (error) {
          console.error(`Error fetching offer page ${id}:`, error)
          return null
        }
      })
    )

    pages.forEach((page: any) => {
      if (!page) return
      
      // Get the title from properties
      const titleProperty = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any

      const title = titleProperty?.title?.[0]?.plain_text
      if (title) {
        titles[page.id] = title
      } else {
        console.log('No title found for page:', page.id, 'Properties:', JSON.stringify(page.properties, null, 2))
      }
    })

    console.log('Fetched offer titles:', titles)
  } catch (error) {
    console.error('Error fetching offer names:', error)
  }

  return titles
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const resetCache = searchParams.get('resetCache') === 'true'

  if (!process.env.NOTION_TOKEN || !process.env.DEALS_DATABASE_ID || !process.env.BRANDS_DATABASE_ID || !process.env.OFFERS_DATABASE_ID) {
    console.error('Missing environment variables:', {
      hasToken: !!process.env.NOTION_TOKEN,
      hasDatabaseId: !!process.env.DEALS_DATABASE_ID,
      hasBrandsId: !!process.env.BRANDS_DATABASE_ID,
      hasOffersId: !!process.env.OFFERS_DATABASE_ID
    })
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 }
    )
  }

  try {
    const cacheKey = generateCacheKey('deals')

    // Try to get from cache first
    const cachedDeals = await getFromCache<any[]>(cacheKey)
    
    if (cachedDeals) {
      console.log('Serving deals from cache')
      return NextResponse.json(cachedDeals)
    }

    console.log('Cache miss, fetching from Notion')
    const results = await fetchAllDeals()
    console.log('Total results from Notion:', results.length)

    // Log a sample of the raw data
    if (results.length > 0) {
      const sampleDeal = results[0]
      console.log('Sample deal raw properties:')
      console.log('Funnels rollup:', JSON.stringify(sampleDeal.properties['Funnels']?.rollup?.array, null, 2))
      console.log('Sources rollup:', JSON.stringify(sampleDeal.properties['Sources']?.rollup?.array, null, 2))
    }

    // Collect all customer and offer IDs
    const customerIds = new Set<string>()
    const offerIds = new Set<string>()
    
    results.forEach((page: any) => {
      const props = page.properties
      props["™️ ALL CUSTOMERS"]?.relation?.forEach((r: any) => customerIds.add(r.id))
      props["🥮 Individual OFFERS | Kitchen"]?.relation?.forEach((r: any) => offerIds.add(r.id))
    })

    console.log('Found customer IDs:', Array.from(customerIds))
    console.log('Found offer IDs:', Array.from(offerIds))

    // Fetch titles for customers and offers
    const [customerTitles, offerTitles] = await Promise.all([
      fetchBrandNames(Array.from(customerIds)),
      fetchOfferNames(Array.from(offerIds))
    ])

    console.log('Customer titles:', customerTitles)
    console.log('Offer titles:', offerTitles)

    const deals = results.map((page: any) => {
      const props = page.properties
      
      // Debug relationship data
      console.log(`\nProcessing deal ${page.id}:`)
      console.log('Related Offers:', JSON.stringify(props['🥮 Individual OFFERS | Kitchen']?.relation, null, 2))
      console.log('Sources rollup:', JSON.stringify(props['Sources'], null, 2))
      console.log('Funnels rollup:', JSON.stringify(props['Funnels'], null, 2))
      console.log('GEO rollup:', JSON.stringify(props['GEO'], null, 2))
      console.log('Language rollup:', JSON.stringify(props['language'], null, 2))
      
      const deal = {
        id: page.id,
        customers: (props["™️ ALL CUSTOMERS"]?.relation?.map((r: any) => customerTitles[r.id] || r.id) || []),
        dealDate: props["Deal Date"]?.date?.start || "",
        individualOffers: (props["🥮 Individual OFFERS | Kitchen"]?.relation?.map((r: any) => offerTitles[r.id] || r.id) || []),
        wh: props["WH"]?.rich_text?.[0]?.plain_text || "",
        cpa: props["Updated Buying CPA"]?.number || props["Buying CPA"]?.rollup?.array?.[0]?.number || 0,
        crg: props["Updated Buying CRG"]?.number || (props["Buying CRG"]?.rollup?.array?.[0]?.number || 0) * 100,
        cpl: props["CPL"]?.number || 0,
        ppl: props["PPL"]?.formula?.number || 0,
        pplPercent: props["PPL%"]?.formula?.number ? `${(props["PPL%"]?.formula?.number * 100).toFixed(2)}%` : "",
        cap: props["cap"]?.number || 0,
        advertiser: props["Advertiser"]?.formula?.string || "",
        // Multi-select rollups
        sources: props["Sources"]?.rollup?.array
          ?.flatMap((item: any) => item?.multi_select?.map((select: any) => select?.name) || [])
          ?.filter(Boolean)
          ?.filter((value, index, self) => self.indexOf(value) === index) || [],
        funnels: props["Funnels"]?.rollup?.array
          ?.flatMap((item: any) => item?.multi_select?.map((select: any) => select?.name) || [])
          ?.filter(Boolean)
          ?.filter((value, index, self) => self.indexOf(value) === index) || [],
        // Handle GEO as a formula field rollup and language as a multi-select rollup
        geo: props["GEO"]?.rollup?.array
          ?.map((item: any) => item?.formula?.string)
          ?.filter(Boolean)
          ?.filter((value, index, self) => self.indexOf(value) === index) || [],
        language: props["language"]?.rollup?.array
          ?.flatMap((item: any) => item?.multi_select?.map((select: any) => select?.name) || [])
          ?.filter(Boolean)
          ?.filter((value, index, self) => self.indexOf(value) === index) || [],
      }

      // Debug extracted values
      console.log('Extracted sources:', deal.sources)
      console.log('Extracted funnels:', deal.funnels)
      console.log('Extracted geo:', deal.geo)
      console.log('Extracted language:', deal.language)

      return deal
    })

    // Log a sample of the transformed data
    if (deals.length > 0) {
      console.log('\nSample transformed deal:')
      console.log('Funnels:', deals[0].funnels)
      console.log('Sources:', deals[0].sources)
    }

    // Cache the processed deals
    await setInCache(cacheKey, deals)
    console.log('Deals cached successfully')

    return NextResponse.json(deals)
  } catch (error: any) {
    console.error('Notion API Error:', {
      message: error.message,
      code: error.code,
      body: error.body,
      stack: error.stack
    })
    return NextResponse.json(
      { error: error.message || "Failed to fetch deals" },
      { status: 500 }
    )
  }
}
