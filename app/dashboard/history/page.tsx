'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Clock, Trash2, Loader2, ChevronUp } from 'lucide-react';
import { WaveformPlayer } from '@/components/waveform-player';

interface Generation {
  id: string;
  text: string;
  voiceId: string;
  audioUrl: string;
  createdAt: string;
}

function HistoryItem({ 
  gen, 
  onDelete, 
  onDownload, 
}: { 
  gen: Generation; 
  onDelete: (gen: Generation) => Promise<void>; 
  onDownload: (gen: Generation, filename: string) => Promise<void>; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    
    if (!audioUrl) {
      setIsLoading(true);
      try {
        const base64Data = gen.audioUrl;
        const audioBlob = new Blob(
          [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        setAudioUrl(URL.createObjectURL(audioBlob));
      } catch (error) {
        console.error('Error loading audio:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(true);
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    await onDownload(gen, `voiceforge-${gen.id}`);
    setIsDownloading(false);
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    await onDelete(gen);
    setIsDeleting(false);
  };

  return (
    <Card className="bg-zinc-950/60 backdrop-blur-xl border-zinc-800/50 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            className="rounded-full shrink-0 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 group-hover:scale-110 transition-transform"
            onClick={handleExpand}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-1" />
            )}
          </Button>
          
          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleExpand}>
            <p className="text-sm font-medium text-zinc-200 truncate">{gen.text}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                {gen.voiceId}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(gen.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="text-zinc-400 hover:text-purple-400 hover:bg-purple-400/10"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {isExpanded && audioUrl && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <WaveformPlayer url={audioUrl} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadGenerations = async () => {
      const gens = await db.getGenerations(user.uid);
      setGenerations(gens);
      setLoading(false);
    };

    loadGenerations();
  }, [user]);

  const handleDelete = async (gen: Generation) => {
    if (!user) return;
    try {
      await db.deleteGeneration(gen.id);
      setGenerations(prev => prev.filter(g => g.id !== gen.id));
    } catch (error) {
      console.error('Error deleting generation:', error);
    }
  };

  const handleDownload = async (gen: Generation, filename: string) => {
    try {
      const base64Data = gen.audioUrl;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const url = URL.createObjectURL(audioBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Generation History</h1>
        <p className="text-zinc-400 mt-2">View and manage your previously generated magical audio files.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : generations.length === 0 ? (
        <Card className="bg-zinc-950/50 border-zinc-800/50 border-dashed backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200">No history yet</h3>
            <p className="text-zinc-500 max-w-sm mt-2">
              Your generated audio files will appear here. Head over to the dashboard to create your first voice!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <HistoryItem 
              key={gen.id} 
              gen={gen} 
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
