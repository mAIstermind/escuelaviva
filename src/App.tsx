import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Zap, Shield, Waves, TreePine, Users, Info, Palette, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateCreature, generateImage, type Message, type AlchemistResponse } from "./lib/gemini";
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

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
      text: `${words.word1}, ${words.word2}, ${words.word3} (${lang})`,
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

      const imageUrl = await generateImage(result.image_prompt);
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
      <div className="flex items-center gap-4 bg-white rounded-full px-5 py-2 shadow-md comic-border">
        <span className="text-xl">🇲🇽</span>
        <span className={cn("text-xs font-black uppercase tracking-widest", lang === "es" ? "text-black" : "text-zinc-300")}>Español</span>
        <button 
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="relative w-14 h-7 bg-[#0a5c36] rounded-full p-1 transition-colors"
          style={{ backgroundColor: lang === "es" ? "var(--jungle)" : "var(--ocean)" }}
        >
          <motion.div 
            animate={{ x: lang === "es" ? 0 : 28 }}
            className="w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center text-[10px]"
          >
            {lang === "es" ? "🇲🇽" : "🇬🇧"}
          </motion.div>
        </button>
        <span className={cn("text-xs font-black uppercase tracking-widest", lang === "en" ? "text-black" : "text-zinc-300")}>English</span>
        <span className="text-xl">🇬🇧</span>
      </div>

      <div className="w-full max-w-[210mm] bg-[#fffbf0] shadow-2xl comic-border relative overflow-hidden flex flex-col min-h-[297mm]">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-[#0a5c36]" />
          <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full bg-[#e85d04]" />
          <div className="absolute top-1/2 right-0 w-24 h-24 rounded-full bg-[#0077b6]" />
        </div>

        {/* Header */}
        <header className="bg-[#0a5c36] p-6 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ffd166]">
                Youth Leadership Week · Escuela Viva · Playa del Carmen
              </p>
              <h1 className="text-4xl md:text-5xl text-white leading-none">
                {lang === "es" ? <>El <span className="text-[#ffd166]">Decodificador</span> de Curiosidad</> : <>The <span className="text-[#ffd166]">Curiosity</span> Decoder</>}
              </h1>
              <p className="text-xs font-bold text-white/80">
                {lang === "es" ? "Tu curiosidad tiene forma. Hoy la vas a descubrir." : "Your curiosity has a shape. Today you'll discover it."}
              </p>
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mt-2 text-[9px] font-black text-white/90 uppercase tracking-wider">
                🌐 {lang === "es" ? "Toca el switch arriba para leer en inglés" : "Tap the switch above to read in Spanish"}
              </div>
            </div>
            <div className="bg-[#ffd166] text-[#111111] p-3 rounded-lg text-center font-comic leading-tight shrink-0 shadow-lg">
              ⚗️ Alquimista<br />de Sueños<br />
              <span className="text-[10px] opacity-70 font-sans font-bold">Dream Alchemist</span>
            </div>
          </div>
          <div className="absolute bottom-[-12px] left-0 right-0 h-6 bg-[#fffbf0] rounded-[100%]" />
        </header>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col gap-8 relative z-10">
          
          {/* How it works */}
          <div className="grid grid-cols-4 comic-border rounded-lg bg-white overflow-hidden">
            {[
              { icon: "🔤", es: "Elige 3 palabras", en: "Choose 3 words", sub_es: "Una de cada columna", sub_en: "One from each column" },
              { icon: "⚗️", es: "Dáselas al Alquimista", en: "Give them to the Alchemist", sub_es: "Escríbelas en el Gem", sub_en: "Type them into the Gem" },
              { icon: "🎨", es: "Dibuja tu ser", en: "Draw your being", sub_es: "Usa la imagen IA", sub_en: "Use the AI image" },
              { icon: "✍️", es: "Ponle nombre", en: "Name it", sub_es: "Tú lo invocaste.", sub_en: "You summoned it." },
            ].map((step, i) => (
              <div key={i} className="p-2 flex flex-col items-center text-center gap-1 border-r last:border-r-0 border-zinc-100">
                <span className="text-xl">{step.icon}</span>
                <p className="text-[9.5px] font-black leading-tight">{lang === "es" ? step.es : step.en}</p>
                <p className="text-[8px] font-bold text-zinc-400">{lang === "es" ? step.sub_es : step.sub_en}</p>
              </div>
            ))}
          </div>

          {/* Step 1: Word Grid */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="step-num">1</div>
              <h2 className="text-xl text-[#111111]">
                {lang === "es" ? "Escoge tus 3 palabras — una de cada columna" : "Pick 3 words — one from each column"}
              </h2>
            </div>
            <div className="comic-border rounded-lg bg-white overflow-hidden">
              <div className="grid grid-cols-3 bg-[#111111]">
                <div className="p-2 text-center text-[#6ee7b7] font-comic text-sm">🌊 {lang === "es" ? "Eco-Guerrero" : "Eco-Warrior"}</div>
                <div className="p-2 text-center text-[#93c5fd] font-comic text-sm">🚀 {lang === "es" ? "Visionario" : "Visionary"}</div>
                <div className="p-2 text-center text-[#fde68a] font-comic text-sm">🤝 {lang === "es" ? "Conector" : "Connector"}</div>
              </div>
              <div className="grid grid-cols-3">
                {(['eco', 'tech', 'team'] as const).map((cat) => (
                  <div key={cat} className="p-2 flex flex-col gap-2 border-r last:border-r-0 border-zinc-100">
                    {WORD_OPTIONS[cat].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setWords(prev => ({ ...prev, [`word${cat === 'eco' ? 1 : cat === 'tech' ? 2 : 3}`]: opt[lang] }))}
                        className={cn(
                          "word-chip",
                          cat === 'eco' ? "chip-eco" : cat === 'tech' ? "chip-tech" : "chip-team",
                          words[`word${cat === 'eco' ? 1 : cat === 'tech' ? 2 : 3}`] === opt[lang] && "ring-2 ring-black scale-105"
                        )}
                      >
                        <span className="block text-[12.5px]">{opt[lang]}</span>
                        <span className="block text-[8.5px] opacity-60 italic">{lang === 'es' ? opt.sub_es : opt.sub_en}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <div className="bg-[#fff8f5] p-2 text-center border-t border-dashed border-zinc-200">
                <p className="text-[9.5px] font-bold text-[#e85d04]">
                  ⚡ {lang === "es" ? "¿Tienes tus propias palabras? ¡Úsalas! Entre más raras, mejor." : "Got your own words? Use them! The stranger, the better."}
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: My Words */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="step-num">2</div>
              <h2 className="text-xl text-[#111111]">
                {lang === "es" ? "Mis 3 palabras son..." : "My 3 words are..."}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="comic-border rounded-lg overflow-hidden bg-white">
                  <div className="bg-[#111111] text-[#ffd166] text-center py-1 text-[10px] font-comic">
                    {lang === "es" ? `PALABRA ${i}` : `WORD ${i}`}
                  </div>
                  <input
                    type="text"
                    value={words[`word${i}` as keyof typeof words]}
                    onChange={(e) => setWords(prev => ({ ...prev, [`word${i}`]: e.target.value }))}
                    className="w-full p-3 text-center font-black text-lg focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAlchemize}
              disabled={!words.word1 || !words.word2 || !words.word3 || isLoading}
              className="w-full py-4 bg-[#e85d04] text-white font-comic text-2xl rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : <>⚗️ {lang === "es" ? "¡INICIAR ALQUIMIA!" : "START ALCHEMY!"}</>}
            </button>
          </section>

          {/* Results Area */}
          <AnimatePresence mode="popLayout">
            {messages.filter(m => m.role === "model").reverse().map((msg, idx) => (
              <motion.div
                key={msg.timestamp}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Step 3: Draw Area / AI Result */}
                <section className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="step-num">3</div>
                    <h2 className="text-xl text-[#111111]">
                      {lang === "es" ? "Dibuja tu ser aquí" : "Draw your being here"}
                    </h2>
                  </div>
                  <div className="comic-border rounded-lg overflow-hidden bg-white flex flex-col">
                    <div className="bg-[#e85d04] p-2 flex justify-between items-center px-4">
                      <h3 className="text-white text-lg">🔥 {lang === "es" ? "Mi Ser Legendario" : "My Legendary Being"}</h3>
                      <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">
                        {lang === "es" ? "usa la imagen IA como inspiración" : "use the AI image as inspiration"}
                      </p>
                    </div>
                    <div className="p-3 bg-[#fff8f5] border-b border-zinc-100 flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#e85d04] uppercase tracking-widest shrink-0">⚡ {lang === "es" ? "Nombre / Name:" : "Name / Nombre:"}</span>
                      <div className="flex-1 border-b-2 border-[#111111] font-comic text-2xl text-[#111111] px-2">
                        {msg.data?.creature_name}
                      </div>
                    </div>
                    <div className="aspect-square md:aspect-video bg-white relative flex items-center justify-center overflow-hidden">
                      {/* Grid background like a drawing area */}
                      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, #111 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      
                      {msg.imageUrl ? (
                        <motion.img 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={msg.imageUrl} 
                          className="relative z-10 w-full h-full object-contain p-4" 
                        />
                      ) : (
                        <div className="relative z-10 flex flex-col items-center gap-2 text-zinc-300">
                          <Loader2 className="animate-spin w-10 h-10" />
                          <p className="text-[10px] font-black uppercase tracking-widest">{lang === 'es' ? 'Invocando...' : 'Summoning...'}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-[14px] font-bold text-zinc-200 uppercase tracking-widest">
                          {lang === 'es' ? 'Dibuja aquí — ¡no hay reglas!' : 'Draw here — no rules!'}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t border-zinc-100 italic text-zinc-500 text-sm leading-relaxed text-center">
                      "{msg.data?.vision}"
                    </div>
                  </div>
                </section>

                {/* Step 4: Challenge */}
                <section className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="step-num">4</div>
                    <h2 className="text-xl text-[#111111]">
                      {lang === "es" ? "El Reto del Líder" : "The Leader Challenge"}
                    </h2>
                  </div>
                  <div className="bg-[#0077b6] p-5 rounded-lg comic-border text-white space-y-3">
                    <h3 className="text-[#ffd166] text-lg">⚡ {lang === "es" ? "Si este ser fuera tu compañero de equipo..." : "If this being were your teammate..."}</h3>
                    <p className="text-xs font-bold leading-relaxed">
                      {msg.data?.leadership_challenge}
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="border-b border-white/30 h-6" />
                      <div className="border-b border-white/30 h-6" />
                      <div className="border-b border-white/30 h-6" />
                    </div>
                  </div>
                </section>

                <div className="text-center py-4">
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    {msg.data?.closing}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State Hint */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 grayscale">
              <Sparkles className="w-20 h-20 mb-4" />
              <p className="font-comic text-2xl">{lang === 'es' ? 'Esperando tus palabras...' : 'Waiting for your words...'}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="bg-[#111111] p-4 flex justify-between items-center px-6">
          <p className="text-[9px] font-bold text-white/50 italic max-w-[70%]">
            {lang === "es" 
              ? "\"El ser más poderoso en esta hoja no es el que dibujaste — es la pregunta que se te ocurrió mientras lo hacías.\""
              : "\"The most powerful being on this page isn't the one you drew — it's the question that came to you while drawing it.\""}
          </p>
          <div className="text-[#ffd166] font-comic text-sm">MIKE · PDC · 2025</div>
        </footer>


      </div>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {isInstallable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <button
              onClick={handleInstall}
              className="bg-[#0a5c36] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all border-2 border-white/20"
            >
              <Zap className="w-5 h-5 text-[#ffd166] fill-[#ffd166]" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-white/70">
                  {lang === 'es' ? 'App Disponible' : 'App Available'}
                </p>
                <p className="text-sm font-bold leading-none">
                  {lang === 'es' ? 'Instalar App' : 'Install App'}
                </p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
