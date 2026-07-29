import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import forestBg from "@/assets/lp/forest-cinematic.jpg";
import jarImg from "@/assets/lp/gratitude-jar.jpg";
import handsImg from "@/assets/lp/hands-forest.jpg";
import family1 from "@/assets/lp/family-1.jpg";
import family2 from "@/assets/lp/family-2.jpg";
import chameleonAsset from "@/assets/lp/chameleon-hero.png.asset.json";
import logoAsset from "@/assets/lp/kidzz-glass-logo.jpeg.asset.json";

const CHAMELEON = chameleonAsset.url;
const LOGO = logoAsset.url;

const SERIF = "'Fraunces', 'Lora', Georgia, serif";
const SANS =
  "'Mulish', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

const APP_URL = "/";

/* ─────────────────────────  atoms  ───────────────────────── */

function Particles({ count = 18, tint = "255,240,200" }: { count?: number; tint?: string }) {
  const reduce = useReducedMotion();
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        top: (i * 61) % 100,
        size: 2 + ((i * 13) % 5),
        dur: 9 + ((i * 7) % 11),
        delay: (i * 1.3) % 8,
      })),
    [count],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: `rgba(${tint},0.9)`,
            boxShadow: `0 0 ${s.size * 4}px rgba(${tint},0.55)`,
          }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.85, 0], x: [0, 12, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SunRays() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "conic-gradient(from 200deg at 72% -10%, rgba(255,236,180,0) 0deg, rgba(255,238,190,0.28) 18deg, rgba(255,236,180,0) 36deg, rgba(255,240,200,0.20) 54deg, rgba(255,236,180,0) 76deg)",
        mixBlendMode: "screen",
      }}
      animate={reduce ? undefined : { opacity: [0.55, 0.95, 0.55] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const glass: React.CSSProperties = {
  background:
    "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))",
  backdropFilter: "blur(34px) saturate(150%)",
  WebkitBackdropFilter: "blur(34px) saturate(150%)",
  border: "0.5px solid rgba(255,255,255,0.75)",
  boxShadow:
    "0 30px 70px -40px rgba(30,48,36,0.45), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const glassDark: React.CSSProperties = {
  background:
    "linear-gradient(150deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
  backdropFilter: "blur(34px) saturate(150%)",
  WebkitBackdropFilter: "blur(34px) saturate(150%)",
  border: "0.5px solid rgba(255,255,255,0.28)",
  boxShadow: "0 40px 90px -50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.35)",
};

function GlassLogo({ size = 220, className = "" }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size * 0.34 }}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      aria-label="KIDZZ"
      role="img"
    >
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          letterSpacing: "0.34em",
          fontSize: size * 0.19,
          paddingLeft: "0.34em",
          color: "transparent",
          backgroundImage: `url(${LOGO})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          filter: "brightness(1.35) saturate(1.1) drop-shadow(0 6px 24px rgba(255,240,190,0.5))",
        }}
      >
        KIDZZ
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          letterSpacing: "0.34em",
          fontSize: size * 0.19,
          paddingLeft: "0.34em",
          color: "rgba(255,255,255,0.22)",
          textShadow:
            "0 1px 0 rgba(255,255,255,0.85), 0 0 34px rgba(255,238,190,0.55), 0 16px 40px rgba(20,40,28,0.35)",
        }}
      >
        KIDZZ
      </span>
    </motion.div>
  );
}

/* ─────────────────────────  iPhone mockup  ───────────────────────── */

function Phone({
  children,
  className = "",
  float = true,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  float?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`relative ${className}`}
      animate={reduce || !float ? undefined : { y: [0, -14, 0], rotate: [-0.4, 0.4, -0.4] }}
      transition={{ duration: 9, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="relative mx-auto w-[240px] sm:w-[268px] rounded-[46px] p-[10px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(232,236,230,0.65))",
          boxShadow:
            "0 60px 120px -50px rgba(24,44,32,0.55), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 0.5px rgba(255,255,255,0.7)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[38px]"
          style={{
            background: "linear-gradient(180deg,#FBFAF6 0%,#F1F4EE 100%)",
            aspectRatio: "9 / 17",
          }}
        >
          <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[74px] -translate-x-1/2 rounded-full bg-[#1c231e]/85" />
          <div className="relative z-10 h-full w-full px-4 pb-5 pt-9">{children}</div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.22) 100%)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function PhoneScreen({
  eyebrow,
  title,
  lines,
  accent,
}: {
  eyebrow: string;
  title: string;
  lines: string[];
  accent: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3" style={{ fontFamily: SANS }}>
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </span>
        <span className="h-6 w-6 rounded-full" style={{ background: `${accent}22` }} />
      </div>
      <h4
        className="text-[19px] leading-[1.15] text-[#22302a]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {title}
      </h4>
      <div className="mt-1 flex flex-col gap-2">
        {lines.map((l, i) => (
          <div
            key={l}
            className="rounded-2xl px-3 py-3 text-[11px] leading-snug text-[#3b4a41]"
            style={{
              background:
                i === 0
                  ? `linear-gradient(140deg, ${accent}26, rgba(255,255,255,0.7))`
                  : "rgba(255,255,255,0.72)",
              border: "0.5px solid rgba(255,255,255,0.9)",
              boxShadow: "0 12px 24px -20px rgba(30,48,36,0.6)",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-white/70 py-2.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 rounded-full"
            style={{
              width: i === 1 ? 18 : 6,
              background: i === 1 ? accent : "rgba(60,80,68,0.22)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────  quiz data  ───────────────────────── */

const QUESTIONS = [
  {
    q: "Qual a idade do seu filho?",
    options: ["0 a 3 anos", "4 a 6 anos", "7 a 9 anos", "10 anos ou mais"],
    weights: [3, 3, 2, 2],
  },
  {
    q: "Quanto tempo vocês ficam juntos sem celular?",
    options: ["Quase nada", "Menos de 30 min", "Cerca de 1 hora", "Mais de 2 horas"],
    weights: [0, 1, 2, 3],
  },
  {
    q: "Qual seu maior desafio hoje?",
    options: ["Falta de tempo", "Telas demais", "Cansaço no fim do dia", "Não sei o que fazer junto"],
    weights: [1, 0, 1, 2],
  },
  {
    q: "Como vocês encerram o dia?",
    options: ["Cada um na sua tela", "Correria até dormir", "Conversa rápida", "Ritual de história e colo"],
    weights: [0, 1, 2, 3],
  },
];

function Quiz() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();

  const total = QUESTIONS.length;
  const progress = done ? 100 : (step / total) * 100;
  const maxScore = QUESTIONS.reduce((a, q) => a + Math.max(...q.weights), 0);
  const percent = done ? Math.round(28 + (score / maxScore) * 58) : 0;

  const answer = (w: number) => {
    setScore((s) => s + w);
    if (step + 1 >= total) setDone(true);
    else setStep((s) => s + 1);
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="rounded-[36px] p-6 sm:p-10" style={glass}>
        {!done && (
          <>
            <div className="mb-8">
              <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#2b4635]/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg,#7FBFA0,#C8A85A)",
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p
                className="mt-3 text-[12px] tracking-wide text-[#5c6b62]"
                style={{ fontFamily: SANS }}
              >
                Pergunta {step + 1} de {total}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -14, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3
                  className="text-[26px] leading-[1.15] text-[#22302a] sm:text-[34px]"
                  style={{ fontFamily: SERIF, fontWeight: 400 }}
                >
                  {QUESTIONS[step].q}
                </h3>
                <div className="mt-7 grid gap-3">
                  {QUESTIONS[step].options.map((o, i) => (
                    <button
                      key={o}
                      onClick={() => answer(QUESTIONS[step].weights[i])}
                      className="min-h-[56px] w-full rounded-3xl px-5 text-left text-[15px] text-[#2c3a33] transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        fontFamily: SANS,
                        background: "rgba(255,255,255,0.62)",
                        border: "0.5px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 18px 40px -32px rgba(30,48,36,0.7)",
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {done && <QuizResult percent={percent} />}
      </div>

      {/* chameleon walking beside the quiz */}
      <motion.img
        src={CHAMELEON}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-6 hidden w-[150px] opacity-95 sm:block"
        style={{
          filter: "drop-shadow(0 30px 40px rgba(20,40,28,0.35))",
          WebkitMaskImage:
            "radial-gradient(72% 76% at 50% 50%, #000 55%, rgba(0,0,0,0.5) 78%, transparent 96%)",
          maskImage:
            "radial-gradient(72% 76% at 50% 50%, #000 55%, rgba(0,0,0,0.5) 78%, transparent 96%)",
        }}
        animate={reduce ? undefined : { y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function QuizResult({ percent }: { percent: number }) {
  const reduce = useReducedMotion();
  const r = 76;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className="text-[11px] uppercase tracking-[0.34em] text-[#6d7c72]"
        style={{ fontFamily: SANS }}
      >
        Seu resultado
      </span>
      <div className="relative mt-6 h-[190px] w-[190px]">
        <svg viewBox="0 0 190 190" className="h-full w-full -rotate-90">
          <circle cx="95" cy="95" r={r} fill="none" stroke="rgba(43,70,53,0.10)" strokeWidth="10" />
          <motion.circle
            cx="95"
            cy="95"
            r={r}
            fill="none"
            stroke="url(#lpGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? { strokeDashoffset: c - (percent / 100) * c } : { strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (percent / 100) * c }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <defs>
            <linearGradient id="lpGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7FBFA0" />
              <stop offset="100%" stopColor="#D8B45E" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[46px] leading-none text-[#22302a]"
            style={{ fontFamily: SERIF, fontWeight: 400 }}
          >
            {percent}%
          </span>
          <span
            className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#6d7c72]"
            style={{ fontFamily: SANS }}
          >
            Conexão familiar
          </span>
        </div>
      </div>
      <p
        className="mt-7 max-w-md text-[15px] leading-relaxed text-[#4c5b52]"
        style={{ fontFamily: SANS }}
      >
        Pequenos rituais de apenas cinco minutos por dia podem transformar
        completamente essa conexão.
      </p>
      <GoldButton className="mt-8" onClick={() => (window.location.href = APP_URL)}>
        Ver minha jornada
      </GoldButton>
    </div>
  );
}

/* ─────────────────────────  buttons  ───────────────────────── */

function GoldButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative min-h-[56px] overflow-hidden rounded-full px-9 text-[15px] font-semibold text-[#2b2415] transition-transform duration-300 active:scale-[0.98] ${className}`}
      style={{
        fontFamily: SANS,
        background: "linear-gradient(135deg,#F6E3AE 0%,#E7C878 45%,#D9B45F 100%)",
        boxShadow:
          "0 26px 50px -26px rgba(160,120,40,0.65), inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  dark = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  dark?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[56px] rounded-full px-8 text-[15px] font-medium transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      style={{
        fontFamily: SANS,
        color: dark ? "rgba(255,255,255,0.92)" : "#2c3a33",
        background: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `0.5px solid ${dark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)"}`,
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────  sections data  ───────────────────────── */

const FEATURE_PHONES = [
  {
    name: "Perguntas",
    accent: "#3E7A5A",
    desc: "As perguntas impossíveis do seu filho ganham respostas que acolhem, no tempo dele.",
    screen: {
      eyebrow: "Perguntas",
      title: "Por que o céu é azul?",
      lines: [
        "A luz do sol é feita de várias cores escondidas.",
        "O azul é o mais brincalhão: espalha por todo o céu.",
        "Desafio: procurem outra coisa azul juntos.",
      ],
    },
  },
  {
    name: "Histórias",
    accent: "#B4843C",
    desc: "Histórias criadas com o nome, o mundo e as palavras favoritas da sua criança.",
    screen: {
      eyebrow: "Histórias",
      title: "Uma história só sua",
      lines: ["Personagem principal: seu filho.", "Tom: coragem e ternura.", "Duração: 6 minutos de leitura."],
    },
  },
  {
    name: "Sonhos",
    accent: "#6E6BA8",
    desc: "Um encerramento suave para o dia, com narração calma e som ambiente.",
    screen: {
      eyebrow: "Sonhos",
      title: "A floresta que dorme",
      lines: ["Narração serena, ritmo lento.", "Sons de riacho e vento.", "Luz que diminui devagar."],
    },
  },
  {
    name: "KALM",
    accent: "#417A6E",
    desc: "Bem-estar diurno da família: sentir, agradecer, respirar e cuidar de quem cuida.",
    screen: {
      eyebrow: "KALM",
      title: "Como está o seu tempo hoje?",
      lines: ["Sol, nuvem, chuva ou tempestade.", "Uma prática de 3 minutos.", "Cuidar de quem cuida também conta."],
    },
  },
  {
    name: "Brincar",
    accent: "#C1743F",
    desc: "Missões simples para sair da tela e transformar a sala em aventura.",
    screen: {
      eyebrow: "Brincar",
      title: "Caça ao tesouro em casa",
      lines: ["5 pistas, 15 minutos.", "Sem preparo, sem materiais.", "Termina em abraço."],
    },
  },
  {
    name: "Jarro da Gratidão",
    accent: "#C9A24A",
    desc: "Cada dia bonito vira uma estrela guardada. A infância inteira, colecionada.",
    screen: {
      eyebrow: "Gratidão",
      title: "O que brilhou hoje?",
      lines: ["Uma frase. Uma estrela.", "42 momentos guardados.", "Reveja quando o dia for difícil."],
    },
  },
];

const FEATURES = [
  { icon: "✦", title: "Respostas que acolhem", text: "Linguagem adaptada à idade, sem susto e sem enrolação." },
  { icon: "❋", title: "Rituais de 5 minutos", text: "Pequenos gestos diários que constroem memória afetiva." },
  { icon: "◈", title: "Ambiente seguro", text: "Conteúdo filtrado, portão dos pais e zero anúncios." },
  { icon: "❍", title: "Memórias guardadas", text: "Tudo que vocês viveram junto, salvo em um só lugar." },
  { icon: "✧", title: "Feito para offline", text: "Nasceu para desligar a tela, não para prender vocês nela." },
  { icon: "◇", title: "Voz suave", text: "Narração calma que cabe na hora de dormir." },
];

const TESTIMONIALS = [
  {
    img: family1,
    quote: "Voltamos a ter um momento só nosso antes de dormir.",
    author: "Ana, mãe do Pedro",
  },
  {
    img: family2,
    quote: "Meu filho começou a me contar coisas que eu nem sabia perguntar.",
    author: "Rafael, pai da Lis",
  },
];

/* ─────────────────────────  page  ───────────────────────── */

export default function LandingPremium() {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroBlur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(10px)"]);

  useEffect(() => {
    document.title = "KIDZZ — Desligue a tela. Ligue a infância.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Transforme cinco minutos por dia em memórias que seu filho nunca vai esquecer. Rituais, histórias e conversas que reconectam a família.",
      );
    }
  }, []);

  const goApp = () => (window.location.href = APP_URL);
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <main
      className="relative w-full overflow-x-hidden"
      style={{ background: "#FBFAF5", fontFamily: SANS, color: "#22302a" }}
    >
      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative min-h-[100svh] w-full overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : bgY }}>
          <img
            src={forestPortrait}
            alt=""
            aria-hidden
            width={1024}
            height={1536}
            className="h-[118%] w-full object-cover md:hidden"
            style={{ objectPosition: "50% 45%" }}
          />
          <img
            src={forestBg}
            alt=""
            aria-hidden
            width={1920}
            height={1280}
            className="hidden h-[118%] w-full object-cover md:block"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(252,250,244,0.62) 0%, rgba(252,250,244,0.30) 42%, rgba(252,250,244,0.95) 100%)",
            }}
          />

        </motion.div>
        <SunRays />
        <Particles count={22} />

        <motion.div
          className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center px-6 pb-24 pt-[calc(env(safe-area-inset-top)+40px)] lg:flex-row lg:items-center lg:gap-12"
          style={{ opacity: reduce ? 1 : heroFade, filter: reduce ? "none" : heroBlur }}
        >
          <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
            <GlassLogo size={240} />

            <Reveal delay={0.15} className="mt-6">
              <span
                className="inline-flex items-center rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[#3a4d42]"
                style={glass}
              >
                A primeira IA feita para reconectar famílias
              </span>
            </Reveal>

            <Reveal delay={0.25}>
              <h1
                className="mt-7 text-[clamp(2.6rem,9vw,4.6rem)] leading-[0.98] tracking-[-0.02em] text-[#1e2b24]"
                style={{ fontFamily: SERIF, fontWeight: 300 }}
              >
                Desligue a tela.
                <br />
                <em style={{ fontStyle: "italic", color: "#3E7A5A" }}>Ligue a infância.</em>
              </h1>
            </Reveal>

            <Reveal delay={0.35}>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#4c5b52]">
                Transforme cinco minutos em memórias que seu filho nunca vai esquecer.
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <GoldButton onClick={goApp}>Começar gratuitamente</GoldButton>
                <GhostButton onClick={() => scrollTo("quiz")}>Ver como funciona</GhostButton>
              </div>
            </Reveal>
          </div>

          <div className="relative mt-14 flex w-full flex-col items-center lg:mt-0 lg:w-1/2">
            <Phone delay={0.4}>
              <PhoneScreen
                eyebrow="Perguntas"
                title="Me pergunte qualquer coisa"
                lines={[
                  "Por que a chuva cai?",
                  "As nuvens ficam pesadinhas de tanta água.",
                  "Desafio: ouçam a chuva juntos por 1 minuto.",
                ]}
                accent="#3E7A5A"
              />
            </Phone>

            <motion.img
              src={CHAMELEON}
              alt="Gui, o camaleão do KIDZZ"
              className="mt-[-42px] w-[190px] sm:w-[230px]"
              style={{
                filter: "drop-shadow(0 40px 60px rgba(20,40,28,0.4))",
                WebkitMaskImage:
                  "radial-gradient(72% 78% at 50% 50%, #000 56%, rgba(0,0,0,0.5) 80%, transparent 96%)",
                maskImage:
                  "radial-gradient(72% 78% at 50% 50%, #000 56%, rgba(0,0,0,0.5) 80%, transparent 96%)",
              }}
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ══ QUIZ ══ */}
      <section id="quiz" className="relative px-6 py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(200,230,210,0.55), transparent 70%)" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <h2
              className="text-[clamp(2rem,6vw,3.2rem)] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: SERIF, fontWeight: 300 }}
            >
              Vamos descobrir como está a{" "}
              <em style={{ fontStyle: "italic", color: "#3E7A5A" }}>conexão da sua família</em>?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-md text-[16px] text-[#5c6b62]">
              Quatro perguntas. Menos de um minuto. Nenhum julgamento.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="mt-14">
          <Quiz />
        </Reveal>
      </section>

      {/* ══ FEATURE PHONES ══ */}
      <section className="relative px-6 py-24 sm:py-32">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 45% at 20% 5%, rgba(203,232,214,0.55), transparent 65%), radial-gradient(60% 40% at 85% 60%, rgba(255,238,199,0.6), transparent 65%), linear-gradient(180deg,#F4F6F0,#F8F5EC)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#7d8b82]">Por dentro</span>
            <h2
              className="mt-5 text-[clamp(2rem,6vw,3.2rem)] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: SERIF, fontWeight: 300 }}
            >
              Seis maneiras de estar mais perto
            </h2>
          </Reveal>

          <div className="mt-20 grid gap-x-10 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_PHONES.map((f, i) => (
              <Reveal key={f.name} delay={(i % 3) * 0.08}>
                <div
                  className="flex h-full flex-col items-center rounded-[40px] px-6 pb-10 pt-12 text-center"
                  style={glass}
                >
                  <Phone delay={i * 0.5}>
                    <PhoneScreen {...f.screen} accent={f.accent} />
                  </Phone>
                  <h3
                    className="mt-9 text-[24px] leading-tight"
                    style={{ fontFamily: SERIF, fontWeight: 400 }}
                  >
                    {f.name}
                  </h3>
                  <p className="mt-3 max-w-[26ch] text-[14px] leading-relaxed text-[#5c6b62]">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ JARRO DA GRATIDÃO ══ */}
      <section className="relative overflow-hidden px-6 py-32">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 40%, rgba(255,238,196,0.85), rgba(251,250,245,0) 70%), linear-gradient(180deg,#FBFAF5,#F6F2E7)",
          }}
        />
        <Particles count={26} tint="255,226,150" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <motion.div
              className="relative mx-auto w-[300px] sm:w-[380px]"
              animate={reduce ? undefined : { y: [0, -16, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={jarImg}
                alt="Jarro de vidro cheio de estrelas douradas brilhando"
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full rounded-[44px]"
                style={{
                  boxShadow: "0 70px 120px -60px rgba(160,120,40,0.75)",
                  WebkitMaskImage:
                    "radial-gradient(66% 66% at 50% 50%, #000 46%, rgba(0,0,0,0.55) 72%, transparent 92%)",
                  maskImage:
                    "radial-gradient(66% 66% at 50% 50%, #000 46%, rgba(0,0,0,0.55) 72%, transparent 92%)",
                }}
              />
              {["Primeiro dente", "Colo de domingo", "Risada no banho"].map((m, i) => (
                <motion.div
                  key={m}
                  className="absolute rounded-2xl px-4 py-3 text-[12px] text-[#4c5b52]"
                  style={{
                    ...glass,
                    top: `${12 + i * 30}%`,
                    left: i % 2 === 0 ? "-6%" : "auto",
                    right: i % 2 === 0 ? "auto" : "-4%",
                  }}
                  animate={reduce ? undefined : { y: [0, -10, 0] }}
                  transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                >
                  {m}
                </motion.div>
              ))}
            </motion.div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#9a7f3c]">
              Jarro da Gratidão
            </span>
            <h2
              className="mt-5 text-[clamp(2rem,6vw,3.4rem)] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: SERIF, fontWeight: 300 }}
            >
              Toda grande infância começa com{" "}
              <em style={{ fontStyle: "italic", color: "#B4843C" }}>pequenos momentos</em>.
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#5c6b62]">
              Cada estrela representa um instante vivido em família.
            </p>
            <GoldButton className="mt-9" onClick={goApp}>
              Guardar meu primeiro momento
            </GoldButton>
          </Reveal>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2
              className="text-[clamp(1.8rem,5.5vw,2.8rem)] leading-[1.08] tracking-[-0.02em]"
              style={{ fontFamily: SERIF, fontWeight: 300 }}
            >
              Pensado nos detalhes que vocês sentem
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.07}>
                <motion.div
                  className="h-full rounded-[32px] p-7"
                  style={glass}
                  animate={reduce ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-[18px]"
                    style={{
                      background: "linear-gradient(140deg, rgba(200,232,212,0.9), rgba(255,245,214,0.85))",
                      color: "#3E7A5A",
                      boxShadow: "0 0 26px rgba(190,225,205,0.7)",
                    }}
                  >
                    {f.icon}
                  </span>
                  <h3 className="mt-5 text-[19px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#5c6b62]">{f.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SOCIAL PROOF ══ */}
      <section className="relative px-6 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.author} delay={i * 0.1}>
              <div className="relative overflow-hidden rounded-[40px]">
                <img
                  src={t.img}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-[440px] w-full object-cover sm:h-[560px]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(20,32,26,0) 40%, rgba(20,32,26,0.55) 100%)",
                  }}
                />
                <div className="absolute inset-x-5 bottom-5 rounded-[28px] p-6" style={glassDark}>
                  <p
                    className="text-[19px] leading-snug text-white"
                    style={{ fontFamily: SERIF, fontWeight: 300 }}
                  >
                    “{t.quote}”
                  </p>
                  <span className="mt-3 block text-[12px] uppercase tracking-[0.2em] text-white/75">
                    {t.author}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ STORYTELLING ══ */}
      <section className="relative overflow-hidden">
        <img
          src={handsImg}
          alt=""
          aria-hidden
          loading="lazy"
          width={1536}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,28,22,0.72) 0%, rgba(18,28,22,0.5) 50%, rgba(18,28,22,0.82) 100%)",
            backdropFilter: "blur(2px)",
          }}
        />
        <Particles count={16} />
        <div className="relative mx-auto max-w-2xl px-6 py-36 text-center sm:py-48">
          {[
            "Um dia...",
            "Seu filho vai pedir colo pela última vez.",
            "Vai querer brincar pela última vez.",
            "Vai segurar sua mão pela última vez.",
            "Você nunca saberá quando será esse dia.",
            "Mas ainda pode escolher viver o hoje.",
          ].map((line, i) => (
            <Reveal key={line} delay={i * 0.08} y={22}>
              <p
                className={`text-white ${
                  i === 0 || i === 5
                    ? "text-[clamp(1.7rem,5.5vw,2.6rem)]"
                    : "text-[clamp(1.2rem,4vw,1.8rem)]"
                } leading-[1.4]`}
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontStyle: i === 5 ? "italic" : "normal",
                  marginTop: i === 0 ? 0 : i === 5 ? "2.4rem" : "1.1rem",
                  opacity: i === 0 || i === 5 ? 1 : 0.88,
                }}
              >
                {line}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src={forestBg}
          alt=""
          aria-hidden
          loading="lazy"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(252,250,244,0.55) 0%, rgba(252,250,244,0.2) 45%, rgba(252,250,244,0.95) 100%)",
          }}
        />
        <SunRays />
        <Particles count={24} />

        <div className="relative mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 py-28 text-center">
          <GlassLogo size={260} />
          <Reveal delay={0.1}>
            <h2
              className="mt-10 text-[clamp(2.1rem,7vw,3.6rem)] leading-[1.05] tracking-[-0.02em] text-[#1e2b24]"
              style={{ fontFamily: SERIF, fontWeight: 300 }}
            >
              A infância acontece <em style={{ fontStyle: "italic", color: "#3E7A5A" }}>apenas uma vez</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-[18px] leading-relaxed text-[#4c5b52]">
              Desligue a tela.
              <br />
              Ligue a infância.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <GoldButton className="mt-10" onClick={goApp}>
              Começar gratuitamente
            </GoldButton>
          </Reveal>

          <motion.img
            src={CHAMELEON}
            alt="Gui, o camaleão do KIDZZ, olhando para o horizonte"
            className="mt-12 w-[180px] sm:w-[220px]"
            style={{
              filter: "drop-shadow(0 40px 60px rgba(20,40,28,0.4))",
              WebkitMaskImage:
                "radial-gradient(72% 78% at 50% 50%, #000 56%, rgba(0,0,0,0.5) 80%, transparent 96%)",
              maskImage:
                "radial-gradient(72% 78% at 50% 50%, #000 56%, rgba(0,0,0,0.5) 80%, transparent 96%)",
            }}
            animate={reduce ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <p
            className="mt-12 text-[11px] uppercase tracking-[0.34em] text-[#7d8b82]"
            style={{ fontFamily: SANS }}
          >
            Desligue a tela. Ligue a infância.
          </p>
        </div>
      </section>
    </main>
  );
}
