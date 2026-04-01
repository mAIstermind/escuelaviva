import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Leaf, 
  MessageSquare, 
  RefreshCw, 
  ChevronRight, 
  ExternalLink 
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
        text: result.image_prompt, // Focus on the visual prompt here
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
          <div className="bg-emerald-600 p-2 rounded-lg rotate-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="font-black text-xl tracking-tighter italic">ALCHEMIST.AI</h1>
        </div>
        <button 
          onClick={() => setLang(l => l === "es" ? "en" : "es")}
          className="bg-[#111] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
        >
          {lang === "es" ? "ESP" : "ENG"}
        </button>
      </header>

      <main className="max-w-xl mx-auto p-5 space-y-12">
        {/* Intro */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
            {lang === "es" ? "Laboratorio Escuela Viva" : "Escuela Viva Laboratory"}
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic">
            {lang === "es" ? "Invoca a tu\nLíder Interior" : "Summon your\nInner Leader"}
          </h2>
          <p className="text-sm text-zinc-500 font-bold max-w-[280px] mx-auto italic">
            {lang === "es" ? "Combina elementos para descifrar el futuro." : "Combine elements to decipher the future."}
          </p>
        </section>

        {/* Word Grid */}
        <section className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#111] border-l-4 border-emerald-600 pl-3 flex justify-between items-center">
            <span>{lang === "es" ? "1. TUS PALABRAS CLAVE" : "1. YOUR KEY WORDS"}</span>
            <RefreshCw onClick={() => setWords({word1: "", word2: "", word3: ""})} className="w-4 h-4 cursor-pointer hover:rotate-180 transition-transform text-zinc-400" />
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            {(['eco', 'tech', 'team'] as const).map((cat, idx) => (
              <div key={cat} className="space-y-3">
                <div className="text-[10px] font-black text-center py-1.5 bg-[#111] text-white rounded uppercase tracking-tighter">
                  {cat === 'eco' ? (lang === 'es' ? 'TIERRA' : 'EARTH') : cat === 'tech' ? (lang === 'es' ? 'FUTURO' : 'FUTURE') : (lang === 'es' ? 'EQUIPO' : 'TEAM')}
                </div>
                
                <input 
                  type="text"
                  placeholder={lang === 'es' ? "Escribe..." : "Type..."}
                  value={words[`word${idx + 1}` as keyof typeof words]}
                  onChange={(e) => setWords(prev => ({ ...prev, [`word${idx+1}`]: e.target.value }))}
                  className="w-full p-2 text-[11px] font-bold border-2 border-[#111] rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-emerald-50 focus:outline-none placeholder:text-zinc-300"
                />

                <div className="space-y-1.5">
                  {WORD_OPTIONS[cat].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setWords(prev => ({ ...prev, [`word${idx + 1}`]: opt[lang] }))}
                      className={cn(
                        "w-full p-2 text-[10px] font-bold border-2 border-[#111] rounded transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none bg-white",
                        words[`word${idx + 1}` as keyof typeof words] === opt[lang] && "bg-emerald-100 ring-2 ring-emerald-600"
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
        <div className="bg-emerald-900/5 border-2 border-dashed border-emerald-600/30 p-4 rounded-xl flex flex-col items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/50">
              {lang === 'es' ? 'PALABRAS EN EL CALDERO:' : 'WORDS IN THE CAULDRON:'}
           </p>
           <div className="flex gap-2 flex-wrap justify-center">
              {[words.word1, words.word2, words.word3].map((w, i) => (
                 <div key={i} className={cn("px-3 py-1 bg-white border-2 border-[#111] rounded-full text-xs font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", !w && "opacity-20")}>
                    {w || "???"}
                 </div>
              ))}
           </div>
        </div>

        {/* Summon Button */}
        <button
          onClick={handleAlchemize}
          disabled={!words.word1 || !words.word2 || !words.word3 || isLoading}
          className="w-full py-4 bg-[#e85d04] text-white font-black text-xl rounded-xl border-2 border-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <RefreshCw className="animate-spin w-6 h-6" />
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
          {isLoading ? (lang === 'es' ? "INVOCO..." : "SUMMONING...") : (lang === 'es' ? "INVOCAR" : "SUMMON")}
        </button>

        {/* Results Stream */}
        <div className="space-y-8 mt-12 pb-10">
          <AnimatePresence>
            {messages.filter(m => m.role === 'model').slice().reverse().map((msg) => (
              <motion.div
                key={msg.timestamp}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                {!msg.data ? (
                  <div className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg font-bold text-xs">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-white border-4 border-[#111] rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(16,185,129,0.3)]">
                    <div className="bg-[#111] p-4 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-black uppercase tracking-tighter text-sm italic">{msg.data?.creature_name}</h3>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    
                    {/* Advanced Promptscroll */}
                    <div className="px-5 py-6 bg-zinc-50 border-b-2 border-dashed border-[#111]">
                      <div className="bg-[#111] p-6 rounded-xl border-2 border-[#ffd166] shadow-[8px_8px_0px_0px_rgba(232,93,4,1)] relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="text-[#ffd166] w-8 h-8" />
                         </div>
                         <p className="text-[10px] font-black uppercase text-[#ffd166] mb-3 tracking-[0.3em]">{lang === 'es' ? 'PERGAMINO VISUAL:' : 'VISUAL SCROLL:'}</p>
                         <div className="text-white font-medium text-[11px] leading-relaxed italic bg-zinc-800/30 p-4 rounded-lg border border-white/5 select-all">
                            {msg.text}
                         </div>
                         <div className="mt-4 flex gap-3">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(msg.text);
                                alert("Visual Prompt Copied!");
                              }}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                            >
                               <MessageSquare className="w-3 h-3" /> {lang === 'es' ? 'COPIAR PROMPT' : 'COPY PROMPT'}
                            </button>
                            <a 
                              href={`https://pollinations.ai/p/${encodeURIComponent(msg.text)}?width=1024&height=1024&model=flux&nologo=true`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-[#e85d04] text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                            >
                               <ExternalLink className="w-3 h-3" /> {lang === 'es' ? 'ABRIR LAB' : 'OPEN LAB'}
                            </a>
                         </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-emerald-700 underline tracking-widest">{lang === 'es' ? 'RETO DEL LÍDER:' : 'LEADER CHALLENGE:'}</p>
                         <p className="text-sm font-bold leading-relaxed italic">"{msg.data?.leadership_challenge}"</p>
                      </div>
                      <div className="bg-emerald-50 p-4 border-2 border-emerald-100 rounded-lg italic font-bold text-sm text-emerald-900">
                        {msg.data?.vision}
                      </div>
                    </div>

                    {/* Technical Metadata / JSON Section */}
                    {msg.data?.metadata && (
                      <div className="mx-5 mb-6 space-y-3">
                         <div className="flex justify-between items-center bg-zinc-100 p-2 border-2 border-[#111] rounded-lg">
                           <p className="text-[10px] font-black text-[#111] uppercase tracking-widest pl-2">VISUAL_DNA.JSON</p>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(JSON.stringify(msg.data?.metadata, null, 2));
                               alert("Visual DNA Copied!");
                             }}
                             className="text-[9px] bg-[#111] text-white px-4 py-1.5 rounded-md font-black uppercase tracking-tighter hover:bg-zinc-800 transition-all font-black"
                           >
                              COPY DNA
                           </button>
                         </div>
                         <pre className="p-4 bg-zinc-900 rounded-lg text-[10px] text-emerald-400 font-mono overflow-x-hidden whitespace-pre-wrap border-2 border-emerald-900/30">
                            {JSON.stringify(msg.data.metadata, null, 2)}
                         </pre>
                      </div>
                    )}

                    <div className="p-3 bg-[#fdf2f2] border-t-2 border-[#111] text-center italic text-[#e85d04] font-black text-xs uppercase tracking-tighter">
                      {msg.data?.closing}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t-2 border-[#111] text-[9px] font-black uppercase tracking-widest text-center flex justify-around">
        <span>PDC · ESCUELA VIVA · 2026</span>
        <span className="text-emerald-600">Summoning Leadership...</span>
      </footer>
      <div ref={messagesEndRef} />
    </div>
  );
}
