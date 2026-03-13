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
      waveColor: '#a855f7', // purple-500
      progressColor: '#22d3ee', // cyan-400
      cursorColor: '#e879f9', // fuchsia-400
      barWidth: 3,
      barGap: 3,
      barRadius: 3,
      height: 64,
      normalize: true,
    });

    ws.load(url).catch((e) => {
      if (e.name !== 'AbortError') {
        console.error('Error loading wavesurfer:', e);
      }
    });

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
      try {
        ws.destroy();
      } catch (e) {
        // Ignore AbortError which happens if destroyed while fetching/decoding
      }
    };
  }, [url]);

  const togglePlay = async () => {
    if (wavesurferRef.current && isReady) {
      try {
        await wavesurferRef.current.playPause();
      } catch (e) {
        console.error('Error playing/pausing:', e);
      }
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
    <div className="flex items-center gap-4 w-full bg-zinc-950/60 backdrop-blur-xl p-4 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
      {/* Magical Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-cyan-500/10 pointer-events-none" />

      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 h-12 w-12 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-cyan-300 hover:from-purple-500/30 hover:to-cyan-500/30 hover:text-cyan-200 rounded-full border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all hover:scale-105 relative z-10"
        onClick={togglePlay}
        disabled={!isReady}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
      </Button>

      <div className="flex-1 flex flex-col justify-center min-w-0 relative z-10">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="flex items-center gap-3 shrink-0 text-sm text-cyan-200/70 font-mono relative z-10">
        <span className="min-w-[80px] text-right tracking-wider">{currentTime} / {duration}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full transition-colors"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
