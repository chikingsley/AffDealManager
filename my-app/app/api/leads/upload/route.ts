import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'

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
    const { data, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        return header
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/^_+|_+$/g, '')
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
    const missingFields = requiredFields.filter(field => !data[0].hasOwnProperty(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Process leads in batches for better performance
    const batchSize = 50
    const results = {
      inserted: 0,
      updated: 0,
      errors: 0
    }

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const leads = batch.map((row: any) => ({
        created_date: row.created_date || new Date().toISOString(),
        country: row.country || '',
        campaign: row.campaign || '',
        email: row.email?.trim().toLowerCase(), // Normalize email
        affiliate: row.affiliate || '',
        box: row.box || '',
        call_status: row.call_status || 'NEW',
        so_media: row.so_media || '',
        deposit_date: row.deposit_date || null,
        first_name: row.first_name?.trim() || '',
        last_name: row.last_name?.trim() || '',
        phone: row.phone?.trim() || '',
        original_response: row.original_response ? JSON.parse(row.original_response) : null
      }))

      // Filter out invalid emails
      const validLeads = leads.filter(lead => 
        lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)
      )
      results.errors += leads.length - validLeads.length

      if (validLeads.length === 0) continue

      // Insert all leads
      const { error: insertError } = await supabase
        .from('leads')
        .insert(validLeads)

      if (insertError) {
        // If insert fails due to duplicates, handle each lead individually
        if (insertError.code === '23505') { // Unique violation error code
          for (const lead of validLeads) {
            const { data: existing } = await supabase
              .from('leads')
              .select('id')
              .eq('email', lead.email)
              .eq('created_date', lead.created_date)
              .single()

            if (existing) {
              // Update existing lead
              const { error: updateError } = await supabase
                .from('leads')
                .update(lead)
                .eq('id', existing.id)

              if (updateError) {
                console.error('Update error:', updateError)
                results.errors++
              } else {
                results.updated++
              }
            } else {
              // Try insert again
              const { error: retryError } = await supabase
                .from('leads')
                .insert([lead])

              if (retryError) {
                console.error('Insert retry error:', retryError)
                results.errors++
              } else {
                results.inserted++
              }
            }
          }
        } else {
          console.error('Batch insert error:', insertError)
          results.errors += validLeads.length
        }
      } else {
        results.inserted += validLeads.length
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: `Processed ${data.length} leads: ${results.inserted} inserted, ${results.updated} updated, ${results.errors} errors`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
