import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client'
import Papa from 'papaparse'

// Define the expected structure of a lead
interface Lead {
  created_date: string
  country: string
  campaign: string
  email: string
  affiliate: string
  box: string
  call_status: string
  so_media: string
  deposit_date: string | null
  first_name: string
  last_name: string
  phone: string
  original_response: any
}

// Map CSV headers to database columns
const headerMapping: { [key: string]: string } = {
  'created date': 'created_date',
  'country': 'country',
  'campaign': 'campaign',
  'email': 'email',
  'affiliate': 'affiliate',
  'box': 'box',
  'call status': 'call_status',
  'so (media)': 'so_media',
  'deposit date': 'deposit_date',
  'first name': 'first_name',
  'last name': 'last_name',
  'phone': 'phone',
  'original response': 'original_response'
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Please upload a CSV file' }, { status: 400 })
    }

    const csvText = await file.text()
    const { data, errors, meta } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Convert header to lowercase and remove special characters
        const normalizedHeader = header
          .toLowerCase()
          .trim()
        
        // Return the mapped column name or the normalized header if no mapping exists
        return headerMapping[normalizedHeader] || normalizedHeader
      }
    })

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: errors.map(e => e.message).join(', ') 
      }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data found in CSV file' }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = ['email']
    const missingFields = requiredFields.filter(field => 
      !Object.keys(data[0]).some(header => 
        header === field || headerMapping[header] === field
      )
    )
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Process leads in batches for better performance
    const batchSize = 100
    const totalLeads = data.length
    let processedLeads = 0
    let failedLeads = 0

    for (let i = 0; i < totalLeads; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map((row: any) => {
        const lead: Partial<Lead> = {}
        
        // Map each field using the headerMapping
        Object.entries(row).forEach(([key, value]) => {
          const mappedKey = headerMapping[key] || key
          
          // Handle special cases
          if (mappedKey === 'created_date' || mappedKey === 'deposit_date') {
            lead[mappedKey] = value ? new Date(value).toISOString() : null
          } else if (mappedKey === 'original_response') {
            try {
              lead[mappedKey] = typeof value === 'string' ? JSON.parse(value) : value
            } catch {
              lead[mappedKey] = value
            }
          } else {
            lead[mappedKey] = value
          }
        })

        return lead
      })

      const { error } = await supabase
        .from('leads')
        .upsert(batch, {
          onConflict: 'email,created_date',
          ignoreDuplicates: true
        })

      if (error) {
        console.error('Error inserting batch:', error)
        failedLeads += batch.length
      } else {
        processedLeads += batch.length
      }
    }

    return NextResponse.json({ 
      success: true,
      processedLeads,
      failedLeads,
      totalLeads
    })

  } catch (error) {
    console.error('Error processing CSV:', error)
    return NextResponse.json({ 
      error: 'Failed to process CSV file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
