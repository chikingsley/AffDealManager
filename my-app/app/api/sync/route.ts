import { NextResponse } from 'next/server';
import { syncNotionToSupabase } from '@/lib/sync/notion-supabase-sync';

export async function GET() {
  try {
    const result = await syncNotionToSupabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { error: 'Failed to sync databases' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual sync triggers
export async function POST() {
  try {
    const result = await syncNotionToSupabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { error: 'Failed to sync databases' },
      { status: 500 }
    );
  }
}
