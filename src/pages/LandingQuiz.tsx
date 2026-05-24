import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Moon,
  Leaf,
  Check,
  Heart as HeartIcon,
  Wind,
  BookOpen,
  Gamepad2,
  Plane,
  Headphones,
} from "lucide-react";
import chameleonFrame from "@/assets/lp-chameleon-frame.png";
import premiumBgReference from "@/assets/reference/premium-bg-reference.webp";
import { haptic } from "@/lib/haptics";

const APP_URL = "https://kidzzapp.lovable.app";

/* ============================================================
   TOKENS
   ============================================================ */
const C = {
  bg: "#F7F6F2",
  off: "#FDFCF8",
  green: "#8FBF7F",
  greenDark: "#355B45",
  ink: "#2E2E2E",
};
const SERIF = '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/* ============================================================
   BACKGROUND — CSS-only, zero JS animation, no scroll jank
   ============================================================ */
const QuietBackground = () => (
  <div
    aria-hidden
    className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
    style={{
      background: `
        linear-gradient(180deg, rgba(247,246,242,0.08) 0%, rgba(247,246,242,0.72) 48%, ${C.bg} 100%),
        url(${premiumBgReference}) top center / min(100%, 1024px) auto no-repeat,
        ${C.bg}
      `,
    }}
  />
);

/* ============================================================
   PREMIUM CTA
   ============================================================ */
const CTA = ({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) => {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={() => {
        haptic("light");
        onClick?.();
      }}
      className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-[15px] md:text-base transition-all duration-300 active:scale-[0.98] will-change-transform"
      style={
        isPrimary
          ? {
              color: "#fff",
              background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenDark} 100%)`,
              boxShadow: "0 8px 28px -8px rgba(53,91,69,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
            }
          : {
              color: C.greenDark,
              background: "rgba(255,255,255,0.88)",
              border: `1px solid rgba(53,91,69,0.18)`,
            }
      }
    >
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)",
        }}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
};

/* ============================================================
   GLASS CARD
   ============================================================ */
const Glass = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: "rgba(255,255,255,0.62)",
      border: "1px solid rgba(255,255,255,0.85)",
      boxShadow: "0 10px 26px -18px rgba(46,46,46,0.18)",
    }}
  >
    {children}
  </div>
);

/* ============================================================
   FADE-IN UTILITY (viewport once)
   ============================================================ */
const FadeIn = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) => (
  <div className={className}>
    {children}
  </div>
);

/* ============================================================
   HERO
   ============================================================ */
const Hero = ({ onStart }: { onStart: () => void }) => (
  <section className="relative px-5 pt-[max(env(safe-area-inset-top),28px)] pb-16 md:pb-24">
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-[230px] md:w-[300px]"
      >
        <motion.img
          src={chameleonFrame}
          alt="Kidzz — companheiro emocional"
          className="w-full h-auto object-contain drop-shadow-[0_24px_40px_rgba(53,91,69,0.18)]"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          loading="eager"
          decoding="async"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-[30px] leading-[1.1] md:text-[54px] md:leading-[1.05] font-semibold"
        style={{ fontFamily: SERIF, color: C.ink }}
      >
        Seu filho faz perguntas.
        <span className="block" style={{ color: C.greenDark }}>
          O Kidzz transforma isso em conexão.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3 }}
        className="mt-5 text-[15.5px] md:text-lg leading-relaxed max-w-md mx-auto"
        style={{ color: `${C.ink}B3` }}
      >
        Experiências emocionais, histórias, brincadeiras e bem-estar para famílias modernas.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="mt-9 flex flex-col items-center gap-3"
      >
        <CTA onClick={onStart}>
          Fazer o teste de 60 segundos
          <Sparkles size={16} />
        </CTA>
        <p className="text-xs font-medium" style={{ color: `${C.ink}80` }}>
          Mais de 10.000 famílias já fizeram.
        </p>
      </motion.div>
    </div>
  </section>
);

/* ============================================================
   QUIZ PREVIEW
   ============================================================ */
const PreviewQuestions = [
  "Como estão as noites aí?",
  "Seu filho desacelera fácil?",
  "Como está o nível de conexão da família?",
  "O que mais pesa hoje na rotina?",
];

const QuizSection = ({ onStart }: { onStart: () => void }) => (
  <section className="px-5 py-20 md:py-28">
    <div className="max-w-2xl mx-auto text-center">
      <FadeIn>
        <p
          className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4"
          style={{ color: `${C.greenDark}B0` }}
        >
          60 segundos
        </p>
        <h2
          className="text-[26px] md:text-[42px] leading-[1.12] font-semibold"
          style={{ fontFamily: SERIF, color: C.ink }}
        >
          Descubra o perfil emocional da sua família.
        </h2>
        <p className="mt-5 text-[15px] md:text-base leading-relaxed max-w-md mx-auto" style={{ color: `${C.ink}AA` }}>
          O Kidzz analisa sua rotina e mostra experiências perfeitas para o momento da sua casa.
        </p>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-10">
        <Glass className="p-5 md:p-7 text-left">
          <div className="space-y-3">
            {PreviewQuestions.map((q, i) => (
              <div
                key={q}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl"
                style={{
                  background: i === 0 ? "rgba(143,191,127,0.10)" : "transparent",
                  border: i === 0 ? "1px solid rgba(143,191,127,0.25)" : "1px solid rgba(46,46,46,0.06)",
                }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                  style={{ background: "rgba(143,191,127,0.18)", color: C.greenDark }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[14.5px] font-medium" style={{ color: C.ink }}>
                  {q}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["Família Exploradora", "Família Conectada", "Família Sobrecarregada", "Modo Sobrevivência"].map(
              (p) => (
                <div
                  key={p}
                  className="text-[11px] md:text-xs font-medium text-center px-3 py-2 rounded-full"
                  style={{
                    background: "rgba(53,91,69,0.06)",
                    color: C.greenDark,
                  }}
                >
                  {p}
                </div>
              )
            )}
          </div>
        </Glass>
      </FadeIn>

      <FadeIn delay={0.3} className="mt-8 flex justify-center">
        <CTA onClick={onStart}>
          Começar meu teste
          <ArrowRight size={16} />
        </CTA>
      </FadeIn>
    </div>
  </section>
);

/* ============================================================
   "VOCÊ NÃO ESTÁ SOZINHO"
   ============================================================ */
const PAINS = [
  "Meu filho não larga a tela.",
  "A hora de dormir virou batalha.",
  "Estamos juntos, mas desconectados.",
  "Não sei mais como acalmar.",
];

const PainSection = () => (
  <section className="px-5 py-20 md:py-28">
    <div className="max-w-2xl mx-auto">
      <FadeIn className="text-center mb-12">
        <h2
          className="text-[26px] md:text-[42px] leading-[1.12] font-semibold"
          style={{ fontFamily: SERIF, color: C.ink }}
        >
          Você não está sozinho.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed max-w-md mx-auto" style={{ color: `${C.ink}A0` }}>
          Frases que ouvimos todos os dias de famílias reais.
        </p>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-3">
        {PAINS.map((p, i) => (
          <FadeIn key={p} delay={i * 0.06}>
            <Glass className="px-6 py-6 h-full">
              <p
                className="text-[16px] md:text-[17px] leading-snug"
                style={{ fontFamily: SERIF, color: C.ink }}
              >
                “{p}”
              </p>
            </Glass>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3} className="mt-10 text-center">
        <p className="text-[15px] md:text-base leading-relaxed max-w-md mx-auto" style={{ color: `${C.ink}A8` }}>
          O Kidzz não promete mágica. Ele cria pequenos respiros emocionais
          que devolvem o que a rotina tirou: <em style={{ color: C.greenDark }}>presença</em>.
        </p>
      </FadeIn>
    </div>
  </section>
);

/* ============================================================
   EXPERIÊNCIAS
   ============================================================ */
const EXPERIENCES = [
  {
    icon: HeartIcon,
    title: "SOS emocional",
    desc: "Um respiro guiado para os picos de birra e crise — em segundos.",
  },
  {
    icon: Moon,
    title: "Sleep Ritual",
    desc: "Histórias e sons que desaceleram a casa antes de dormir.",
  },
  {
    icon: BookOpen,
    title: "Histórias personalizadas",
    desc: "Narrativas únicas com o nome e a fase do seu filho.",
  },
  {
    icon: Wind,
    title: "Wellness diário",
    desc: "Pausas curtas para reconectar pais e filhos em 3 minutos.",
  },
  {
    icon: Gamepad2,
    title: "Brincadeiras sem tela",
    desc: "Atividades simples para virar o jogo da rotina.",
  },
  {
    icon: Headphones,
    title: "Soundscapes",
    desc: "Paisagens sonoras que acalmam o ambiente da casa.",
  },
  {
    icon: Plane,
    title: "Modo viagem",
    desc: "Companhia leve para estradas, esperas e voos longos.",
  },
];

const Experiences = () => (
  <section className="px-5 py-20 md:py-28">
    <div className="max-w-3xl mx-auto">
      <FadeIn className="text-center mb-12">
        <p
          className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
          style={{ color: `${C.greenDark}B0` }}
        >
          Experiências
        </p>
        <h2
          className="text-[26px] md:text-[42px] leading-[1.12] font-semibold"
          style={{ fontFamily: SERIF, color: C.ink }}
        >
          Tecnologia invisível.
          <span className="block" style={{ color: C.greenDark }}>
            Conexão real.
          </span>
        </h2>
      </FadeIn>

      <div className="space-y-3 md:space-y-4">
        {EXPERIENCES.map(({ icon: Icon, title, desc }, i) => (
          <FadeIn key={title} delay={i * 0.05}>
            <Glass className="px-5 py-5 md:px-7 md:py-6 flex items-center gap-4 md:gap-6">
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(180deg, rgba(143,191,127,0.22), rgba(53,91,69,0.10))",
                  border: "1px solid rgba(143,191,127,0.25)",
                }}
              >
                <Icon size={20} style={{ color: C.greenDark }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] md:text-[18px] font-semibold mb-0.5" style={{ color: C.ink }}>
                  {title}
                </h3>
                <p className="text-[13.5px] md:text-sm leading-snug" style={{ color: `${C.ink}A0` }}>
                  {desc}
                </p>
              </div>
            </Glass>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ============================================================
   WELLNESS (dark green cinematic)
   ============================================================ */
const Wellness = () => (
  <section className="relative px-5 py-24 md:py-32 mt-6">
    <div
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(60% 60% at 50% 30%, rgba(143,191,127,0.18) 0%, transparent 70%),
          linear-gradient(180deg, #1e3a2d 0%, #14241c 100%)
        `,
      }}
    />
    <div className="max-w-2xl mx-auto text-center text-white">
      <FadeIn>
        <p
          className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
          style={{ color: "rgba(143,191,127,0.85)" }}
        >
          Wellness premium
        </p>
        <h2
          className="text-[28px] md:text-[44px] leading-[1.1] font-semibold"
          style={{ fontFamily: SERIF }}
        >
          Um silêncio que a casa estava esperando.
        </h2>
        <p className="mt-5 text-[15px] md:text-base leading-relaxed max-w-md mx-auto text-white/75">
          Respiração guiada, sleep ritual, sons da natureza e pausas curtas —
          desenhadas para desacelerar pais e filhos juntos.
        </p>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-10 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {[
          { icon: Wind, label: "Respiração guiada" },
          { icon: Moon, label: "Sleep ritual" },
          { icon: Leaf, label: "Sons da natureza" },
          { icon: HeartIcon, label: "Pausas rápidas" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-2xl px-4 py-5 flex flex-col items-start gap-3 text-left"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(143,191,127,0.18)" }}
            >
              <Icon size={16} style={{ color: "#cfe9c3" }} />
            </div>
            <p className="text-[13.5px] font-semibold text-white/90">{label}</p>
          </div>
        ))}
      </FadeIn>
    </div>
  </section>
);

/* ============================================================
   SOCIAL PROOF
   ============================================================ */
const TESTIMONIALS = [
  "Finalmente uma experiência que acalma a casa.",
  "Meu filho pede o Kidzz toda noite.",
  "A sensação é de paz.",
];

const SocialProof = () => (
  <section className="px-5 py-20 md:py-28">
    <div className="max-w-3xl mx-auto text-center">
      <FadeIn>
        <p
          className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
          style={{ color: `${C.greenDark}B0` }}
        >
          + 10.000 famílias
        </p>
        <h2
          className="text-[24px] md:text-[36px] leading-[1.15] font-semibold max-w-xl mx-auto"
          style={{ fontFamily: SERIF, color: C.ink }}
        >
          O que estão sentindo com o Kidzz.
        </h2>
      </FadeIn>

      <div className="mt-10 grid md:grid-cols-3 gap-3 md:gap-4">
        {TESTIMONIALS.map((t, i) => (
          <FadeIn key={t} delay={i * 0.08}>
            <Glass className="px-6 py-7 h-full text-left">
              <p
                className="text-[16.5px] leading-snug"
                style={{ fontFamily: SERIF, color: C.ink }}
              >
                “{t}”
              </p>
            </Glass>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ============================================================
   FINAL CTA — cinematic dark
   ============================================================ */
const FinalCTA = ({ onStart }: { onStart: () => void }) => (
  <section className="relative px-5 py-24 md:py-32 mt-6">
    <div
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(60% 60% at 50% 0%, rgba(143,191,127,0.20) 0%, transparent 70%),
          linear-gradient(180deg, #1a2e23 0%, #0f1a14 100%)
        `,
      }}
    />
    <div className="max-w-xl mx-auto text-center text-white">
      <FadeIn>
        <img
          src={chameleonFrame}
          alt=""
          className="w-32 md:w-40 h-auto mx-auto mb-6 opacity-95 drop-shadow-[0_18px_30px_rgba(0,0,0,0.4)]"
          loading="lazy"
          decoding="async"
        />
        <h2
          className="text-[32px] md:text-[48px] leading-[1.05] font-semibold"
          style={{ fontFamily: SERIF }}
        >
          Menos caos.
          <span className="block" style={{ color: "#cfe9c3" }}>
            Mais conexão.
          </span>
        </h2>
        <p className="mt-5 text-[15px] md:text-base leading-relaxed text-white/75 max-w-sm mx-auto">
          Comece agora o teste de 60 segundos. Sem cadastro. Sem pressa.
        </p>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-9 flex flex-col items-center gap-3">
        <CTA onClick={onStart}>
          Entrar no Kidzz
          <Sparkles size={16} />
        </CTA>
        <p className="text-xs text-white/55">Gratuito • Sem anúncios</p>
      </FadeIn>
    </div>
  </section>
);

/* ============================================================
   QUIZ EXPERIENCE
   ============================================================ */
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

const QuizExperience = ({
  onClose,
  onFinish,
}: {
  onClose: () => void;
  onFinish: (score: number) => void;
}) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const progress = (idx / QUESTIONS.length) * 100;

  const pick = (w: number) => {
    haptic("medium");
    const next = score + w;
    setScore(next);
    if (idx + 1 >= QUESTIONS.length) setTimeout(() => onFinish(next), 280);
    else setIdx((i) => i + 1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: C.bg }}
    >
      <QuietBackground />
      <div className="relative px-5 pt-[max(env(safe-area-inset-top),16px)] pb-4 flex items-center gap-3">
        <button
          onClick={() => { haptic("light"); onClose(); }}
          className="text-sm font-medium"
          style={{ color: `${C.ink}90` }}
        >
          Fechar
        </button>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(53,91,69,0.10)" }}>
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${C.green}, ${C.greenDark})` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs tabular-nums" style={{ color: `${C.ink}80` }}>
          {idx + 1}/{QUESTIONS.length}
        </span>
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-6 max-w-xl mx-auto w-full pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4"
              style={{ color: `${C.greenDark}B0` }}
            >
              Pergunta {idx + 1}
            </p>
            <h2
              className="text-[26px] md:text-4xl font-semibold leading-[1.15] mb-10"
              style={{ fontFamily: SERIF, color: C.ink }}
            >
              {QUESTIONS[idx].q}
            </h2>
            <div className="space-y-3">
              {QUESTIONS[idx].options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => pick(opt.weight)}
                  className="w-full text-left rounded-2xl px-5 py-5 text-[15px] font-medium transition-all active:scale-[0.99]"
                  style={{
                    color: C.ink,
                    background: "rgba(255,255,255,0.88)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 6px 20px -12px rgba(46,46,46,0.18)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ============================================================
   RESULT
   ============================================================ */
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
        title: "Sua família precisa de mais respiros.",
        sub: "Há sinais de sobrecarga emocional invisível na rotina.",
        tips: ["SOS emocional nos picos de birra", "Sleep ritual nas próximas 3 noites", "10 min de presença real por dia"],
      };
    return {
      title: "A rotina está pedindo pausa.",
      sub: "O cansaço acumulado e o excesso de tela estão pesando — e isso tem solução leve.",
      tips: ["Wellness diário (3 min)", "Ritual de desaceleração antes de dormir", "Perguntas mágicas para reconectar"],
    };
  }, [pct]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: C.bg }}>
      <QuietBackground />
      <div className="relative max-w-xl mx-auto px-6 pt-[max(env(safe-area-inset-top),24px)] pb-16">
        <button onClick={onClose} className="text-sm font-medium" style={{ color: `${C.ink}90` }}>
          Fechar
        </button>

        <div className="text-center mt-6">
          <img src={chameleonFrame} alt="" className="w-44 h-auto mx-auto object-contain mb-2" loading="lazy" />
          <p
            className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
            style={{ color: `${C.greenDark}B0` }}
          >
            Seu diagnóstico emocional
          </p>
          <h2
            className="text-[28px] md:text-4xl font-semibold leading-tight mb-4"
            style={{ fontFamily: SERIF, color: C.ink }}
          >
            {profile.title}
          </h2>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto mb-10" style={{ color: `${C.ink}AA` }}>
            {profile.sub}
          </p>
        </div>

        <Glass className="p-6 md:p-8 mb-8">
          <p
            className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4"
            style={{ color: `${C.greenDark}B0` }}
          >
            Sugestões leves para esta semana
          </p>
          <div className="space-y-3">
            {profile.tips.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(143,191,127,0.25)", color: C.greenDark }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <p className="text-[15px]" style={{ color: `${C.ink}D0` }}>{t}</p>
              </div>
            ))}
          </div>
        </Glass>

        <div className="flex flex-col items-center gap-3">
          <CTA onClick={() => { window.location.href = APP_URL; }}>
            Entrar no Kidzz agora <Heart size={16} className="fill-white" />
          </CTA>
          <p className="text-xs" style={{ color: `${C.ink}80` }}>Menos caos. Mais conexão.</p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PAGE
   ============================================================ */
const LandingQuiz = () => {
  const [phase, setPhase] = useState<"landing" | "quiz" | "result">("landing");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const id = "lp-instrument-serif";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    document.title = "Kidzz — Conexão emocional para famílias modernas";
    const meta =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute(
      "content",
      "Seu filho faz perguntas. O Kidzz transforma em conexão. Faça o teste emocional de 60 segundos e descubra experiências personalizadas para sua família."
    );
  }, []);

  const start = () => {
    haptic("medium");
    setPhase("quiz");
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", color: C.ink, background: C.bg }}
    >
      <QuietBackground />
      <Hero onStart={start} />
      <QuizSection onStart={start} />
      <PainSection />
      <Experiences />
      <Wellness />
      <SocialProof />
      <FinalCTA onStart={start} />

      <footer className="px-5 pb-10 pt-4 text-center">
        <p className="text-xs" style={{ color: `${C.ink}60` }}>
          © {new Date().getFullYear()} Kidzz — Menos caos. Mais conexão.
        </p>
      </footer>

      <AnimatePresence>
        {phase === "quiz" && (
          <QuizExperience
            key="quiz"
            onClose={() => setPhase("landing")}
            onFinish={(s) => {
              setScore(s);
              setPhase("result");
            }}
          />
        )}
        {phase === "result" && <Result key="result" score={score} onClose={() => setPhase("landing")} />}
      </AnimatePresence>
    </div>
  );
};

export default LandingQuiz;
