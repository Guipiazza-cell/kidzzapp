import { useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import heroImage from "@/assets/lp-kidzz-wellness-hero.webp";
import { haptic } from "@/lib/haptics";
import { captureAttribution, track, withAttribution } from "@/lib/lpAnalytics";

const APP_URL = "https://kidzzapp.lovable.app";
const EASE = [0.42, 0, 0.58, 1] as const;

const lpVars = {
  "--lp-bg": "48 24% 96%",
  "--lp-green": "105 33% 62%",
  "--lp-green-dark": "145 26% 28%",
  "--lp-off": "48 56% 98%",
  "--lp-ink": "0 0% 18%",
  "--lp-glow": "105 33% 62% / 0.18",
} as CSSProperties & Record<string, string>;

const S = {
  bg: "hsl(var(--lp-bg))",
  green: "hsl(var(--lp-green))",
  greenDark: "hsl(var(--lp-green-dark))",
  off: "hsl(var(--lp-off))",
  ink: "hsl(var(--lp-ink))",
  inkSoft: "hsl(var(--lp-ink) / 0.68)",
  inkMuted: "hsl(var(--lp-ink) / 0.52)",
  glow: "hsl(var(--lp-glow))",
};

const displayFont = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';
const bodyFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE } },
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Icon({ name }: { name: "heart" | "moon" | "book" | "spark" | "wave" | "family" | "sos" | "question" | "check" }) {
  const paths: Record<typeof name, string> = {
    heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
    moon: "M19 14.5A7.5 7.5 0 0 1 9.5 5a7.8 7.8 0 1 0 9.5 9.5Z",
    book: "M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21V5.5Zm0 0V21m3-14h8m-8 4h8",
    spark: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 13l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
    wave: "M4 14c2.5-4 5.5-4 8 0s5.5 4 8 0M4 18c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0M6 9c1.8-2 3.8-2 6 0s4.2 2 6 0",
    family: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 20a5 5 0 0 1 10 0m1.5 0a4 4 0 0 1 6.5 0",
    sos: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5m0 3h.01",
    question: "M9.5 8.5A2.7 2.7 0 0 1 12.2 6c1.7 0 3.1 1.1 3.1 2.7 0 2.2-2.5 2.3-2.5 4.5M12 17h.01",
    check: "M20 6 9 17l-5-5",
  };

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={paths[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CTA({ children, onClick, variant = "primary", large = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; large?: boolean }) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      onClick={() => {
        haptic(primary ? "medium" : "light");
        onClick?.();
      }}
      className="relative inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-6 font-semibold transition-transform duration-300 ease-in-out active:scale-[0.98]"
      style={{
        minWidth: large ? 230 : undefined,
        color: primary ? S.off : S.greenDark,
        background: primary
          ? `linear-gradient(180deg, ${S.green} 0%, ${S.greenDark} 100%)`
          : "hsl(var(--lp-off) / 0.84)",
        border: primary ? "1px solid hsl(var(--lp-green) / 0.34)" : "1px solid hsl(var(--lp-green-dark) / 0.14)",
        boxShadow: primary
          ? "0 18px 36px -20px hsl(var(--lp-green-dark) / 0.58), inset 0 1px 0 hsl(var(--lp-off) / 0.34)"
          : "0 10px 24px -20px hsl(var(--lp-ink) / 0.24)",
      }}
    >
      <span>{children}</span>
    </button>
  );
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-8% 0px" }}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.34, delay, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] ${className}`}
      style={{
        background: "linear-gradient(180deg, hsl(var(--lp-off) / 0.72), hsl(var(--lp-off) / 0.48))",
        border: "1px solid hsl(var(--lp-off) / 0.88)",
        boxShadow: "0 18px 42px -32px hsl(var(--lp-ink) / 0.28)",
      }}
    >
      {children}
    </div>
  );
}

function Atmosphere() {
  const reduced = useReducedMotion();
  const particles = [
    [18, 28, 0],
    [72, 18, 0.12],
    [84, 58, 0.24],
    [31, 72, 0.08],
    [58, 38, 0.2],
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[8%] top-[18%] h-28 w-28 rounded-full"
        style={{ background: S.glow, filter: "blur(26px)" }}
        animate={reduced ? undefined : { opacity: [0.38, 0.62, 0.38], scale: [1, 1.04, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map(([left, top, delay], i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ left: `${left}%`, top: `${top}%`, background: "hsl(var(--lp-off) / 0.9)", boxShadow: "0 0 14px hsl(var(--lp-off) / 0.72)" }}
          animate={reduced ? undefined : { opacity: [0.16, 0.62, 0.16], y: [0, -8, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function HeroBackdrop({ onLoad }: { onLoad: () => void }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ background: S.bg }}>
      <img
        src={heroImage}
        alt=""
        className="lp-hero-image absolute inset-0 h-full w-full scale-[1.03] object-cover object-top opacity-45"
        style={{ filter: "blur(10px) saturate(1.04)" }}
        decoding="async"
        draggable={false}
      />
      <img
        src={heroImage}
        alt=""
        className="lp-hero-image absolute inset-0 h-full w-full object-contain object-top md:object-cover"
        style={{ filter: "saturate(1.03) contrast(0.99)", transform: "translateZ(0)" }}
        width={1054}
        height={1492}
        loading="eager"
        decoding="async"
        {...({ fetchpriority: "high" } as Record<string, string>)}
        draggable={false}
        onLoad={onLoad}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,246,242,0.08) 0%, rgba(247,246,242,0.16) 25%, rgba(247,246,242,0.42) 70%, rgba(247,246,242,0.78) 100%)",
        }}
      />
      <Atmosphere />
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden"
      style={{ minHeight: "100dvh", background: S.bg }}
    >
      <HeroBackdrop onLoad={() => setLoaded(true)} />
      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 22%, ${S.off} 0%, ${S.bg} 62%)` }}
        />
      )}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center px-5 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+58px)] text-center md:min-h-screen md:justify-center md:pt-16" style={{ minHeight: "100dvh" }}>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EASE }}
          className="w-full max-w-[370px] md:max-w-2xl"
        >
          <div
            className="mx-auto mb-5 inline-flex items-center rounded-full px-4 py-2 text-[12px] font-semibold"
            style={{ color: S.greenDark, background: "hsl(var(--lp-off) / 0.74)", border: "1px solid hsl(var(--lp-green-dark) / 0.12)" }}
          >
            Kidzz.app
          </div>
          <h1 className="text-[29px] font-semibold leading-[1.04] min-[390px]:text-[31px] md:text-[62px]" style={{ fontFamily: displayFont, color: S.ink, letterSpacing: 0 }}>
            Seu filho faz perguntas…
            <span className="block" style={{ color: S.greenDark }}>
              mas talvez o que ele mais precise é conexão.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-[340px] text-[15px] leading-relaxed md:max-w-lg md:text-[19px]" style={{ color: S.inkSoft }}>
            Descubra em 60 segundos como transformar telas em momentos de calma, vínculo e aprendizado.
          </p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-8">
            <CTA onClick={() => { track("lp_cta_click", { location: "hero" }); onStart(); }} large>Começar teste gratuito ✨</CTA>
            <CTA variant="secondary" onClick={() => { track("lp_cta_click", { location: "hero_secondary" }); scrollToId("como-funciona"); }}>Entender como funciona</CTA>
          </div>
        </motion.div>
        <div className="mt-auto pt-8 text-[11px] font-medium uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.48)", letterSpacing: "0.2em" }}>
          60 segundos
        </div>
      </div>
    </section>
  );
}

const painCards = [
  "Seu filho pede atenção enquanto você tenta sobreviver ao dia.",
  "Às vezes não falta amor. Falta respiro.",
  "A tela vira pausa, mas a culpa continua.",
  "A casa precisa de menos cobrança e mais presença.",
];

function Identification() {
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.22em" }}>
            Identificação
          </p>
          <h2 className="text-[31px] font-semibold leading-[1.08] md:text-[50px]" style={{ fontFamily: displayFont, color: S.ink }}>
            A rotina moderna cansou pais e filhos.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed" style={{ color: S.inkSoft }}>
            O Kidzz começa onde muitas famílias estão: tentando amar bem, mesmo no meio do caos.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {painCards.map((card, index) => (
            <FadeIn key={card} delay={index * 0.04}>
              <Glass className="min-h-[116px] p-6">
                <p className="text-[18px] font-semibold leading-snug md:text-[21px]" style={{ fontFamily: displayFont, color: index === 1 ? S.greenDark : S.ink }}>
                  “{card}”
                </p>
              </Glass>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestSection({ onStart }: { onStart: () => void }) {
  return (
    <section id="teste" className="px-5 py-14 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <Glass className="p-7 md:p-10">
            <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.68)", letterSpacing: "0.22em" }}>
              Quiz emocional
            </p>
            <h2 className="text-[30px] font-semibold leading-[1.08] md:text-[48px]" style={{ fontFamily: displayFont, color: S.ink }}>
              Em 60 segundos vamos mostrar:
            </h2>
            <div className="mx-auto mt-7 grid max-w-xl gap-3 text-left">
              {["como sua família está hoje", "o que mais gera desconexão", "e como transformar isso em vínculo"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl px-4 py-4" style={{ background: "hsl(var(--lp-green) / 0.11)", color: S.greenDark }}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "hsl(var(--lp-off) / 0.8)" }}>
                    <Icon name="check" />
                  </span>
                  <span className="text-[15px] font-semibold">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <CTA onClick={() => { track("lp_cta_click", { location: "test_section" }); onStart(); }} large>Fazer teste agora ✨</CTA>
            </div>
          </Glass>
        </FadeIn>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Responda rápido", "Perguntas simples sobre rotina, telas, sono e vínculo."],
    ["02", "Descubra o perfil emocional da família", "Um retrato leve do que está pedindo mais cuidado agora."],
    ["03", "Receba experiências personalizadas", "SOS, histórias, sono e brincadeiras dentro do Kidzz."],
  ];
  return (
    <section id="como-funciona" className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.22em" }}>
            Como funciona
          </p>
          <h2 className="text-[31px] font-semibold leading-[1.08] md:text-[50px]" style={{ fontFamily: displayFont, color: S.ink }}>
            Tecnologia invisível. Cuidado visível.
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {steps.map(([n, title, desc], index) => (
            <FadeIn key={title} delay={index * 0.05}>
              <Glass className="h-full p-6">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-bold" style={{ color: S.greenDark, background: "hsl(var(--lp-green) / 0.16)" }}>
                  {n}
                </div>
                <h3 className="text-[20px] font-semibold" style={{ color: S.ink }}>{title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: S.inkSoft }}>{desc}</p>
              </Glass>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const experiences = [
  ["sos", "SOS emocional", "Respirar junto nos picos de crise."],
  ["moon", "Ritual do sono", "Desacelerar a casa no fim do dia."],
  ["book", "Histórias guiadas", "Narrativas que acolhem e ensinam."],
  ["question", "Perguntas mágicas", "Curiosidade que vira conversa real."],
  ["wave", "Wellness cinematográfico", "Pausas de calma para a família."],
  ["family", "Conexão pai e filho", "Momentos pequenos que ficam."],
] as const;

function Experiences() {
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.22em" }}>
            Experiências
          </p>
          <h2 className="text-[31px] font-semibold leading-[1.08] md:text-[50px]" style={{ fontFamily: displayFont, color: S.ink }}>
            Não é catálogo. É presença em formatos diferentes.
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map(([icon, title, desc], index) => (
            <FadeIn key={title} delay={index * 0.035}>
              <Glass className="h-full p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ color: S.greenDark, background: "linear-gradient(180deg, hsl(var(--lp-green) / 0.22), hsl(var(--lp-green-dark) / 0.08))" }}>
                  <Icon name={icon} />
                </div>
                <h3 className="text-[19px] font-semibold" style={{ color: S.ink }}>{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: S.inkSoft }}>{desc}</p>
              </Glass>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const reviews = [
    ["A primeira vez que meu filho pediu uma história em vez de outro vídeo, eu entendi.", "Marina, mãe do Theo"],
    ["Parece pequeno, mas mudou o clima da noite aqui em casa.", "Rafael, pai da Nina"],
    ["É acolhedor sem parecer infantilizado. Eu uso junto com ela.", "Camila, mãe da Lis"],
  ];
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.22em" }}>
            Confiança emocional
          </p>
          <h2 className="text-[31px] font-semibold leading-[1.08] md:text-[48px]" style={{ fontFamily: displayFont, color: S.ink }}>
            Famílias usando Kidzz para transformar o caos em conexão.
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {reviews.map(([text, author], index) => (
            <FadeIn key={author} delay={index * 0.05}>
              <Glass className="h-full p-6">
                <p className="text-[18px] font-semibold leading-snug" style={{ fontFamily: displayFont, color: S.ink }}>“{text}”</p>
                <p className="mt-6 text-[13px] font-semibold" style={{ color: "hsl(var(--lp-green-dark) / 0.72)" }}>{author}</p>
              </Glass>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-5 py-16 md:py-24">
      <FadeIn>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[34px] p-8 text-center md:p-12" style={{ background: `radial-gradient(circle at 50% 0%, hsl(var(--lp-green) / 0.2), transparent 54%), linear-gradient(180deg, ${S.greenDark}, hsl(var(--lp-green-dark) / 0.92))`, color: S.off, boxShadow: "0 26px 70px -44px hsl(var(--lp-green-dark) / 0.72)" }}>
          <h2 className="text-[34px] font-semibold leading-[1.04] md:text-[54px]" style={{ fontFamily: displayFont }}>
            Talvez seu filho não precise de mais tela. Talvez precise de momentos que fiquem.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed" style={{ color: "hsl(var(--lp-off) / 0.72)" }}>
            Comece pelo teste. O próximo momento de conexão pode nascer hoje.
          </p>
          <div className="mt-8">
            <CTA onClick={() => { track("lp_cta_click", { location: "final_cta" }); onStart(); }} large>Começar agora ✨</CTA>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

type QuizAnswer = { label: string; weight: number };
const QUESTIONS: { q: string; options: QuizAnswer[] }[] = [
  { q: "Hoje, qual sensação mais aparece na rotina da sua casa?", options: [{ label: "Calma, na maior parte do tempo", weight: 0 }, { label: "Oscila entre leve e cansativa", weight: 1 }, { label: "Sobrecarga quase diária", weight: 2 }] },
  { q: "Quando seu filho pede tela, o que normalmente está por trás?", options: [{ label: "Curiosidade ou lazer", weight: 0 }, { label: "Tédio e busca por atenção", weight: 1 }, { label: "Cansaço, birra ou fuga do caos", weight: 2 }] },
  { q: "Como costuma ser a hora de dormir?", options: [{ label: "Um ritual previsível", weight: 0 }, { label: "Depende do dia", weight: 1 }, { label: "Uma batalha emocional", weight: 2 }] },
  { q: "Quanto espaço existe para presença real sem tela?", options: [{ label: "Todos os dias", weight: 0 }, { label: "Alguns dias", weight: 1 }, { label: "Quase nunca", weight: 2 }] },
  { q: "O que sua família mais precisa agora?", options: [{ label: "Ideias leves para se conectar", weight: 0 }, { label: "Ajuda para criar rituais", weight: 1 }, { label: "Um respiro emocional urgente", weight: 2 }] },
];

function QuizExperience({ onClose, onFinish }: { onClose: () => void; onFinish: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const progress = ((idx + 1) / QUESTIONS.length) * 100;

  const pick = (weight: number) => {
    haptic("medium");
    const next = score + weight;
    setScore(next);
    track("lp_quiz_question_answered", { question_index: idx, question_number: idx + 1, weight, running_score: next });
    if (idx + 1 >= QUESTIONS.length) window.setTimeout(() => onFinish(next), 260);
    else setIdx((value) => value + 1);
  };

  return (
    <main className="min-h-[100svh] px-5 pb-12 pt-[calc(env(safe-area-inset-top)+18px)]" style={{ ...lpVars, minHeight: "100dvh", background: S.bg, color: S.ink, fontFamily: bodyFont }}>
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <button type="button" onClick={onClose} className="min-h-[44px] text-[14px] font-semibold" style={{ color: S.inkSoft }}>Fechar</button>
        <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: "hsl(var(--lp-green-dark) / 0.12)" }}>
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${S.green}, ${S.greenDark})` }} animate={{ width: `${progress}%` }} transition={{ duration: 0.28, ease: EASE }} />
        </div>
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: S.inkMuted }}>{idx + 1}/{QUESTIONS.length}</span>
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-92px)] max-w-xl flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: EASE }}>
            <p className="mb-4 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.22em" }}>Pergunta {idx + 1}</p>
            <h1 className="text-[31px] font-semibold leading-[1.08]" style={{ fontFamily: displayFont, color: S.ink }}>{QUESTIONS[idx].q}</h1>
            <div className="mt-9 space-y-3">
              {QUESTIONS[idx].options.map((opt) => (
                <button key={opt.label} type="button" onClick={() => pick(opt.weight)} className="min-h-[58px] w-full rounded-2xl px-5 text-left text-[15.5px] font-semibold transition-transform duration-300 active:scale-[0.99]" style={{ color: S.ink, background: "hsl(var(--lp-off) / 0.88)", border: "1px solid hsl(var(--lp-off) / 0.92)", boxShadow: "0 14px 34px -28px hsl(var(--lp-ink) / 0.28)" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function Result({ score, onClose }: { score: number; onClose: () => void }) {
  const profile = useMemo(() => {
    const pct = score / (QUESTIONS.length * 2);
    if (pct < 0.34) return { title: "Sua família já respira presença.", sub: "O Kidzz pode transformar essa base em pequenos rituais memoráveis.", tips: ["Perguntas mágicas semanais", "Histórias guiadas", "Brincadeiras de presença"] };
    if (pct < 0.67) return { title: "Sua família precisa de mais respiros.", sub: "Há sinais de cansaço invisível, mas pequenos rituais podem mudar o clima da casa.", tips: ["Ritual do sono", "Wellness de 3 minutos", "Conexão pai e filho"] };
    return { title: "A rotina está pedindo pausa.", sub: "O excesso de tela e a sobrecarga emocional estão falando alto. O próximo passo pode ser leve.", tips: ["SOS emocional", "Ritual de desaceleração", "Histórias para acolher"] };
  }, [score]);

  return (
    <main className="min-h-[100svh] px-5 pb-14 pt-[calc(env(safe-area-inset-top)+18px)]" style={{ ...lpVars, minHeight: "100dvh", background: S.bg, color: S.ink, fontFamily: bodyFont }}>
      <div className="mx-auto max-w-xl">
        <button type="button" onClick={onClose} className="min-h-[44px] text-[14px] font-semibold" style={{ color: S.inkSoft }}>Voltar</button>
        <motion.div initial="hidden" animate="show" variants={fade} className="pt-8 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.22em" }}>Resultado personalizado</p>
          <h1 className="text-[34px] font-semibold leading-[1.05]" style={{ fontFamily: displayFont, color: S.ink }}>{profile.title}</h1>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed" style={{ color: S.inkSoft }}>{profile.sub}</p>
        </motion.div>
        <Glass className="mt-9 p-6">
          <p className="mb-5 text-[12px] font-semibold uppercase" style={{ color: "hsl(var(--lp-green-dark) / 0.66)", letterSpacing: "0.18em" }}>O Kidzz recomenda</p>
          <div className="space-y-4">
            {profile.tips.map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ color: S.greenDark, background: "hsl(var(--lp-green) / 0.18)" }}><Icon name="check" /></span>
                <span className="text-[15.5px] font-semibold" style={{ color: S.ink }}>{tip}</span>
              </div>
            ))}
          </div>
        </Glass>
        <div className="mt-8 flex flex-col items-center gap-3">
          <CTA onClick={() => { track("lp_app_redirect", { score, location: "result" }); window.location.href = withAttribution(APP_URL); }} large>Entrar no Kidzz agora ✨</CTA>
          <p className="text-[12px]" style={{ color: S.inkMuted }}>Menos caos. Mais conexão.</p>
        </div>
      </div>
    </main>
  );
}

export default function LandingQuiz() {
  const [phase, setPhase] = useState<"landing" | "quiz" | "result">("landing");
  const [score, setScore] = useState(0);

  useLayoutEffect(() => {
    document.documentElement.classList.add("lp-route");
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = heroImage;
    preload.setAttribute("fetchpriority", "high");
    document.head.appendChild(preload);

    document.title = "Kidzz — Sistema emocional para famílias modernas";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "Faça o teste emocional de 60 segundos do Kidzz e descubra experiências de calma, vínculo e aprendizado para sua família.");
    if (!meta.parentElement) document.head.appendChild(meta);

    return () => {
      document.documentElement.classList.remove("lp-route");
      preload.remove();
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  const start = () => setPhase("quiz");

  if (phase === "quiz") {
    return <QuizExperience onClose={() => setPhase("landing")} onFinish={(value) => { setScore(value); setPhase("result"); }} />;
  }

  if (phase === "result") {
    return <Result score={score} onClose={() => setPhase("landing")} />;
  }

  return (
    <main className="relative min-h-screen overflow-x-clip" style={{ ...lpVars, background: S.bg, color: S.ink, fontFamily: bodyFont }}>
      <Hero onStart={start} />
      <Identification />
      <TestSection onStart={start} />
      <HowItWorks />
      <Experiences />
      <SocialProof />
      <FinalCTA onStart={start} />
      <footer className="px-5 pb-[calc(env(safe-area-inset-bottom)+30px)] pt-2 text-center">
        <p className="text-[12px]" style={{ color: "hsl(var(--lp-ink) / 0.45)" }}>© {new Date().getFullYear()} Kidzz — Sistema emocional inteligente para famílias modernas.</p>
      </footer>
    </main>
  );
}
