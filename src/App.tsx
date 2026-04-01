import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Leaf, 
  MessageSquare, 
  RefreshCw, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./lib/utils";
import { generateCreature, Message } from "./lib/gemini";

const WORD_OPTIONS = {
  eco: [
    { es: "Jaguar", en: "Jaguar" },
    { es: "Selva", en: "Jungle" },
    { es: "Río", en: "River" },
    { es: "Montaña", en: "Mountain" },
  ],
  tech: [
    { es: "Drone", en: "Drone" },
    { es: "Panel Solar", en: "Solar Panel" },
    { es: "Satélite", en: "Satellite" },
    { es: "Bio-Robot", en: "Bio-Robot" },
  ],
  team: [
    { es: "Unión", en: "Unity" },
    { es: "Círculo", en: "Circle" },
    { es: "Puente", en: "Bridge" },
    { es: "Fuego", en: "Fire" },
  ],
};

export default function App() {
  const [words, setWords] = useState({ word1: "", word2: "", word3: "" });
  const [lang, setLang] = useState<"es" | "en">("es");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAlchemize = async () => {
    if (!words.word1 || !words.word2 || !words.word3 || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      text: `${words.word1}, ${words.word2}, ${words.word3}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await generateCreature(words.word1, words.word2, words.word3, lang);
      const aiMessage: Message = {
        role: "model",
        text: result.image_prompt,
        timestamp: Date.now(),
        data: result,
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Alchemist error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: lang === "es" ? "¡Rayos! La alquimia falló. Intenta de nuevo." : "Gosh! Alchemy failed. Try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setWords({ word1: "", word2: "", word3: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#111] font-medium pb-20 selection:bg-emerald-200">
      <header className="bg-white border-b-4 border-[#111] p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-[#111]">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="font-black text-2xl tracking-tighter italic uppercase">ALCHEMIST.AI</h1>
        </div>
        <div className="flex gap-4 items-center">
            <button 
                onClick={() => setMessages([])}
                className="text-zinc-400 hover:text-red-500 transition-colors"
            >
                {messages.length > 0 && <Trash2 className="w-5 h-5" />}
            </button>
            <button 
                onClick={() => setLang(l => l === "es" ? "en" : "es")}
                className="bg-[#111] text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
            >
                {lang === "es" ? "ESP" : "ENG"}
            </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-5 space-y-12">
        {/* Intro */}
        <section className="text-center space-y-4 pt-10">
          <div className="inline-block px-4 py-1 bg-emerald-100 border-2 border-emerald-600 text-emerald-800 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
            {lang === "es" ? "Laboratorio Escuela Viva" : "Escuela Viva Laboratory"}
          </div>
          <h2 className="text-6xl font-black uppercase tracking-tighter leading-none italic [text-shadow:4px_4px_0px_rgba(0,0,0,0.1)]">
            {lang === "es" ? "Descubre a tu\nLíder" : "Summon your\nLeader"}
          </h2>
          <p className="text-sm text-zinc-500 font-bold max-w-[280px] mx-auto italic">
            {lang === "es" ? "Combina elementos para descifrar el futuro." : "Combine elements to decipher the future."}
          </p>
        </section>

        {/* Word Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-wider text-[#111] border-l-8 border-emerald-600 pl-4 flex justify-between items-center italic">
            <span>{lang === "es" ? "1. TUS PALABRAS CLAVE" : "1. YOUR KEY WORDS"}</span>
            <RefreshCw onClick={() => setWords({word1: "", word2: "", word3: ""})} className="w-5 h-5 cursor-pointer hover:rotate-180 transition-transform text-zinc-400" />
          </h2>
          
          <div className="grid grid-cols-3 gap-6">
            {(['eco', 'tech', 'team'] as const).map((cat, idx) => (
              <div key={cat} className="space-y-4 group">
                <div className="text-[10px] font-black text-center py-2 bg-[#111] text-white rounded-lg uppercase tracking-tighter group-hover:bg-emerald-600 transition-colors">
                  {cat === 'eco' ? (lang === 'es' ? 'TIERRA' : 'EARTH') : cat === 'tech' ? (lang === 'es' ? 'FUTURO' : 'FUTURE') : (lang === 'es' ? 'EQUIPO' : 'TEAM')}
                </div>
                
                <input 
                  type="text"
                  placeholder={lang === 'es' ? "Manual..." : "Manual..."}
                  value={words[`word${idx + 1}` as keyof typeof words]}
                  onChange={(e) => setWords(prev => ({ ...prev, [`word${idx+1}`]: e.target.value }))}
                  className="w-full p-2.5 text-xs font-black border-4 border-[#111] rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-emerald-50 focus:outline-none placeholder:text-zinc-300 italic"
                />

                <div className="space-y-2">
                  {WORD_OPTIONS[cat].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setWords(prev => ({ ...prev, [`word${idx + 1}`]: opt[lang] }))}
                      className={cn(
                        "w-full p-2.5 text-[11px] font-black border-2 border-[#111] rounded-xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none bg-white",
                        words[`word${idx + 1}` as keyof typeof words] === opt[lang] && "bg-emerald-100 ring-4 ring-emerald-600"
                      )}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selection Tray */}
        <div className="bg-emerald-900/5 border-4 border-emerald-600/30 p-6 rounded-[2rem] flex flex-col items-center gap-4 border-dashed relative">
           <div className="absolute -top-3 bg-white px-4 border-2 border-emerald-600 text-[10px] font-black uppercase text-emerald-600 rounded-full tracking-[0.2em]">
              {lang === 'es' ? 'EL CALDERO' : 'THE CAULDRON'}
           </div>
           <div className="flex gap-3 flex-wrap justify-center">
              {[words.word1, words.word2, words.word3].map((w, i) => (
                 <div key={i} className={cn("px-5 py-2 bg-white border-4 border-[#111] rounded-full text-sm font-black italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all", !w && "opacity-10 grayscale scale-90")}>
                    {w || "???"}
                 </div>
              ))}
           </div>
        </div>

        {/* Summon Button */}
        <button
          onClick={handleAlchemize}
          disabled={!words.word1 || !words.word2 || !words.word3 || isLoading}
          className="w-full py-6 bg-[#e85d04] text-white font-black text-3xl rounded-[2rem] border-4 border-[#111] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-4 italic"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-8 h-8" />
          ) : (
            <Sparkles className="w-8 h-8" />
          )}
          {isLoading ? (lang === 'es' ? "DESCIFRANDO..." : "DECODING...") : (lang === 'es' ? "INICIAR ALQUIMIA" : "START ALCHEMY")}
        </button>

        {/* Results Stream */}
        <div className="space-y-12 mt-20 pb-20">
          <AnimatePresence>
            {messages.filter(m => m.role === 'model').slice().reverse().map((msg) => (
              <motion.div
                key={msg.timestamp}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                {!msg.data ? (
                  <div className="p-6 bg-red-100 border-4 border-red-500 text-red-700 rounded-3xl font-black text-sm shadow-[8px_8px_0px_0px_rgba(239,68,68,0.2)]">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-white border-4 border-[#111] rounded-[2.5rem] overflow-hidden shadow-[20px_20px_0px_0px_rgba(16,185,129,0.3)]">
                    <div className="bg-[#111] p-5 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3">
                        <Leaf className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-black uppercase tracking-tighter text-xl italic">{msg.data?.creature_name}</h3>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      </div>
                    </div>
                    
                    {/* Visual DNA Section */}
                    <div className="bg-zinc-50 border-b-4 border-[#111] p-6 space-y-6">
                        {/* Summoning Scroll */}
                        <div className="bg-[#111] p-8 rounded-3xl border-4 border-[#ffd166] shadow-[12px_12px_0px_0px_rgba(232,93,4,1)] relative group">
                            <Sparkles className="absolute top-4 right-4 text-[#ffd166]/20 group-hover:text-[#ffd166] transition-colors w-12 h-12" />
                            <p className="text-[11px] font-black uppercase text-[#ffd166] mb-4 tracking-[0.4em]">{lang === 'es' ? 'PERGAMINO VISUAL' : 'VISUAL SCROLL'}</p>
                            <div className="text-white font-black text-sm leading-relaxed italic bg-emerald-900/20 p-5 rounded-2xl border-2 border-white/5 select-all font-serif">
                                {msg.text}
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(msg.text);
                                        alert("Visual Prompt Copied!");
                                    }}
                                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-3 border-2 border-[#111] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <MessageSquare className="w-4 h-4" /> {lang === 'es' ? 'COPIAR PROMPT' : 'COPY PROMPT'}
                                </button>
                                <a 
                                    href={`https://pollinations.ai/p/${encodeURIComponent(msg.text)}?width=1024&height=1024&model=flux&nologo=true`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#e85d04] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 border-2 border-[#111] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <ExternalLink className="w-4 h-4" /> {lang === 'es' ? 'LABORATORIO' : 'LABORATORY'}
                                </a>
                            </div>
                        </div>

                        {/* Visual DNA JSON Output */}
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-zinc-100 p-2 border-4 border-[#111] rounded-2xl">
                             <p className="text-[11px] font-black text-[#111] uppercase tracking-[0.2em] pl-4 italic">VISUAL_DNA.JSON</p>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(JSON.stringify(msg.data?.metadata, null, 2));
                                 alert("Visual DNA Copied!");
                               }}
                               className="text-[10px] bg-[#111] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-tighter hover:bg-emerald-600 transition-all border-2 border-white/10"
                             >
                                COPIAR DNA
                             </button>
                           </div>
                           <pre className="p-6 bg-zinc-900 rounded-[2.5rem] text-[11px] text-emerald-400 font-mono overflow-x-hidden whitespace-pre-wrap border-4 border-emerald-900/40">
                              {JSON.stringify(msg.data?.metadata, null, 2)}
                           </pre>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                      <div className="space-y-3">
                         <p className="text-[11px] font-black text-emerald-700 underline underline-offset-4 tracking-widest uppercase">{lang === 'es' ? 'EL DESAFÍO DEL LÍDER:' : 'THE LEADER CHALLENGE:'}</p>
                         <p className="text-lg font-black leading-tight italic tracking-tight">"{msg.data?.leadership_challenge}"</p>
                      </div>
                      <div className="bg-emerald-50 p-8 border-4 border-emerald-100 rounded-[2rem] font-bold text-base text-emerald-900 leading-relaxed shadow-inner">
                        {msg.data?.vision}
                      </div>
                    </div>

                    <div className="p-4 bg-[#fdf2f2] border-t-4 border-[#111] text-center italic text-[#e85d04] font-black text-sm uppercase tracking-[0.2em]">
                      {msg.data?.closing}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-[#111] text-[10px] font-black uppercase tracking-[0.5em] text-center flex justify-around">
        <span>PDC · ESCUELA VIVA · 2026</span>
        <span className="text-emerald-600 animate-pulse italic">Decoding the Future...</span>
      </footer>
      <div ref={messagesEndRef} />
    </div>
  );
}
