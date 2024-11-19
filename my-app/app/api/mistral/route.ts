import { Mistral } from '@mistralai/mistralai';
import { NextResponse } from 'next/server';

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('MISTRAL_API_KEY environment variable is not set');
}

// Agent IDs
const AGENTS = {
  AFFILIATE: "ag:974ca0be:20241119:parsing-agent:dabd941f"
} as const;

export async function POST(request: Request) {
  try {
    const { dealText } = await request.json();
    if (!dealText) {
      return NextResponse.json({ error: 'Deal text is required' }, { status: 400 });
    }

    const client = new Mistral(process.env.MISTRAL_API_KEY!);

    // Log input
    console.log('Deal Parser Input:', dealText);

    // Deal Parser
    const chatResponse = await client.agents.complete({
      agentId: AGENTS.AFFILIATE,
      messages: [{ role: "user", content: dealText }]
    });

    const content = chatResponse.choices[0].message.content;
    console.log('Deal Parser Response:', content);

    try {
      const result = JSON.parse(content);
      console.log('Parsed Result:', JSON.stringify(result, null, 2));
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.log('Failed content:', content);
      throw new Error('Invalid JSON response from parser');
    }

  } catch (error: any) {
    console.error('Error in deal parsing:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}
