import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY || 'sk_1bdaeb59b97bda2e07f6a79bbfedc1765cbbd40c8d8a33e4';
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey }
  });
  const data = await response.json();
  return NextResponse.json(data);
}
