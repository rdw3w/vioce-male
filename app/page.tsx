'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Mic, Play, Sparkles, Waves } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGetStarted = async () => {
    if (user) {
      router.push('/dashboard');
    } else {
      await signInWithGoogle();
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">VoiceForge AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-50 transition-colors">Features</a>
          <a href="#voices" className="hover:text-zinc-50 transition-colors">Voices</a>
          <a href="#pricing" className="hover:text-zinc-50 transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <Button onClick={() => router.push('/dashboard')} variant="default">
              Dashboard
            </Button>
          ) : (
            <>
              <Button onClick={signInWithGoogle} variant="ghost">Log in</Button>
              <Button onClick={signInWithGoogle} variant="default">Sign up</Button>
            </>
          )}
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Next-gen AI Voice Cloning & TTS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            Generate realistic voices <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              in seconds.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Create ultra-realistic speech from text, clone your own voice, and bring your content to life with our advanced AI models.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={handleGetStarted} className="w-full sm:w-auto text-base h-12 px-8">
              Start Generating Free
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 gap-2">
              <Play className="w-4 h-4" />
              Listen to Samples
            </Button>
          </div>
        </motion.div>

        {/* Demo UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 relative max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-xl p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-zinc-900 aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/soundwave/1920/1080?blur=8')] opacity-40 mix-blend-overlay bg-cover bg-center" />
              <div className="text-center space-y-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto animate-pulse">
                  <Waves className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-zinc-400 font-mono text-sm">Generating audio waveform...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
