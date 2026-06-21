import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { MessageCircle, X, Send, Trash2, MapPin, Cloud, Train, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const LocationPinMap = lazy(() => import('./LocationPinMap'));

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  mapPin?: string;
}

interface ChatResponse {
  response: string;
  tool_triggered: string[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const QUICK_ACTIONS = [
  { label: 'Weather update', icon: Cloud, prompt: 'What is the weather in Jamshedpur?' },
  { label: 'Train schedule', icon: Train, prompt: 'Tell me about the Steel Express train schedule' },
  { label: 'Find a place', icon: MapPin, prompt: 'Locate Tatanagar Junction on the map' },
];

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hello! I'm TrackMate AI. I can help you with train schedules, weather updates, location searches, and travel advice. Ask me anything!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(`tm_${Math.random().toString(36).slice(2, 11)}`);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-IN';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
      if (e.results[e.results.length - 1].isFinal && transcript.trim()) {
        setIsListening(false);
        setTimeout(() => sendMessage(transcript.trim()), 100);
      }
    };

    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
  }, []);

  function toggleVoice() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setInput('');
      rec.start();
      setIsListening(true);
    }
  }

  function speak(text: string, msgId: string) {
    if (!window.speechSynthesis) return;
    stopSpeaking();

    const clean = stripMarkdown(text);
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'en-IN';
    utter.rate = 1.0;
    utter.pitch = 1.05;
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setSpeakingId(msgId);
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }

  function toggleSpeak(msg: ChatMessage) {
    if (speakingId === msg.id) {
      stopSpeaking();
    } else {
      speak(msg.text, msg.id);
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (!isOpen) stopSpeaking();
  }, [isOpen]);

  function addMessage(text: string, sender: 'user' | 'bot', mapPin?: string): ChatMessage {
    const msg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      sender,
      timestamp: new Date(),
      mapPin,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput('');
    addMessage(text, 'user');
    setLoading(true);
    addMessage('TrackMate is thinking...', 'bot');

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          message: text,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: ChatResponse = await res.json();
      const botMsgId = `${Date.now()}_bot`;

      // Extract locate place from tool triggers
      let mapPin: string | undefined;
      if (data.tool_triggered && data.tool_triggered.length > 0) {
        mapPin = data.tool_triggered[0];
      } else {
        const pinMatch = data.response.match(/\blocate(?:\s+)?(?:the\s+)?(?:place\s+)?["']?([^"'\n]+?)["']?\b/i) ||
                         data.response.match(/\b(?:Bistupur Market|Chaibasa Clock Tower|Tatanagar Junction|Howrah Railway Station|Victoria Memorial|Jubilee Park|Dalma Sanctuary|Ghatsila Station|Kharagpur Junction|Jhargram Station|Jamshedpur|Chaibasa|Howrah|Kolkata|Ranchi|Roro Dam)\b/i);
        if (pinMatch) mapPin = pinMatch[1] || pinMatch[0];
      }

      setMessages(prev => {
        const filtered = prev.filter(m => m.text !== 'TrackMate is thinking...');
        return [...filtered, {
          id: botMsgId,
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          mapPin,
        }];
      });

      if (ttsEnabled && !mapPin) {
        setTimeout(() => speak(data.response, botMsgId), 100);
      }
    } catch {
      setMessages(prev => {
        const filtered = prev.filter(m => m.text !== 'TrackMate is thinking...');
        return [...filtered, {
          id: `${Date.now()}_err`,
          text: 'Something went wrong. Please check your connection and try again.',
          sender: 'bot',
          timestamp: new Date(),
        }];
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    stopSpeaking();
    sessionIdRef.current = `tm_${Math.random().toString(36).slice(2, 11)}`;
    setMessages([
      {
        id: 'welcome',
        text: "Chat cleared! How can I help you now?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[9999] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 rotate-90 scale-95'
            : 'bg-gradient-to-br from-slate-800 to-blue-700 hover:scale-110'
        }`}
        style={{ bottom: 88, right: 16 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X size={22} className="text-white" strokeWidth={2.5} />
        ) : (
          <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed z-[9998] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          bottom: 152,
          right: 16,
          width: 340,
          height: 480,
          transformOrigin: 'bottom right',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">TrackMate AI</p>
              <p className="text-blue-200 text-[10px]">
                {speakingId ? '🔊 Speaking...' : 'Travel assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* TTS toggle */}
            <button
              onClick={() => { setTtsEnabled(v => !v); if (ttsEnabled) stopSpeaking(); }}
              className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={ttsEnabled ? 'Mute voice' : 'Unmute voice'}
              title={ttsEnabled ? 'Mute voice output' : 'Enable voice output'}
            >
              {ttsEnabled
                ? <Volume2 size={13} className="text-white" />
                : <VolumeX size={13} className="text-white/50" />
              }
            </button>
            <button onClick={handleClear} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Trash2 size={13} className="text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-gray-50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : msg.text.includes('thinking')
                    ? 'bg-white text-gray-400 italic rounded-bl-sm shadow-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.text}
                {msg.sender === 'bot' && msg.mapPin && (
                  <div className="mt-2 mb-1">
                    <Suspense fallback={
                      <div className="bg-gray-100 rounded-xl h-[140px] animate-pulse flex items-center justify-center text-xs text-gray-400">
                        Loading map...
                      </div>
                    }>
                      <LocationPinMap placeName={msg.mapPin} height={140} />
                    </Suspense>
                    <p className="text-[9px] text-blue-500 font-semibold mt-1 text-center flex items-center justify-center gap-1">
                      <MapPin size={10} /> {msg.mapPin}
                    </p>
                  </div>
                )}
                <div className={`flex items-center justify-between mt-1 gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[9px] ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.sender === 'bot' && !msg.text.includes('thinking') && (
                    <button
                      onClick={() => toggleSpeak(msg)}
                      className={`flex items-center gap-0.5 text-[9px] font-semibold transition-colors ${
                        speakingId === msg.id
                          ? 'text-blue-500'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      aria-label={speakingId === msg.id ? 'Stop speaking' : 'Read aloud'}
                    >
                      {speakingId === msg.id
                        ? <><VolumeX size={10} /> Stop</>
                        : <><Volume2 size={10} /> Speak</>
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick actions */}
          {messages.length <= 2 && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1">Quick actions</p>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading}
                  className="w-full flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-gray-100 shadow-sm text-left hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-[0.98]"
                >
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon size={14} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={toggleVoice}
            disabled={loading || !recognitionRef.current}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              isListening
                ? 'bg-red-500 shadow-md shadow-red-200 animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-30'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening
              ? <MicOff size={16} className="text-white" />
              : <Mic size={16} className="text-gray-600" />
            }
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            placeholder={isListening ? 'Listening...' : 'Ask TrackMate...'}
            disabled={loading}
            className={`flex-1 bg-gray-50 border rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 disabled:opacity-50 transition-colors ${
              isListening ? 'border-red-300 bg-red-50 placeholder:text-red-400' : 'border-gray-200'
            }`}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-90 transition-transform shadow-sm"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
}



