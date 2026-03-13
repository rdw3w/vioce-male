'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus, Search, Mic2, UploadCloud, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', type: 'prebuilt', description: 'Calm and professional female voice, perfect for narration.', tags: ['Female', 'Calm', 'Professional'] },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', type: 'prebuilt', description: 'Well-rounded and friendly male voice, perfect for casual content.', tags: ['Male', 'Friendly', 'Well-rounded'] },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', type: 'prebuilt', description: 'Deep and authoritative male voice, ideal for news and documentaries.', tags: ['Male', 'Deep', 'Authoritative'] },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', type: 'prebuilt', description: 'Strong and energetic male voice, great for tutorials.', tags: ['Male', 'Strong', 'Energetic'] },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', type: 'prebuilt', description: 'Young and expressive female voice, suited for dramatic readings.', tags: ['Female', 'Young', 'Expressive'] },
];

export default function VoicesPage() {
  const [cloneStatus, setCloneStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [cloneProgress, setCloneProgress] = useState(0);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloneClick = () => {
    if (cloneStatus === 'idle' || cloneStatus === 'error') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCloneError(null);
      setCloneStatus('uploading');
      setCloneProgress(0);

      try {
        // Simulate uploading
        for (let i = 0; i <= 40; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setCloneProgress(i);
        }

        setCloneStatus('processing');
        // Simulate processing
        for (let i = 40; i <= 90; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setCloneProgress(i);
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Audio file exceeds the 10MB limit.");
        }

        setCloneProgress(100);
        setCloneStatus('success');
        
        setTimeout(() => {
          setCloneStatus('idle');
          setCloneProgress(0);
        }, 3000);
      } catch (error: any) {
        setCloneError(error.message || 'Failed to clone voice.');
        setCloneStatus('error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Voice Library</h2>
          <p className="text-zinc-400 mt-2">Explore magical prebuilt voices or clone your own.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search voices..." className="pl-9 bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl focus-visible:ring-purple-500" />
          </div>
          <Button className="shrink-0 gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:scale-105" onClick={handleCloneClick}>
            <Plus className="w-4 h-4" />
            Clone Voice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Clone Voice Card */}
        <Card 
          className="border-dashed border-2 border-zinc-800/50 bg-zinc-950/40 backdrop-blur-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group"
          onClick={handleCloneClick}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[240px] text-center p-6">
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-full bg-zinc-900/80 flex items-center justify-center mb-4 group-hover:bg-purple-600/20 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              {cloneStatus === 'uploading' || cloneStatus === 'processing' ? (
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              ) : cloneStatus === 'success' ? (
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              {cloneStatus === 'uploading' ? 'Uploading Audio...' : 
               cloneStatus === 'processing' ? 'Processing Audio...' : 
               cloneStatus === 'success' ? 'Clone Successful!' : 
               'Clone Your Voice'}
            </h3>
            
            {cloneStatus === 'uploading' || cloneStatus === 'processing' ? (
              <div className="w-full max-w-[200px] mt-2 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{cloneStatus === 'uploading' ? 'Uploading...' : 'Extracting...'}</span>
                  <span>{cloneProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${cloneProgress}%` }}
                  />
                </div>
              </div>
            ) : cloneStatus === 'error' ? (
              <p className="text-sm text-red-400 mt-2">{cloneError}</p>
            ) : cloneStatus === 'success' ? (
              <p className="text-sm text-green-400 mt-2">Your voice has been queued.</p>
            ) : (
              <p className="text-sm text-zinc-500">
                Upload a 30-second audio sample to create a custom AI voice clone.
              </p>
            )}

            <Button variant="outline" className="mt-6 border-zinc-800/50 bg-zinc-900/50 pointer-events-none group-hover:border-purple-500/30 group-hover:text-purple-300">
              {cloneStatus === 'uploading' || cloneStatus === 'processing' ? 'Please wait' : 'Select Audio File'}
            </Button>
          </CardContent>
        </Card>

        {/* Prebuilt Voices */}
        {VOICES.map((voice) => (
          <Card key={voice.id} className="bg-zinc-950/60 backdrop-blur-xl border-zinc-800/50 hover:border-purple-500/30 transition-all duration-300 flex flex-col group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-zinc-200 group-hover:text-purple-300 transition-colors">{voice.name}</CardTitle>
                  <CardDescription className="mt-1 text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">{voice.type}</CardDescription>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full bg-zinc-900/80 hover:bg-purple-600/20 hover:text-purple-400 text-zinc-400 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Play className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-zinc-400 mb-6 font-light leading-relaxed">{voice.description}</p>
              <div className="flex flex-wrap gap-2">
                {voice.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800/50 text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
