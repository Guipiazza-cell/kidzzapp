import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star, Heart, Moon, MessageCircle, Leaf, Check } from "lucide-react";
import chameleonFrame from "@/assets/lp-chameleon-frame.png";
import { haptic } from "@/lib/haptics";

const APP_URL = "https://kidzzapp.lovable.app";

/* ---------- BACKGROUND ATMOSFÉRICO ---------- */
const AtmosphericBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
    <div className="absolute inset-0" style={{ background: "#F7F6F2" }} />
    {/* Luz volumétrica */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 0%, rgba(143,191,127,0.18) 0%, transparent 70%), radial-gradient(80% 60% at 50% 100%, rgba(53,91,69,0.10) 0%, transparent 70%)",
      }}
    />
    {/* Folhas desfocadas */}
    {[
      { top: "5%", left: "-6%", size: 280, dur: 22, delay: 0 },
      { top: "20%", right: "-8%", size: 320, dur: 26, delay: 4 },
      { top: "55%", left: "-10%", size: 260, dur: 24, delay: 2 },
      { top: "75%", right: "-6%", size: 300, dur: 28, delay: 6 },
    ].map((l, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          ...l,
          width: l.size,
          height: l.size,
          background:
            "radial-gradient(circle, rgba(143,191,127,0.22) 0%, rgba(143,191,127,0) 70%)",
          filter: "blur(40px)",
        }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
    {/* Vagalumes */}
    {Array.from({ length: 14 }).map((_, i) => {
      const top = `${(i * 53) % 100}%`;
      const left = `${(i * 37) % 100}%`;
      const dur = 6 + (i % 5);
      return (
        <motion.span
          key={`f-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{ top, left, background: "rgba(143,191,127,0.7)", boxShadow: "0 0 12px rgba(143,191,127,0.55)" }}
          animate={{ opacity: [0.15, 0.9, 0.15], y: [0, -14, 0] }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      );
    })}
  </div>
);

/* ---------- BOTÃO PREMIUM ---------- */
const PremiumCTA = ({
  children,
  onClick,
  size = "lg",
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  size?: "lg" | "md";
  variant?: "primary" | "ghost";
}) => {
  const base =
    size === "lg"
      ? "px-8 py-5 text-base md:text-lg"
      : "px-6 py-3.5 text-sm md:text-base";
  return (
    <motion.button
      onClick={() => {
        haptic("light");
        onClick?.();
      }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight ${base} ${
        variant === "primary"
          ? "text-white shadow-[0_10px_40px_-12px_rgba(53,91,69,0.45)]"
          : "text-[#355B45] bg-white/60 backdrop-blur border border-[#8FBF7F]/30"
      }`}
      style={
        variant === "primary"
          ? {
              background:
                "linear-gradient(135deg, #8FBF7F 0%, #6FA968 50%, #355B45 100%)",
            }
          : undefined
      }
    >
      {variant === "primary" && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 0 0 rgba(143,191,127,0.45)" }}
          animate={{ boxShadow: ["0 0 0 0 rgba(143,191,127,0.5)", "0 0 0 16px rgba(143,191,127,0)"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

/* ---------- GLASS CARD ---------- */
const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...rest }) => (
  <div
    className={`rounded-3xl border border-white/60 shadow-[0_8px_40px_-12px_rgba(53,91,69,0.18)] ${className}`}
    style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
    {...rest}
  >
    {children}
  </div>
);

/* ---------- HERO ---------- */
const Hero = ({ onStart }: { onStart: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0.4]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 pt-16 pb-12 text-center">
      <motion.div style={{ y: yImg }} className="relative w-full max-w-[340px] mx-auto mb-2">
        <motion.img
          src={chameleonFrame}
          alt="Kidzz — companheiro emocional"
          className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(53,91,69,0.18)]"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          loading="eager"
        />
      </motion.div>

      <motion.div style={{ opacity: opacityText }} className="max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-[28px] leading-[1.12] md:text-5xl font-semibold tracking-tight text-[#2E2E2E]"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Seu filho está pedindo conexão…
          <span className="block text-[#355B45] mt-2">e o mundo entrega telas.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-5 text-[15px] md:text-lg text-[#2E2E2E]/70 leading-relaxed max-w-md mx-auto"
        >
          Em 60 segundos, descubra o que pode estar afetando emocionalmente a rotina da sua família.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <PremiumCTA onClick={onStart}>
            Fazer o teste agora <ArrowRight size={18} />
          </PremiumCTA>
          <p className="text-xs text-[#2E2E2E]/55 font-medium">Mais de 10.000 famílias já fizeram.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="fill-[#8FBF7F] text-[#8FBF7F]" />
            ))}
            <span className="ml-2 text-xs text-[#2E2E2E]/65 font-medium">4,9 média das famílias</span>
          </div>
          <p className="text-xs italic text-[#2E2E2E]/55 max-w-xs">
            "Parece que alguém finalmente entendeu a vida real com filhos."
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ---------- IDENTIFICAÇÃO ---------- */
const truths = [
  "Seu filho não quer mais tela. Ele quer presença.",
  "Birras constantes nem sempre são 'falta de limite'.",
  "Muitos pais estão emocionalmente exaustos — e se culpando por isso.",
  "A tecnologia ocupou o espaço das conexões pequenas.",
];

const Identification = () => (
  <section className="px-5 py-24 md:py-32">
    <div className="max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="text-center text-[26px] md:text-4xl font-semibold tracking-tight text-[#2E2E2E] mb-12"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        A verdade que quase ninguém fala.
      </motion.h2>

      <div className="space-y-4">
        {truths.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
          >
            <GlassCard className="px-6 py-6 md:px-8 md:py-7">
              <p className="text-[16px] md:text-lg text-[#2E2E2E] leading-relaxed font-medium">
                {t}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- BLOCO TESTE ---------- */
const TestBlock = ({ onStart }: { onStart: () => void }) => (
  <section className="px-5 py-24 md:py-32">
    <div className="max-w-3xl mx-auto">
      <GlassCard className="px-6 py-10 md:p-14">
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
          <motion.img
            src={chameleonFrame}
            alt=""
            className="w-full max-w-[220px] mx-auto md:max-w-none object-contain"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#355B45]/70 font-semibold mb-3">
              60 segundos
            </p>
            <h3
              className="text-[24px] md:text-3xl font-semibold tracking-tight text-[#2E2E2E] mb-4"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              O teste emocional da rotina familiar.
            </h3>
            <p className="text-[15px] text-[#2E2E2E]/75 leading-relaxed mb-6">
              Uma experiência rápida para identificar sobrecarga, excesso de estímulo,
              desconexão e oportunidades reais de conexão.
            </p>

            <div className="space-y-3 mb-7">
              {[
                "Responda perguntas rápidas",
                "Descubra o perfil emocional da sua rotina",
                "Receba uma experiência personalizada no Kidzz",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-[#8FBF7F]/20 text-[#355B45] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#2E2E2E]/80">{s}</p>
                </div>
              ))}
            </div>

            <PremiumCTA onClick={onStart}>
              Começar meu teste <Sparkles size={16} />
            </PremiumCTA>
          </div>
        </div>
      </GlassCard>
    </div>
  </section>
);

/* ---------- QUIZ (Fullscreen) ---------- */
type QuizAnswer = "rare" | "sometimes" | "often";
const QUESTIONS: { q: string; options: { label: string; value: QuizAnswer; weight: number }[] }[] = [
  {
    q: "Seu filho consegue ficar entediado sem tela?",
    options: [
      { label: "Quase sempre", value: "rare", weight: 0 },
      { label: "Às vezes", value: "sometimes", weight: 1 },
      { label: "Raramente", value: "often", weight: 2 },
    ],
  },
  {
    q: "Como costuma ser o momento antes de dormir?",
    options: [
      { label: "Calmo e conectado", value: "rare", weight: 0 },
      { label: "Agitado em alguns dias", value: "sometimes", weight: 1 },
      { label: "Difícil quase todo dia", value: "often", weight: 2 },
    ],
  },
  {
    q: "Você sente que está emocionalmente cansado?",
    options: [
      { label: "Pouco", value: "rare", weight: 0 },
      { label: "Algumas semanas sim", value: "sometimes", weight: 1 },
      { label: "Frequentemente", value: "often", weight: 2 },
    ],
  },
  {
    q: "Quantos minutos por dia vocês têm de presença real (sem tela)?",
    options: [
      { label: "Mais de 60 min", value: "rare", weight: 0 },
      { label: "Entre 20 e 60 min", value: "sometimes", weight: 1 },
      { label: "Menos de 20 min", value: "often", weight: 2 },
    ],
  },
  {
    q: "As birras estão mais frequentes nas últimas semanas?",
    options: [
      { label: "Não", value: "rare", weight: 0 },
      { label: "Um pouco mais", value: "sometimes", weight: 1 },
      { label: "Sim, bastante", value: "often", weight: 2 },
    ],
  },
];

const QuizExperience = ({ onClose, onFinish }: { onClose: () => void; onFinish: (score: number) => void }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const progress = ((idx) / QUESTIONS.length) * 100;

  const pick = (w: number) => {
    haptic("medium");
    const next = score + w;
    setScore(next);
    if (idx + 1 >= QUESTIONS.length) {
      setTimeout(() => onFinish(next), 350);
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ background: "#F7F6F2" }}
    >
      <AtmosphericBackground />
      {/* Top bar */}
      <div className="relative px-5 pt-[max(env(safe-area-inset-top),16px)] pb-4 flex items-center gap-3">
        <button
          onClick={() => { haptic("light"); onClose(); }}
          className="text-sm text-[#2E2E2E]/60 font-medium"
        >
          Fechar
        </button>
        <div className="flex-1 h-1 rounded-full bg-[#355B45]/10 overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg,#8FBF7F,#355B45)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-[#2E2E2E]/55 tabular-nums">
          {idx + 1}/{QUESTIONS.length}
        </span>
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-6 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#355B45]/70 font-semibold mb-4">
              Pergunta {idx + 1}
            </p>
            <h2
              className="text-[26px] md:text-4xl font-semibold leading-[1.15] tracking-tight text-[#2E2E2E] mb-10"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {QUESTIONS[idx].q}
            </h2>
            <div className="space-y-3">
              {QUESTIONS[idx].options.map((opt) => (
                <motion.button
                  key={opt.label}
                  onClick={() => pick(opt.weight)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left rounded-2xl px-5 py-5 border border-white/70 text-[15px] text-[#2E2E2E] font-medium transition-all hover:border-[#8FBF7F]/60 hover:bg-white/80"
                  style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)" }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ---------- RESULTADO ---------- */
const Result = ({ score, onClose }: { score: number; onClose: () => void }) => {
  const max = QUESTIONS.length * 2;
  const pct = score / max;
  const profile = useMemo(() => {
    if (pct < 0.34)
      return {
        title: "Sua família já respira presença.",
        sub: "Pequenos ajustes podem aprofundar ainda mais essa conexão.",
        tips: ["Rituais leves antes de dormir", "Perguntas mágicas semanais", "Momentos sem tela aos finais de semana"],
      };
    if (pct < 0.67)
      return {
        title: "Sua família não precisa de mais conteúdo. Precisa de mais respiros.",
        sub: "Há sinais de sobrecarga emocional invisível na rotina.",
        tips: ["SOS emocional nos picos de birra", "Sleep ritual nas próximas 3 noites", "10 minutos de presença real por dia"],
      };
    return {
      title: "A rotina está pedindo pausa.",
      sub: "O cansaço acumulado e o excesso de tela estão pesando — e isso tem solução leve.",
      tips: ["Wellness diário (3 min)", "Ritual de desaceleração antes de dormir", "Perguntas mágicas para reconectar"],
    };
  }, [pct]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#F7F6F2" }}>
      <AtmosphericBackground />
      <div className="relative max-w-xl mx-auto px-6 pt-[max(env(safe-area-inset-top),24px)] pb-16">
        <button onClick={onClose} className="text-sm text-[#2E2E2E]/60 font-medium mb-6">
          Fechar
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <img src={chameleonFrame} alt="" className="w-48 h-auto mx-auto object-contain mb-2" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#355B45]/70 font-semibold mb-3">
            Seu diagnóstico emocional
          </p>
          <h2
            className="text-[28px] md:text-4xl font-semibold tracking-tight text-[#2E2E2E] leading-tight mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {profile.title}
          </h2>
          <p className="text-[15px] text-[#2E2E2E]/75 leading-relaxed max-w-md mx-auto mb-10">
            {profile.sub}
          </p>
        </motion.div>

        <GlassCard className="p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#355B45]/70 font-semibold mb-4">
            Sugestões leves para esta semana
          </p>
          <div className="space-y-3">
            {profile.tips.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#8FBF7F]/25 text-[#355B45] flex items-center justify-center flex-shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <p className="text-[15px] text-[#2E2E2E]/85">{t}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Preview features */}
        <p className="text-xs uppercase tracking-[0.18em] text-[#355B45]/70 font-semibold mb-4 text-center">
          O que o Kidzz oferece
        </p>
        <div className="grid grid-cols-2 gap-3 mb-10">
          {[
            { icon: Heart, label: "SOS emocional" },
            { icon: Sparkles, label: "Perguntas mágicas" },
            { icon: Moon, label: "Sleep ritual" },
            { icon: Leaf, label: "Wellness diário" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
            >
              <GlassCard className="px-4 py-5 flex flex-col items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(143,191,127,0.18)" }}>
                  <Icon size={16} className="text-[#355B45]" />
                </div>
                <p className="text-[13px] font-semibold text-[#2E2E2E]">{label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <PremiumCTA onClick={() => { window.location.href = APP_URL; }}>
            Entrar no Kidzz agora <Heart size={16} className="fill-white" />
          </PremiumCTA>
          <p className="text-xs text-[#2E2E2E]/55">Menos caos. Mais conexão.</p>
        </div>
      </div>
    </div>
  );
};

/* ---------- QUIZ PREVIEW SECTION ---------- */
const QuizPreview = () => (
  <section className="px-5 py-24 md:py-28">
    <div className="max-w-xl mx-auto">
      <motion.h3
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center text-[22px] md:text-3xl font-semibold tracking-tight text-[#2E2E2E] mb-10"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        Algumas perguntas que você vai responder.
      </motion.h3>
      <div className="space-y-4">
        {QUESTIONS.slice(0, 3).map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <GlassCard className="px-6 py-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#8FBF7F]/20 text-[#355B45] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-[15px] text-[#2E2E2E] font-medium">{q.q}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- FINAL CTA ---------- */
const FinalCTA = ({ onStart }: { onStart: () => void }) => (
  <section className="px-5 pt-16 pb-28 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-md mx-auto"
    >
      <h3
        className="text-[26px] md:text-4xl font-semibold tracking-tight text-[#2E2E2E] mb-4"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        Comece pelos 60 segundos.
      </h3>
      <p className="text-[15px] text-[#2E2E2E]/70 mb-8 leading-relaxed">
        Sem cadastro. Sem pressa. Só uma conversa silenciosa com a sua rotina.
      </p>
      <PremiumCTA onClick={onStart}>
        Começar meu teste <ArrowRight size={18} />
      </PremiumCTA>
    </motion.div>
  </section>
);

/* ---------- PAGE ---------- */
const LandingQuiz = () => {
  const [phase, setPhase] = useState<"landing" | "quiz" | "result">("landing");
  const [score, setScore] = useState(0);

  // Inject Instrument Serif once
  useEffect(() => {
    const id = "lp-instrument-serif";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap";
    document.head.appendChild(link);
  }, []);

  // SEO
  useEffect(() => {
    document.title = "Kidzz — Teste emocional da rotina familiar (60s)";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "Em 60 segundos, descubra o que pode estar afetando emocionalmente a rotina da sua família. Teste gratuito do Kidzz.");
  }, []);

  const start = () => { haptic("medium"); setPhase("quiz"); };

  return (
    <div className="relative min-h-screen text-[#2E2E2E] overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <AtmosphericBackground />
      <Hero onStart={start} />
      <Identification />
      <TestBlock onStart={start} />
      <QuizPreview />
      <FinalCTA onStart={start} />

      <footer className="px-5 pb-10 text-center">
        <p className="text-xs text-[#2E2E2E]/40">© {new Date().getFullYear()} Kidzz — Menos caos. Mais conexão.</p>
      </footer>

      <AnimatePresence>
        {phase === "quiz" && (
          <QuizExperience
            key="quiz"
            onClose={() => setPhase("landing")}
            onFinish={(s) => { setScore(s); setPhase("result"); }}
          />
        )}
        {phase === "result" && (
          <Result key="result" score={score} onClose={() => setPhase("landing")} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingQuiz;
