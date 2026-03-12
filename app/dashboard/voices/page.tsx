'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus, Search, Mic2, UploadCloud, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const VOICES = [
  { id: 'Puck', name: 'Puck', type: 'prebuilt', description: 'Friendly and energetic male voice, perfect for casual content.', tags: ['Male', 'Friendly', 'Energetic'] },
  { id: 'Charon', name: 'Charon', type: 'prebuilt', description: 'Deep and authoritative male voice, ideal for narration.', tags: ['Male', 'Deep', 'Authoritative'] },
  { id: 'Kore', name: 'Kore', type: 'prebuilt', description: 'Clear and professional female voice, great for tutorials.', tags: ['Female', 'Clear', 'Professional'] },
  { id: 'Fenrir', name: 'Fenrir', type: 'prebuilt', description: 'Gruff and intense male voice, suited for dramatic readings.', tags: ['Male', 'Gruff', 'Intense'] },
  { id: 'Zephyr', name: 'Zephyr', type: 'prebuilt', description: 'Soft and calming female voice, perfect for meditation or storytelling.', tags: ['Female', 'Soft', 'Calming'] },
];

export default function VoicesPage() {
  const [isCloning, setIsCloning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCloning(true);
      // Simulate cloning process
      setTimeout(() => {
        setIsCloning(false);
        alert('Voice cloning is currently in beta. Your sample has been queued for processing.');
      }, 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Voice Library</h2>
          <p className="text-zinc-400">Explore prebuilt voices or clone your own.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search voices..." className="pl-9 bg-zinc-900 border-zinc-800" />
          </div>
          <Button className="shrink-0 gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleCloneClick}>
            <Plus className="w-4 h-4" />
            Clone Voice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Clone Voice Card */}
        <Card 
          className="border-dashed border-2 border-zinc-800 bg-zinc-950/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors cursor-pointer group"
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
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-colors">
              {isCloning ? (
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              {isCloning ? 'Processing Audio...' : 'Clone Your Voice'}
            </h3>
            <p className="text-sm text-zinc-500">
              {isCloning ? 'Extracting voice embeddings...' : 'Upload a 30-second audio sample to create a custom AI voice clone.'}
            </p>
            <Button variant="outline" className="mt-6 border-zinc-800 bg-zinc-900 pointer-events-none">
              {isCloning ? 'Please wait' : 'Select Audio File'}
            </Button>
          </CardContent>
        </Card>

        {/* Prebuilt Voices */}
        {VOICES.map((voice) => (
          <Card key={voice.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{voice.name}</CardTitle>
                  <CardDescription className="mt-1">{voice.type}</CardDescription>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full bg-zinc-900 hover:bg-indigo-600/20 hover:text-indigo-400 text-zinc-400">
                  <Play className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-zinc-400 mb-6">{voice.description}</p>
              <div className="flex flex-wrap gap-2">
                {voice.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
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
