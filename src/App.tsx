import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Info, BookOpen, Quote, X, RefreshCw, Smartphone, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateCreature, generateImage, type Message } from "./lib/gemini";
import { cn } from "./lib/utils";

const WORD_OPTIONS = {
  eco: [
    { es: "Cenote", en: "Cenote", sub_es: "río subterráneo", sub_en: "underground river" },
    { es: "Jaguar", en: "Jaguar", sub_es: "guardián de la selva", sub_en: "jungle guardian" },
    { es: "Coral", en: "Coral", sub_es: "protector del arrecife", sub_en: "reef protector" },
    { es: "Selva", en: "Jungle", sub_es: "bosque ancestral", sub_en: "ancient forest" },
    { es: "Ola", en: "Wave", sub_es: "ola del océano", sub_en: "ocean wave" },
  ],
  tech: [
    { es: "Neón", en: "Neon", sub_es: "brillo eléctrico", sub_en: "electric glow" },
    { es: "Dron", en: "Drone", sub_es: "máquina del cielo", sub_en: "sky machine" },
    { es: "Holograma", en: "Hologram", sub_es: "proyección de luz", sub_en: "light projection" },
    { es: "Rayo", en: "Lightning", sub_es: "rayo eléctrico", sub_en: "lightning strike" },
    { es: "Robot", en: "Robot", sub_es: "constructor del futuro", sub_en: "future builder" },
  ],
  team: [
    { es: "Luz", en: "Light", sub_es: "luz que guía", sub_en: "guiding light" },
    { es: "Fuego", en: "Fire", sub_es: "fuego interior", sub_en: "inner fire" },
    { es: "Escudo", en: "Shield", sub_es: "protector", sub_en: "protector" },
    { es: "Semilla", en: "Seed", sub_es: "nuevo comienzo", sub_en: "new beginning" },
    { es: "Puente", en: "Bridge", sub_es: "conector", sub_en: "connector" },
  ]
};

export default function App() {
  const [words, setWords] = useState({ word1: "", word2: "", word3: "" });
  const [lang, setLang] = useState<"es" | "en">("es");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

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
        text: "",
        timestamp: Date.now(),
        data: result,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // If the proxy already returned an image, we use it; otherwise fetch fallback
      const imageUrl = result.imageUrl || await generateImage(result.image_prompt);
      setMessages((prev) => {
        const newMessages = [...prev];
        const last = newMessages[newMessages.length - 1];
        if (last.role === "model") {
          last.imageUrl = imageUrl;
        }
        return newMessages;
      });

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
    <div className="min-h-screen bg-[#c8e6c9] flex flex-col items-center p-4 md:p-8 gap-6 font-sans">
      
      {/* Language Toggle */}
      <button 
        onClick={() => setLang(lang === "es" ? "en" : "es")}
        className="flex items-center gap-4 bg-white rounded-full px-5 py-2 shadow-md hover:scale-105 transition-all border-2 border-[#111]"
      >
        <span className={cn("text-xs font-black uppercase tracking-widest", lang === "es" ? "text-emerald-800" : "text-zinc-300")}>ESPAÑOL</span>
        <div className="w-10 h-5 bg-zinc-100 rounded-full relative flex items-center p-1">
          <motion.div 
            animate={{ x: lang === "es" ? 0 : 20 }}
            className="w-3 h-3 bg-emerald-600 rounded-full"
          />
        </div>
        <span className={cn("text-xs font-black uppercase tracking-widest", lang === "en" ? "text-emerald-800" : "text-zinc-300")}>ENGLISH</span>
      </button>

      <div className="w-full max-w-[210mm] bg-[#fffbf0] shadow-2xl relative overflow-hidden flex flex-col min-h-[297mm] rounded-xl border-[3px] border-[#111]">
        
        {/* Header */}
        <header className="bg-[#0a5c36] p-6 relative">
          <div className="relative z-10 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ffd166]">
              Escuela Viva · Playa del Carmen
            </p>
            <h1 className="text-4xl text-white font-black leading-tight italic">
              {lang === "es" ? <>EL DECODIFICADOR <span className="text-[#ffd166]">VIVA</span></> : <>THE <span className="text-[#ffd166]">VIVA</span> DECODER</>}
            </h1>
          </div>
          <div className="absolute top-0 right-0 p-4">
             <Zap className="w-12 h-12 text-[#ffd166] opacity-30" />
          </div>
        </header>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col gap-8 relative z-10">
          
          {/* Instructions */}
          <div className="grid grid-cols-3 border-2 border-[#111] rounded-lg bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {[
              { icon: "🎨", es: "Elige 3 palabras", en: "Pick 3 words" },
              { icon: "⚗️", es: "Inicia Alquimia", en: "Start Alchemy" },
              { icon: "✍️", es: "Dibuja tu ser", en: "Draw your being" }
            ].map((step, i) => (
              <div key={i} className="p-3 text-center border-r-2 last:border-r-0 border-[#111] bg-emerald-50/30">
                <span className="text-xl block mb-1">{step.icon}</span>
                <p className="text-[10px] font-black uppercase tracking-widest">{lang === "es" ? step.es : step.en}</p>
              </div>
            ))}
          </div>

          {/* Word Grid */}
          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-[#111] border-l-4 border-emerald-600 pl-3">
              {lang === "es" ? "1. TUS PALABRAS CLAVE" : "1. YOUR KEY WORDS"}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(['eco', 'tech', 'team'] as const).map((cat) => (
                <div key={cat} className="space-y-2">
                  <div className="text-[10px] font-black text-center py-1 bg-[#111] text-white rounded uppercase tracking-tighter">
                    {cat === 'eco' ? (lang === 'es' ? 'TIERRA' : 'EARTH') : cat === 'tech' ? (lang === 'es' ? 'FUTURO' : 'FUTURE') : (lang === 'es' ? 'EQUIPO' : 'TEAM')}
                  </div>
                  {WORD_OPTIONS[cat].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setWords(prev => ({ ...prev, [`word${cat === 'eco' ? 1 : cat === 'tech' ? 2 : 3}`]: opt[lang] }))}
                      className={cn(
                        "w-full p-2 text-[11px] font-bold border-2 border-[#111] rounded transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none bg-white",
                        words[`word${cat === 'eco' ? 1 : cat === 'tech' ? 2 : 3}`] === opt[lang] && "bg-emerald-100 ring-2 ring-emerald-600"
                      )}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Summon Button */}
          <button
            onClick={handleAlchemize}
            disabled={!words.word1 || !words.word2 || !words.word3 || isLoading}
            className="w-full py-4 bg-[#e85d04] text-white font-black text-xl rounded-xl border-2 border-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : <>⚗️ {lang === "es" ? "INVOCAR SER" : "SUMMON BEING"}</>}
          </button>

          {/* Results Area */}
          <AnimatePresence mode="popLayout">
            {messages.slice().reverse().map((msg) => (
              <motion.div
                key={msg.timestamp}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {msg.role === "user" ? (
                  <div className="flex justify-start">
                    <div className="bg-emerald-100 border-2 border-[#111] p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[80%]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1">{lang === 'es' ? 'PALABRAS ELEGIDAS:' : 'CHOSEN WORDS:'}</p>
                      <p className="text-lg font-black italic">"{msg.text}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-[3px] border-[#111] rounded-xl overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-[#111] p-3 flex justify-between items-center">
                      <h3 className="text-[#ffd166] text-sm font-black uppercase italic tracking-widest">{msg.data?.creature_name}</h3>
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    
                    <div className="aspect-square relative overflow-hidden bg-zinc-100 flex items-center justify-center border-b-2 border-[#111]">
                      {msg.imageUrl ? (
                        <div className="relative w-full h-full">
                          {!imageLoading[msg.timestamp] && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-20">
                              <Loader2 className="animate-spin w-12 h-12 text-emerald-600 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Summoning Visual...</p>
                            </div>
                          )}
                          <img 
                            src={msg.imageUrl} 
                            alt="Creature"
                            className={cn("w-full h-full object-cover transition-opacity duration-1000", imageLoading[msg.timestamp] ? "opacity-100" : "opacity-0")}
                            onLoad={() => setImageLoading(prev => ({...prev, [msg.timestamp]: true}))}
                          />
                        </div>
                      ) : (
                        <div className="relative z-10 flex flex-col items-center gap-2 text-zinc-300 bg-white/10 p-6 rounded-xl backdrop-blur-sm text-center">
                          <Loader2 className="animate-spin w-10 h-10 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                             {lang === 'es' ? 'ALQUIMIA EN PROCESO (PODRÍA TARDAR 60S SI EL TIER ESTÁ LLENO)' : 'ALCHEMY IN PROGRESS (MAY TAKE 60S IF TIER IS FULL)'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-emerald-700 underline tracking-widest">{lang === 'es' ? 'RETO DEL LÍDER:' : 'LEADER CHALLENGE:'}</p>
                         <p className="text-sm font-bold leading-relaxed italic">"{msg.data?.leadership_challenge}"</p>
                      </div>
                      <div className="bg-emerald-50 p-4 border-2 border-emerald-100 rounded-lg">
                        <p className="text-sm font-medium text-emerald-900 leading-relaxed">
                           {msg.data?.vision}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#fdf2f2] border-t-2 border-[#111] text-center italic text-[#e85d04] font-bold text-xs">
                      {msg.data?.closing}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {messages.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-10">
                <Sparkles className="w-20 h-20 mb-4" />
                <p className="font-black text-2xl tracking-tighter uppercase">Waiting for Alchemy...</p>
             </div>
          )}

        </div>

        <footer className="p-4 bg-[#111] text-center">
           <p className="text-[#ffd166] text-[8px] font-bold tracking-[0.3em] uppercase">PDC · ESCUELA VIVA · 2025</p>
        </footer>

      </div>
    </div>
  );
}
