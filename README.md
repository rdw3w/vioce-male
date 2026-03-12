# VoiceForge AI

A modern SaaS web platform for generating realistic AI voices from text and cloning voices from uploaded audio.

## Features

- **Text-to-Speech**: Generate ultra-realistic speech from text using Google's Gemini TTS models.
- **Voice Library**: Explore prebuilt voices and clone your own.
- **History**: View and download your previously generated audio files.
- **Authentication**: Secure Google Sign-In via Firebase Auth.
- **Database**: Store user profiles, voices, and generation history in Firestore.

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, TypeScript, Lucide Icons, Framer Motion
- **Backend**: Next.js API Routes (Serverless)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash-preview-tts`)
- **Database & Auth**: Firebase (Firestore, Auth)

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/voiceforge-ai.git
   cd voiceforge-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: Firebase configuration is handled via `firebase-applet-config.json` in this environment)*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Docker Deployment

You can deploy VoiceForge AI using Docker.

1. Build the Docker image:
   ```bash
   docker build -t voiceforge-ai .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_GEMINI_API_KEY=your_api_key voiceforge-ai
   ```

### docker-compose.yml

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_GEMINI_API_KEY=${NEXT_PUBLIC_GEMINI_API_KEY}
    restart: always
```

## Security Best Practices

- **API Keys**: Never expose your Gemini API key in the client-side code. The API route (`/api/generate`) securely accesses the key on the server.
- **Firestore Rules**: Strict security rules are implemented to ensure users can only access their own data.
- **Rate Limiting**: Implement rate limiting on the `/api/generate` route to prevent abuse of the Gemini API.
