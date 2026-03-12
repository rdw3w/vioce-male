'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface WaveformPlayerProps {
  url: string;
}

export function WaveformPlayer({ url }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4f46e5', // indigo-600
      progressColor: '#818cf8', // indigo-400
      cursorColor: '#c7d2fe', // indigo-200
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 48,
      normalize: true,
    });

    ws.load(url);

    ws.on('ready', () => {
      setDuration(formatTime(ws.getDuration()));
      setIsReady(true);
    });

    ws.on('timeupdate', () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => {
      setIsPlaying(false);
      ws.seekTo(0);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [url]);

  const togglePlay = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      const muted = !isMuted;
      wavesurferRef.current.setMuted(muted);
      setIsMuted(muted);
    }
  };

  return (
    <div className="flex items-center gap-4 w-full bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 h-10 w-10 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-full"
        onClick={togglePlay}
        disabled={!isReady}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
      </Button>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-400 font-mono">
        <span className="min-w-[70px] text-right">{currentTime} / {duration}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-300"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
