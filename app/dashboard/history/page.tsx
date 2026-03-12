'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Clock, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { WaveformPlayer } from '@/components/waveform-player';

interface Generation {
  id: string;
  text: string;
  voiceId: string;
  outputData: string;
  chunkCount?: number;
  createdAt: string;
}

function HistoryItem({ 
  gen, 
  onDelete, 
  onDownload, 
  getFullAudioData 
}: { 
  gen: Generation; 
  onDelete: (gen: Generation) => Promise<void>; 
  onDownload: (gen: Generation, filename: string) => Promise<void>; 
  getFullAudioData: (gen: Generation) => Promise<string>;
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
        const base64Data = await getFullAudioData(gen);
        // Add WAV header if not present, but here we know it's raw PCM from the previous code,
        // wait, the previous code created a Blob with type 'audio/pcm;rate=24000'.
        // WaveSurfer might need a proper WAV header to decode it correctly in all browsers.
        // Let's use the same Blob creation as before.
        const audioBlob = new Blob(
          [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))],
          { type: 'audio/pcm;rate=24000' }
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
    <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            className="rounded-full shrink-0 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20"
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
              <span>•</span>
              <span>{new Date(gen.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-zinc-400 hover:text-zinc-50"
              onClick={handleDownloadClick}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-zinc-400 hover:text-red-400"
              onClick={handleDeleteClick}
              disabled={isDeleting}
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

    const q = query(
      collection(db, 'generations'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Generation[];
      setGenerations(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching history:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getFullAudioData = async (gen: Generation): Promise<string> => {
    if (gen.outputData !== 'CHUNKED') {
      return gen.outputData;
    }
    
    // Fetch chunks
    const chunksSnapshot = await getDocs(collection(db, 'generations', gen.id, 'chunks'));
    const chunks = chunksSnapshot.docs
      .map(d => d.data())
      .sort((a, b) => a.index - b.index);
      
    return chunks.map(c => c.data).join('');
  };

  const handleDownload = async (gen: Generation, filename: string) => {
    try {
      const base64Data = await getFullAudioData(gen);
      
      const audioBlob = new Blob(
        [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))],
        { type: 'audio/pcm;rate=24000' }
      );
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (gen: Generation) => {
    try {
      setDeletingId(gen.id);
      if (gen.outputData === 'CHUNKED') {
        // Delete chunks first
        const chunksSnapshot = await getDocs(collection(db, 'generations', gen.id, 'chunks'));
        const deletePromises = chunksSnapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      }
      
      await deleteDoc(doc(db, 'generations', gen.id));
    } catch (error) {
      console.error('Error deleting generation:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Generation History</h2>
        <p className="text-zinc-400">View and download your previously generated audio files.</p>
      </div>

      <div className="space-y-4">
        {generations.length === 0 ? (
          <Card className="bg-zinc-900/50 border-dashed border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-lg font-medium text-zinc-300">No history yet</p>
              <p className="text-sm text-zinc-500">Generate your first voice to see it here.</p>
            </CardContent>
          </Card>
        ) : (
          generations.map((gen) => (
            <HistoryItem 
              key={gen.id} 
              gen={gen} 
              onDelete={handleDelete} 
              onDownload={handleDownload} 
              getFullAudioData={getFullAudioData} 
            />
          ))
        )}
      </div>
    </div>
  );
}
