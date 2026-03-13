'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play, Download, Loader2, Volume2, Settings2, Mic, Upload, Plus, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useTheme } from '@/components/theme-provider';
import { WaveformPlayer } from '@/components/waveform-player';

const PREBUILT_VOICES: { id: string; name: string; type: string; baseVoice?: string; gender: 'Male' | 'Female' }[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Calm)', type: 'prebuilt', gender: 'Female' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Well-rounded)', type: 'prebuilt', gender: 'Male' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (Deep)', type: 'prebuilt', gender: 'Male' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (Strong)', type: 'prebuilt', gender: 'Male' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda (Young)', type: 'prebuilt', gender: 'Female' },
];

const TRENDING_VOICES = [
  { id: 'modi', name: 'Narendra Modi', type: 'trending', baseVoice: 'ErXwobaYiN019PkySvjV', gender: 'Male' },
  { id: 'trump', name: 'Donald Trump', type: 'trending', baseVoice: 'IKne3meq5aSn9XLyUdCD', gender: 'Male' },
  { id: 'musk', name: 'Elon Musk', type: 'trending', baseVoice: 'VR6AewLTigWG4xSOukaG', gender: 'Male' },
  { id: 'tate', name: 'Andrew Tate', type: 'trending', baseVoice: 'ErXwobaYiN019PkySvjV', gender: 'Male' },
  { id: 'scarlett', name: 'Scarlett Johansson', type: 'trending', baseVoice: 'EXAVITQu4vr4xnSDxMaL', gender: 'Female' },
];

const LANGUAGES = {
  "Indian Languages": [
    "Hindi", "Bhojpuri", "Bengali", "Tamil", "Telugu", 
    "Marathi", "Gujarati", "Punjabi", "Malayalam", "Kannada",
    "Odia", "Assamese", "Maithili"
  ],
  "Global Languages": [
    "English (US)", "English (UK)", "English (Australia)", "English (India)",
    "Spanish (Spain)", "Spanish (Mexico)", "French (France)", "French (Canada)",
    "German", "Italian", "Portuguese (Brazil)", "Portuguese (Portugal)", 
    "Russian", "Japanese", "Korean", "Chinese (Mandarin)", "Chinese (Cantonese)",
    "Arabic", "Turkish", "Dutch", "Polish", "Swedish", "Indonesian", 
    "Vietnamese", "Thai", "Filipino", "Malay"
  ]
};

const EMOTIONS = [
  "Neutral", "Happy", "Sad", "Angry", "Excited", "Calm", "Fearful", "Disgusted", "Surprised"
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'tts' | 'clone'>('tts');
  
  // TTS State
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(PREBUILT_VOICES[2].id);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES["Global Languages"][0]);
  const [selectedEmotion, setSelectedEmotion] = useState(EMOTIONS[0]);
  const [isHumanLike, setIsHumanLike] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);

  // Cloning State
  const [clonedVoices, setClonedVoices] = useState<any[]>([]);
  const [newVoiceName, setNewVoiceName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const loadVoices = async () => {
      const voices = await db.getVoices(user.uid);
      setClonedVoices(voices);
    };
    
    loadVoices();
  }, [user]);

  const handleGenerate = async () => {
    if (!text.trim() || !user) return;

    setIsGenerating(true);
    setAudioUrl(null);
    setAudioData(null);

    try {
      const selectedVoiceObj = allVoices.find(v => v.id === selectedVoice);
      const actualVoiceName = selectedVoiceObj?.baseVoice || selectedVoiceObj?.id || 'EXAVITQu4vr4xnSDxMaL';
      
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: actualVoiceName,
          isHumanLike
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      const base64Audio = data.audio;

      if (!base64Audio) {
        throw new Error('No audio data received');
      }
      
      const rawData = atob(base64Audio);
      const pcmData = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        pcmData[i] = rawData.charCodeAt(i);
      }

      const audioBlob = new Blob([pcmData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
      setAudioData(base64Audio);

      // Save to Local DB
      await db.addGeneration({
        id: Date.now().toString(),
        userId: user.uid,
        text,
        voiceId: selectedVoice,
        audioUrl: base64Audio,
        createdAt: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(`Generation error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `voiceforge-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const [cloneStatus, setCloneStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [cloneProgress, setCloneProgress] = useState(0);
  const [cloneError, setCloneError] = useState<string | null>(null);

  const handleCloneVoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!newVoiceName.trim()) {
      setCloneError("Please enter a name for the voice first.");
      setCloneStatus('error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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
      
      // Simulate potential backend validation error (mocked randomly for realism, but let's keep it mostly successful)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Audio file exceeds the 10MB limit. Please upload a smaller file.");
      }

      const newVoice = {
        id: Date.now().toString(),
        name: newVoiceName,
        model: 'custom-clone-v1',
        userId: user.uid,
        isPublic: false,
        createdAt: new Date().toISOString(),
      };
      
      await db.addVoice(newVoice);
      setClonedVoices(prev => [...prev, newVoice]);

      setCloneProgress(100);
      setCloneStatus('success');
      setNewVoiceName('');
      
      // Reset after success
      setTimeout(() => {
        setCloneStatus('idle');
        setCloneProgress(0);
      }, 3000);

    } catch (error: any) {
      console.error('Cloning error:', error);
      setCloneError(error.message || 'Failed to clone voice. The backend server might be busy.');
      setCloneStatus('error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const allVoices = [
    ...PREBUILT_VOICES, 
    ...TRENDING_VOICES, 
    ...clonedVoices.map(v => ({ id: v.id, name: v.name, type: 'cloned', baseVoice: 'ErXwobaYiN019PkySvjV', gender: 'Male' as const }))
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Theme Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-2 border-b border-theme-border pb-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'tts' ? 'bg-theme-primary/10 text-theme-primary' : 'text-zinc-400 hover:text-zinc-200 hover:bg-theme-surface'
            }`}
          >
            Text to Speech
          </button>
          <button
            onClick={() => setActiveTab('clone')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'clone' ? 'bg-theme-primary/10 text-theme-primary' : 'text-zinc-400 hover:text-zinc-200 hover:bg-theme-surface'
            }`}
          >
            Voice Cloning
          </button>
        </div>

        <div className="flex items-center gap-2 bg-theme-surface border border-theme-border rounded-lg p-1">
          <Palette className="w-4 h-4 text-zinc-400 ml-2" />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="bg-transparent text-sm text-zinc-300 border-none focus:ring-0 py-1 pl-2 pr-8 cursor-pointer"
          >
            <option value="nebula" className="bg-zinc-900">Nebula</option>
            <option value="aurora" className="bg-zinc-900">Aurora</option>
            <option value="sunset" className="bg-zinc-900">Sunset</option>
            <option value="midnight" className="bg-zinc-900">Midnight</option>
          </select>
        </div>
      </div>

      {activeTab === 'tts' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-theme-surface border-theme-border backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle>Text to Speech</CardTitle>
                <CardDescription>Enter text to generate ultra-realistic speech.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">Text to Speak</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        const topic = prompt("What should the script be about?");
                        if (!topic) return;
                        
                        try {
                          const res = await fetch('/api/generate-script', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: topic })
                          });
                          const data = await res.json();
                          if (data.error) {
                            alert(data.error);
                          } else if (data.text) {
                            setText(data.text);
                          }
                        } catch (e) {
                          alert("Failed to generate script.");
                        }
                      }}
                      className="text-xs h-8 border-theme-border hover:bg-theme-surface hover:text-theme-primary"
                    >
                      ✨ Generate Script with AI
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Type something here, or use the AI to generate a script..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] text-base resize-none bg-black/20 border-theme-border focus-visible:ring-theme-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{text.length} / 10000 characters</span>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!text.trim() || isGenerating || text.length > 10000}
                    className="w-32 bg-theme-primary hover:bg-theme-primary-hover text-white"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audio Player */}
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-theme-primary/30 bg-theme-primary/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <WaveformPlayer url={audioUrl} />
                    <div className="mt-4 flex justify-end">
                      <Button size="sm" variant="outline" onClick={handleDownload} className="shrink-0 border-theme-border hover:bg-theme-surface hover:text-theme-primary">
                        <Download className="w-4 h-4 mr-2" /> Download Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            <Card className="bg-theme-surface border-theme-border backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-theme-primary" />
                  Voice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Language / Accent</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-3 rounded-lg border border-theme-border bg-black/20 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-theme-primary transition-colors"
                  >
                    {Object.entries(LANGUAGES).map(([group, langs]) => (
                      <optgroup key={group} label={group} className="bg-zinc-900 text-zinc-400 font-semibold">
                        {langs.map((lang) => (
                          <option key={lang} value={lang} className="bg-zinc-900 text-zinc-200 font-normal">
                            {lang}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Emotion / Tone</label>
                  <select
                    value={selectedEmotion}
                    onChange={(e) => setSelectedEmotion(e.target.value)}
                    className="w-full p-3 rounded-lg border border-theme-border bg-black/20 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-theme-primary transition-colors"
                  >
                    {EMOTIONS.map((emotion) => (
                      <option key={emotion} value={emotion} className="bg-zinc-900">
                        {emotion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border bg-black/20">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-zinc-200">Ultra-Realistic Human</label>
                    <p className="text-xs text-zinc-500">Adds natural pauses, breaths, and conversational tone</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHumanLike(!isHumanLike)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isHumanLike ? 'bg-theme-primary' : 'bg-zinc-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHumanLike ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Select Voice Model</label>
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {allVoices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-200 ${
                          selectedVoice === voice.id
                            ? 'border-theme-primary bg-theme-primary/10 text-zinc-100 shadow-[0_0_15px_var(--color-theme-primary)]'
                            : 'border-theme-border bg-black/20 text-zinc-400 hover:bg-theme-surface hover:text-zinc-200 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{voice.name}</span>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {voice.gender === 'Male' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 uppercase tracking-wider font-medium">Male</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-pink-500/20 text-pink-400 uppercase tracking-wider font-medium">Female</span>
                            )}
                            {voice.type === 'prebuilt' && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-300 uppercase tracking-wider">Standard</span>}
                            {voice.type === 'trending' && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-orange-500/20 text-orange-400 uppercase tracking-wider flex items-center gap-1">🔥 Trending</span>}
                            {voice.type === 'cloned' && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-theme-primary/20 text-theme-primary uppercase tracking-wider">Cloned</span>}
                          </div>
                        </div>
                        {selectedVoice === voice.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-theme-primary shrink-0 shadow-[0_0_8px_var(--color-theme-primary)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'clone' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Clone New Voice */}
          <Card className="bg-theme-surface border-theme-border backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-theme-primary" />
                Clone a New Voice
              </CardTitle>
              <CardDescription>Upload a clean, 30-60 second audio sample of the voice you want to clone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Voice Name</label>
                <Input 
                  placeholder="e.g., My Custom Voice" 
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  className="bg-black/20 border-theme-border focus-visible:ring-theme-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Upload Audio Sample</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    cloneStatus === 'idle' || cloneStatus === 'error' 
                      ? 'border-theme-border hover:bg-theme-surface cursor-pointer' 
                      : 'border-theme-primary/50 bg-theme-primary/5 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (cloneStatus === 'idle' || cloneStatus === 'error') {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {cloneStatus === 'uploading' || cloneStatus === 'processing' ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 text-theme-primary animate-spin" />
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">
                            {cloneStatus === 'uploading' ? 'Uploading audio...' : 'Extracting voice embeddings...'}
                          </span>
                          <span className="text-theme-primary font-medium">{cloneProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-theme-primary transition-all duration-300 ease-out"
                            style={{ width: `${cloneProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : cloneStatus === 'success' ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-green-400">Voice cloned successfully!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-theme-border">
                        <Upload className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">Click to upload audio</p>
                        <p className="text-xs text-zinc-500 mt-1">WAV, MP3, or M4A (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {cloneError && (
                  <div className="p-3 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{cloneError}</span>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="audio/*"
                  onChange={handleCloneVoice}
                  disabled={cloneStatus === 'uploading' || cloneStatus === 'processing'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Your Cloned Voices */}
          <Card className="bg-theme-surface border-theme-border backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle>Your Cloned Voices</CardTitle>
              <CardDescription>Manage your custom voice models.</CardDescription>
            </CardHeader>
            <CardContent>
              {clonedVoices.length === 0 ? (
                <div className="text-center py-12 border border-theme-border border-dashed rounded-xl bg-black/10">
                  <p className="text-sm text-zinc-500">You haven&apos;t cloned any voices yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clonedVoices.map((voice) => (
                    <div key={voice.id} className="flex items-center justify-between p-4 rounded-lg border border-theme-border bg-black/20">
                      <div>
                        <p className="font-medium text-sm text-zinc-200">{voice.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">Created {new Date(voice.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedVoice(voice.id);
                        setActiveTab('tts');
                      }} className="border-theme-border hover:bg-theme-surface hover:text-theme-primary">
                        Use Voice
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
