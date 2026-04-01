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
  const [imageFailed, setImageFailed] = useState<Record<number, boolean>>({});
  const [manualPrompt, setManualPrompt] = useState<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRegenerate = async (timestamp: number, prompt: string) => {
    setImageLoading(prev => ({ ...prev, [timestamp]: false }));
    setImageFailed(prev => ({ ...prev, [timestamp]: false }));
    
    setMessages(prev => {
      const newMessages = [...prev];
      const idx = newMessages.findIndex(m => m.timestamp === timestamp);
      if (idx !== -1) {
        newMessages[idx].imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;
      }
      return newMessages;
    });
  };

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
      
      const fullPrompt = `${result.image_prompt}. Style: ${result.metadata?.style}, Palette: ${result.metadata?.palette}, Details: ${result.metadata?.details}, Composition: ${result.metadata?.composition}`;
      setManualPrompt(fullPrompt);

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
                  
                  {/* Custom Input */}
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
                    
                    {/* Advanced Promptscroll */}
                    <div className="px-5 mb-6">
                      <div className="bg-[#111] p-6 rounded-xl border-2 border-[#ffd166] shadow-[8px_8px_0px_0px_rgba(232,93,4,1)] relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="text-[#ffd166] w-8 h-8" />
                         </div>
                         <p className="text-[10px] font-black uppercase text-[#ffd166] mb-3 tracking-[0.3em]">{lang === 'es' ? 'PERGAMINO DE INVOCACIÓN:' : 'SUMMONING SCROLL:'}</p>
                         <div className="text-white font-medium text-sm leading-relaxed italic bg-zinc-800/50 p-4 rounded-lg border border-white/10 select-all">
                            {manualPrompt}
                         </div>
                         <div className="mt-4 flex gap-3">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(manualPrompt);
                                alert("Prompt Copied!");
                              }}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                            >
                               <RefreshCw className="w-3 h-3" /> {lang === 'es' ? 'COPIAR PROMPT' : 'COPY PROMPT'}
                            </button>
                         </div>
                      </div>
                    </div>

                    {/* Technical Metadata / JSON Section */}
                    {msg.data?.metadata && (
                      <div className="mx-5 mb-6 space-y-3">
                         <div className="flex justify-between items-center bg-zinc-100 p-2 border-2 border-[#111] rounded-lg">
                           <p className="text-[10px] font-black text-[#111] uppercase tracking-widest pl-2">TECHNICAL_DATA.JSON</p>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(JSON.stringify(msg.data, null, 2));
                               alert("JSON Data Copied!");
                             }}
                             className="text-[9px] bg-[#111] text-white px-4 py-1.5 rounded-md font-black uppercase tracking-tighter hover:bg-zinc-800 transition-all"
                           >
                              COPY JSON
                           </button>
                         </div>
                         <pre className="p-4 bg-zinc-900 rounded-lg text-[10px] text-emerald-400 font-mono overflow-x-hidden whitespace-pre-wrap border-2 border-emerald-900/30">
                            {JSON.stringify(msg.data.metadata, null, 2)}
                         </pre>
                      </div>
                    )}

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

                    {/* Manual Prompt Editor & Tweak Area */}
                    <div className="px-5 mb-4 space-y-3">
                      <div className="flex justify-between items-end border-b border-zinc-200 pb-2">
                        <p className="text-[10px] font-black uppercase text-emerald-800">{lang === 'es' ? '✏️ AJUSTAR ALQUIMIA VISUAL:' : '✏️ TWEAK VISUAL ALCHEMY:'}</p>
                        <button 
                          onClick={() => handleRegenerate(msg.timestamp, manualPrompt)}
                          className="flex items-center gap-1.5 bg-[#e85d04] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md hover:scale-105 transition-all"
                        >
                           <RefreshCw className="w-3 h-3" />
                           {lang === 'es' ? 'REGENERAR IMAGEN' : 'REGENERATE IMAGE'}
                        </button>
                      </div>
                      <textarea 
                        value={manualPrompt}
                        onChange={(e) => setManualPrompt(e.target.value)}
                        className="w-full p-3 bg-zinc-50 border-2 border-[#111] rounded-lg text-xs font-medium text-zinc-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[80px]"
                        placeholder={lang === 'es' ? "Edita el prompt aquí..." : "Edit the prompt here..."}
                      />
                    </div>

                    {/* Prompt Metadata Section */}
                    {msg.data?.metadata && (
                      <div className="p-4 bg-zinc-900 mx-5 mb-5 rounded-lg border border-white/10 shadow-inner group">
                        <div className="flex justify-between items-center mb-3">
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ffd166] opacity-60">Technical Handoff (JSON)</p>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(JSON.stringify(msg.data?.metadata, null, 2));
                               alert("JSON Prompt Data Copied!");
                             }}
                             className="text-[8px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors text-white uppercase font-bold"
                           >
                              Copy Data
                           </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(msg.data.metadata).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                              <p className="text-[8px] font-black text-emerald-400/70 uppercase tracking-tighter">{key}:</p>
                              <p className="text-[10px] text-zinc-300 font-medium leading-tight">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
           <p className="text-[#ffd166] text-[8px] font-bold tracking-[0.3em] uppercase">PDC · ESCUELA VIVA · 2026</p>
        </footer>

      </div>
    </div>
  );
}
