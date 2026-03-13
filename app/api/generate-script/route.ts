import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let lastError = null;

    // Try OpenAI First
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o', // Fallback to latest available if gpt-5 isn't recognized by the SDK yet
          messages: [
            { role: 'system', content: 'You are an expert scriptwriter for voiceovers. Write a short, engaging script based on the user prompt. Do not include stage directions, just the spoken text.' },
            { role: 'user', content: prompt }
          ],
        });
        return NextResponse.json({ text: completion.choices[0].message.content });
      } catch (e: any) {
        console.error("OpenAI failed, falling back to Grok...", e);
        lastError = e.message;
      }
    }

    // Fallback to Grok (xAI)
    if (process.env.GROK_API_KEY) {
      try {
        const xai = new OpenAI({ 
          apiKey: process.env.GROK_API_KEY, 
          baseURL: 'https://api.x.ai/v1' 
        });
        const completion = await xai.chat.completions.create({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: 'You are an expert scriptwriter for voiceovers. Write a short, engaging script based on the user prompt. Do not include stage directions, just the spoken text.' },
            { role: 'user', content: prompt }
          ],
        });
        return NextResponse.json({ text: completion.choices[0].message.content });
      } catch (e: any) {
        console.error("Grok failed...", e);
        lastError = e.message;
      }
    }

    // Fallback to Gemini
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            systemInstruction: 'You are an expert scriptwriter for voiceovers. Write a short, engaging script based on the user prompt. Do not include stage directions, just the spoken text.',
          }
        });
        return NextResponse.json({ text: response.text });
      } catch (e: any) {
        console.error("Gemini failed...", e);
        lastError = e.message;
      }
    }

    return NextResponse.json({ 
      error: "All AI providers failed or API keys are missing. Please configure OPENAI_API_KEY, GROK_API_KEY, or NEXT_PUBLIC_GEMINI_API_KEY.",
      details: lastError
    }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
