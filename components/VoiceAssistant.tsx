
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Info, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

// Shared decode/encode functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const getLanguageName = (lang: Language) => {
    if (lang === 'ta') return 'Tamil';
    if (lang === 'hi') return 'Hindi';
    return 'English';
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  }, []);

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langName = getLanguageName(language);

    try {
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            setIsActive(true);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent.outputTranscription.text);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => stopSession(),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: `You are a helpful Makkal Nalam assistant. Speak and understand only in ${langName}. Help citizens understand government schemes. Keep it very simple.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to start session', error);
      setStatus('idle');
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{t.voiceHelp}</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          {t.speakAssistant} {getLanguageName(language)}.
        </p>
      </div>

      <div className="relative mb-12">
        <div className={`absolute -inset-8 bg-emerald-500 rounded-full blur-2xl transition-opacity duration-700 ${isActive ? 'opacity-20 animate-pulse' : 'opacity-0'}`} />
        <button
          onClick={isActive ? stopSession : startSession}
          disabled={status === 'connecting'}
          className={`
            relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform
            ${isActive 
              ? 'bg-red-500 text-white shadow-2xl scale-110' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl hover:scale-105'}
            disabled:bg-slate-300
          `}
        >
          {status === 'connecting' ? (
            <Loader2 size={48} className="animate-spin" />
          ) : isActive ? (
            <MicOff size={48} />
          ) : (
            <Mic size={48} />
          )}
          <span className="mt-2 font-bold text-xs uppercase tracking-widest">
            {status === 'connecting' ? '...' : isActive ? t.stop : t.start}
          </span>
        </button>

        {status === 'speaking' && (
           <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-emerald-600 animate-bounce">
              <Volume2 size={32} />
           </div>
        )}
      </div>

      <div className={`transition-all duration-500 w-full max-w-xl ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 min-h-[120px] text-left">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-xs uppercase">
            <Info size={14} /> {t.listening}
          </div>
          <p className="text-slate-600 text-sm italic">
            {transcription || "..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
