'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Mic, Play, Sparkles, Waves } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden relative">
      {/* Magical 3D Animated Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-30 pointer-events-none">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 blur-[120px] rounded-full mix-blend-screen" 
        />
      </div>

      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">VoiceForge AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#voices" className="hover:text-purple-400 transition-colors">Voices</a>
          <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button onClick={handleGetStarted} className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Enter App
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-purple-500/30 text-sm text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Next-gen Magical AI Voice Cloning & TTS</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1]">
            Generate realistic voices <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
              in seconds.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light">
            Create ultra-realistic speech from text, clone your own voice, and bring your content to life with our advanced magical AI models.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button size="lg" onClick={handleGetStarted} className="w-full sm:w-auto text-lg h-14 px-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all hover:scale-105">
              Start Generating Free
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-10 gap-2 rounded-full border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all hover:scale-105 backdrop-blur-md bg-black/20">
              <Play className="w-5 h-5" />
              Listen to Samples
            </Button>
          </div>
        </motion.div>

        {/* Demo UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          style={{ perspective: 1000 }}
          className="mt-32 relative max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-purple-500/20 bg-zinc-950/60 backdrop-blur-2xl p-3 shadow-[0_0_50px_rgba(168,85,247,0.15)] transform-gpu hover:rotate-x-0 transition-transform duration-500">
            <div className="rounded-2xl overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-zinc-900 aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/soundwave/1920/1080?blur=8')] opacity-40 mix-blend-overlay bg-cover bg-center" />
              <div className="text-center space-y-6 relative z-10">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-md border border-purple-500/30"
                >
                  <Waves className="w-10 h-10 text-cyan-300" />
                </motion.div>
                <p className="text-cyan-300 font-mono text-base tracking-widest uppercase">Generating magical waveform...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
