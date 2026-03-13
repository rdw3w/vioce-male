import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { text, voiceId, isHumanLike } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json({ error: 'Missing text or voiceId' }, { status: 400 });
    }

    // ElevenLabs API Key
    const apiKey = process.env.ELEVENLABS_API_KEY || 'sk_1bdaeb59b97bda2e07f6a79bbfedc1765cbbd40c8d8a33e4';
    
    // Default to a generic voice if not provided or mapped
    const elevenLabsVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: isHumanLike ? 0.3 : 0.5,
          similarity_boost: isHumanLike ? 0.8 : 0.75,
          style: isHumanLike ? 0.5 : 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs Error:', errorData);
      return NextResponse.json({ error: errorData.detail?.message || errorData.message || 'Failed to generate audio from ElevenLabs' }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    return NextResponse.json({ audio: base64Audio });
  } catch (error) {
    console.error('Error in ElevenLabs route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
