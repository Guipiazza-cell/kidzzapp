import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import mascotAsset from "@/assets/kidzz-chameleon.png.asset.json";
import { haptic } from "@/lib/haptics";
import { captureAttribution, track, withAttribution } from "@/lib/lpAnalytics";

const APP_URL = "https://kidzz.app";

// Brand palette
const C = {
  sage: "#7FB069",
  sageDark: "#5E9550",
  amber: "#E8821A",
  amberDark: "#C96F12",
  gold: "#E2B64C",
  cream: "#FFF8F0",
  deep: "#1B3A2F",
  ink: "#1A1410",
  inkSoft: "rgba(26,20,16,0.72)",
  inkMuted: "rgba(26,20,16,0.55)",
};

const display = "'Nunito', system-ui, sans-serif";
const body = "'Nunito', system-ui, sans-serif";

const lpVars = {
  "--c-sage": C.sage,
  "--c-amber": C.amber,
  "--c-gold": C.gold,
  "--c-cream": C.cream,
  "--c-deep": C.deep,
} as CSSProperties & Record<string, string>;

// ─────────────────────────────────────────────
// Kidzz — animated mascot with ambient forest backdrop
// ─────────────────────────────────────────────
type KidzzMood = "idle" | "happy" | "empathy" | "thinking" | "wave";

function Kidzz({
  size = 360,
  mood = "idle",
  reactive = true,
  ambient = true,
}: {
  size?: number;
  mood?: KidzzMood;
  reactive?: boolean;
  ambient?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!reactive || reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setOffset({ x: Math.max(-1, Math.min(1, dx * 2)), y: Math.max(-1, Math.min(1, dy * 2)) });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reactive, reduced]);

  const breath = reduced ? {} : { y: [0, -8, 0], rotate: [0, mood === "wave" ? 4 : 1.2, 0] };
  const breathTr = { duration: mood === "happy" ? 1.6 : 3.4, repeat: Infinity, ease: "easeInOut" as const };
  const tilt = mood === "empathy" ? -4 : mood === "happy" ? 3 : 0;

  return (
    <div ref={ref} style={{ width: size, height: size, position: "relative" }} aria-hidden>
      {/* Ambient glow that bleeds the mascot into the page */}
      {ambient && (
        <>
          <motion.div
            style={{
              position: "absolute",
              inset: "-10%",
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${C.gold}40 0%, ${C.amber}1f 40%, transparent 72%)`,
              filter: "blur(14px)",
              pointerEvents: "none",
            }}
            animate={reduced ? {} : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            style={{
              position: "absolute",
              inset: "-4%",
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${C.sage}33 0%, transparent 68%)`,
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
        </>
      )}
      <motion.div
        style={{ width: "100%", height: "100%", position: "relative", transform: `rotate(${tilt}deg)` }}
        animate={breath}
        transition={breathTr}
      >
        <img
          src={mascotAsset.url}
          alt="Kidzz, o camaleão da floresta"
          width={size}
          height={size}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "50%",
            // Soft circular vignette so the image's forest background fades into the page
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, #000 52%, rgba(0,0,0,0.85) 64%, rgba(0,0,0,0.35) 80%, transparent 96%)",
            maskImage:
              "radial-gradient(circle at 50% 50%, #000 52%, rgba(0,0,0,0.85) 64%, rgba(0,0,0,0.35) 80%, transparent 96%)",
            filter: `drop-shadow(0 22px 30px rgba(27,58,47,0.30))`,
            transform: `translate(${offset.x * 8}px, ${offset.y * 6}px)`,
            transition: "transform 0.4s cubic-bezier(.2,.8,.2,1)",
            position: "relative",
            zIndex: 2,
          }}
          loading="eager"
          decoding="async"
        />
      </motion.div>
      {/* Sparkles for happy */}
      {mood === "happy" && !reduced && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                left: `${15 + i * 16}%`,
                top: `${10 + (i % 2) * 12}%`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.gold,
                boxShadow: `0 0 12px ${C.gold}`,
                pointerEvents: "none",
                zIndex: 3,
              }}
              animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
// Floating golden firefly particles
// ─────────────────────────────────────────────
function Fireflies({ count = 22, color = C.gold }: { count?: number; color?: string }) {
  const reduced = useReducedMotion();
  const flies = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: 6 + Math.random() * 14,
        s: 4 + Math.random() * 8,
        delay: Math.random() * 4,
      })),
    [count],
  );
  if (reduced) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {flies.map((f) => (
        <motion.span
          key={f.id}
          style={{
            position: "absolute",
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.d,
            height: f.d,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 ${f.d * 1.6}px ${color}, 0 0 ${f.d * 0.6}px #fff`,
            opacity: 0.6,
          }}
          animate={{
            y: [0, -30, 10, 0],
            x: [0, 12, -8, 0],
            opacity: [0.2, 0.9, 0.4, 0.2],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: f.s, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tilt card (CSS 3D)
// ─────────────────────────────────────────────
function TiltCard({ children, intensity = 8, style }: { children: React.ReactNode; intensity?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [t, setT] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * intensity, ry: px * intensity });
  };
  const onLeave = () => setT({ rx: 0, ry: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
        transition: "transform 0.3s cubic-bezier(.2,.8,.2,1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Quiz data
// ─────────────────────────────────────────────
type QOption = { key: string; label: string };
type Question = { id: string; title: string; mood: KidzzMood; options: QOption[] };

const QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Como está a rotina aí em casa hoje?",
    mood: "empathy",
    options: [
      { key: "a", label: "Corrida, mal tenho tempo de respirar" },
      { key: "b", label: "Tranquila na maioria dos dias" },
      { key: "c", label: "Um caos do acordar ao dormir" },
      { key: "d", label: "Depende do dia — montanha-russa" },
    ],
  },
  {
    id: "q2",
    title: "Qual desses momentos mais te aperta o coração?",
    mood: "empathy",
    options: [
      { key: "a", label: "Dar o celular pra ter um minuto de paz e depois me sentir culpado(a)" },
      { key: "b", label: "Meu filho pedindo atenção enquanto tento dar conta de tudo" },
      { key: "c", label: "A hora de dormir virar batalha todo dia" },
      { key: "d", label: "Sentir que estamos juntos, mas cada um no seu mundo" },
    ],
  },
  {
    id: "q3",
    title: "Quanto tempo seu filho passa em telas por dia?",
    mood: "thinking",
    options: [
      { key: "a", label: "Mais do que eu gostaria de admitir" },
      { key: "b", label: "Umas 2 horas, mais ou menos" },
      { key: "c", label: "Pouco, mas brigamos pra controlar" },
      { key: "d", label: "Não faço ideia, perdi a conta" },
    ],
  },
  {
    id: "q4",
    title: "O que você sente que falta na relação de vocês?",
    mood: "empathy",
    options: [
      { key: "a", label: "Tempo de qualidade de verdade" },
      { key: "b", label: "Paciência (a minha acaba rápido)" },
      { key: "c", label: "Conversas que vão além do 'como foi a escola'" },
      { key: "d", label: "Momentos de calma sem briga" },
    ],
  },
  {
    id: "q5",
    title: "Se pudesse mudar UMA coisa nas telas do seu filho, seria:",
    mood: "thinking",
    options: [
      { key: "a", label: "Que ensinassem algo de verdade" },
      { key: "b", label: "Que acalmassem em vez de agitar" },
      { key: "c", label: "Que aproximassem a gente em vez de afastar" },
      { key: "d", label: "Que eu não precisasse me sentir culpado(a) por usar" },
    ],
  },
  {
    id: "q6",
    title: "Quando seu filho te faz uma pergunta difícil, você:",
    mood: "happy",
    options: [
      { key: "a", label: "Respondo como dá, mas nem sempre sei" },
      { key: "b", label: "Às vezes não tenho tempo ou paciência" },
      { key: "c", label: "Adoro, mas queria respostas melhores" },
      { key: "d", label: "Uso o Google e torço pra acertar" },
    ],
  },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function LandingQuiz() {
  const reduced = useReducedMotion();

  useEffect(() => {
    captureAttribution();
    track("lp_view", { variant: "quiz_3d_v2" });
    document.title = "Kidzz — Transforme telas em conexão";
  }, []);

  // SEO meta
  useEffect(() => {
    const setMeta = (name: string, content: string) => {
      let m = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement("meta");
        m.name = name;
        document.head.appendChild(m);
      }
      m.content = content;
    };
    setMeta("description", "Descubra em 60 segundos como transformar telas em momentos de calma, vínculo e aprendizado com o Kidzz. Teste grátis.");
    setMeta("theme-color", C.amber);
  }, []);

  // Scroll-driven hero parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOp = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const [quizDone, setQuizDone] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");

  const startQuiz = () => {
    track("lp_quiz_start", {});
    haptic("light");
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  };

  const answer = (qid: string, key: string) => {
    haptic("light");
    setAnswers((a) => ({ ...a, [qid]: key }));
    setDirection(1);
    setTimeout(() => {
      if (quizIdx < QUESTIONS.length - 1) {
        setQuizIdx((i) => i + 1);
      } else {
        setQuizDone(true);
        track("lp_quiz_complete", { answers: { ...answers, [qid]: key } });
        setTimeout(() => document.getElementById("capture")?.scrollIntoView({ behavior: "smooth" }), 240);
      }
    }, 260);
  };

  const back = () => {
    if (quizIdx === 0) return;
    setDirection(-1);
    setQuizIdx((i) => i - 1);
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;
    track("lp_lead_capture", { email_domain: email.split("@")[1], name: !!firstName });
    setEmailSubmitted(true);
    haptic("medium");
    try {
      const stored = JSON.parse(localStorage.getItem("kidzz_lp_leads") || "[]");
      stored.push({ email, firstName, answers, ts: Date.now() });
      localStorage.setItem("kidzz_lp_leads", JSON.stringify(stored));
    } catch {
      // ignore
    }
    setTimeout(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" }), 240);
  };

  const goApp = (where: string) => {
    track("lp_app_redirect", { where });
    window.location.href = withAttribution(APP_URL);
  };

  const current = QUESTIONS[quizIdx];

  return (
    <main
      style={{
        ...lpVars,
        background: C.cream,
        color: C.ink,
        fontFamily: body,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* Font load */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <Nav onCta={startQuiz} />

      {/* HERO */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          paddingTop: 96,
          background: `radial-gradient(ellipse at 70% 20%, ${C.amber}1f, transparent 60%),
                       radial-gradient(ellipse at 10% 80%, ${C.sage}26, transparent 55%),
                       linear-gradient(180deg, #FFF4E2 0%, ${C.cream} 100%)`,
          overflow: "hidden",
        }}
      >
        <Fireflies count={26} />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px 80px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 40,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          <motion.div style={{ y: heroY, opacity: heroOp }}>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(232,130,26,0.12)",
                color: C.amberDark,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 0.2,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: C.amber }} />
              Feito para a família brasileira
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: "clamp(36px, 5.4vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: C.deep,
                margin: "22px 0 18px",
              }}
            >
              Seu filho faz mil perguntas. Mas e se o que ele mais precisa for{" "}
              <span style={{ color: C.amber }}>você?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              style={{ fontSize: "clamp(16px, 1.6vw, 19px)", color: C.inkSoft, maxWidth: 540, lineHeight: 1.55 }}
            >
              Descubra em 60 segundos como transformar telas em momentos de calma, vínculo e aprendizado — com o Kidzz.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="cta-row"
              style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}
            >
              <PrimaryButton onClick={startQuiz}>Fazer o teste grátis ✨</PrimaryButton>
              <SecondaryButton onClick={() => document.getElementById("solucao")?.scrollIntoView({ behavior: "smooth" })}>
                Como funciona
              </SecondaryButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="meta-row"
              style={{ display: "flex", gap: 18, marginTop: 28, color: C.inkMuted, fontSize: 13, flexWrap: "wrap" }}
            >
              <span>⭐ 4.9 nas avaliações</span>
              <span>👨‍👩‍👧 +12 mil famílias</span>
              <span>🇧🇷 100% em português</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ display: "flex", justifyContent: "center", position: "relative" }}
          >
            <Kidzz size={460} mood="happy" />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        {!reduced && (
          <motion.div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              color: C.deep,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: 0.6,
            }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Role para descobrir
            <span style={{ width: 1, height: 28, background: C.deep, opacity: 0.5 }} />
          </motion.div>
        )}
      </section>

      {/* QUIZ */}
      <section
        id="quiz"
        style={{
          padding: "100px 24px",
          background: `linear-gradient(180deg, ${C.cream} 0%, #FBEDD6 100%)`,
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {!quizDone ? (
            <>
              <ProgressBar value={(quizIdx + 1) / QUESTIONS.length} label={`Pergunta ${quizIdx + 1} de ${QUESTIONS.length}`} />
              <div style={{ position: "relative", minHeight: 480, marginTop: 36 }}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={current.id}
                    custom={direction}
                    initial={{ x: direction * 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -direction * 60, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }} className="quiz-grid">
                      <div>
                        <h2
                          style={{
                            fontFamily: display,
                            fontWeight: 800,
                            fontSize: "clamp(26px, 3.4vw, 38px)",
                            lineHeight: 1.15,
                            color: C.deep,
                            letterSpacing: "-0.015em",
                            margin: 0,
                          }}
                        >
                          {current.title}
                        </h2>
                        <p style={{ marginTop: 12, color: C.inkSoft, fontSize: 15 }}>
                          Sem certo ou errado. Só o seu retrato de hoje. 💛
                        </p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "center" }} className="quiz-kiko">
                        <Kidzz size={220} mood={current.mood} reactive={false} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
                      {current.options.map((opt) => {
                        const selected = answers[current.id] === opt.key;
                        return (
                          <motion.button
                            key={opt.key}
                            onClick={() => answer(current.id, opt.key)}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ y: -2 }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "20px 22px",
                              borderRadius: 18,
                              border: `2px solid ${selected ? C.amber : "rgba(27,58,47,0.1)"}`,
                              background: selected ? `${C.amber}15` : "#fff",
                              color: C.deep,
                              fontSize: 16,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              transition: "all .2s",
                              boxShadow: selected ? `0 12px 28px ${C.amber}33` : "0 4px 14px rgba(27,58,47,0.06)",
                            }}
                          >
                            <span
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                background: selected ? C.amber : "rgba(127,176,105,0.18)",
                                color: selected ? "#fff" : C.sageDark,
                                fontWeight: 800,
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                                fontSize: 14,
                              }}
                            >
                              {selected ? "✓" : opt.key.toUpperCase()}
                            </span>
                            <span style={{ flex: 1, lineHeight: 1.4 }}>{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {quizIdx > 0 && (
                      <button
                        onClick={back}
                        style={{
                          marginTop: 24,
                          background: "transparent",
                          border: "none",
                          color: C.inkMuted,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ← Voltar
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <Kidzz size={200} mood="happy" reactive={false} />
              <h2 style={{ fontFamily: display, fontSize: 32, fontWeight: 800, color: C.deep, marginTop: 16 }}>
                Quase lá... ✨
              </h2>
              <p style={{ color: C.inkSoft, marginTop: 8 }}>Role para ver seu resultado.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      {quizDone && (
        <section
          id="capture"
          style={{
            padding: "100px 24px",
            background: `linear-gradient(180deg, #FBEDD6 0%, ${C.cream} 100%)`,
          }}
        >
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            {!emailSubmitted ? (
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{ fontFamily: display, fontWeight: 800, fontSize: "clamp(28px, 4vw, 42px)", color: C.deep, letterSpacing: "-0.015em" }}
                >
                  Seu resultado está pronto! 🎉
                </motion.h2>
                <p style={{ color: C.inkSoft, fontSize: 17, marginTop: 14, lineHeight: 1.5 }}>
                  Vamos te mostrar o retrato da sua família hoje — e o caminho pra transformar telas em conexão. Pra onde
                  enviamos?
                </p>
                <form
                  onSubmit={submitEmail}
                  style={{
                    marginTop: 28,
                    background: "#fff",
                    padding: 24,
                    borderRadius: 24,
                    boxShadow: "0 24px 60px rgba(27,58,47,0.12)",
                    display: "grid",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <Input placeholder="Seu primeiro nome (opcional)" value={firstName} onChange={setFirstName} />
                  <Input placeholder="seu@email.com" value={email} onChange={setEmail} type="email" required />
                  <PrimaryButton type="submit" full>
                    Ver meu resultado ✨
                  </PrimaryButton>
                  <p style={{ color: C.inkMuted, fontSize: 12, textAlign: "center", margin: "4px 0 0" }}>
                    Sem spam. Só o seu resultado e dicas de verdade.
                  </p>
                </form>
              </>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: C.sageDark, fontWeight: 700 }}>
                ✓ Recebido! Role para baixo.
              </motion.p>
            )}
          </div>
        </section>
      )}

      {/* RESULT */}
      {emailSubmitted && (
        <section id="resultado" style={{ padding: "100px 24px", background: C.deep, color: C.cream, position: "relative", overflow: "hidden" }}>
          <Fireflies count={18} color={C.gold} />
          <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(226,182,76,0.18)",
                color: C.gold,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 0.4,
              }}
            >
              {firstName ? `${firstName.toUpperCase()}, ` : ""}SEU RETRATO DE HOJE
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: "clamp(32px, 5vw, 52px)",
                marginTop: 18,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              A sua família precisa de mais <span style={{ color: C.gold }}>momentos que ficam.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontSize: 19, lineHeight: 1.6, color: "rgba(255,248,240,0.85)", marginTop: 22, maxWidth: 680, marginLeft: "auto", marginRight: "auto" }}
            >
              Você ama, mas a rotina cansa. As telas viraram muleta e fonte de culpa. A boa notícia: dá pra mudar o clima
              da sua casa começando hoje — sem mais uma obrigação na sua lista.
            </motion.p>
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
              <Kidzz size={260} mood="happy" reactive={false} />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color: C.gold }}
            >
              "O Kidzz transforma o tempo de tela do seu filho em curiosidade, calma e vínculo."
            </motion.p>
            <div style={{ marginTop: 28 }}>
              <PrimaryButton onClick={() => goApp("result_cta")}>Conhecer o Kidzz ✨</PrimaryButton>
            </div>
          </div>
        </section>
      )}

      {/* SOLUÇÃO */}
      <section id="solucao" style={{ padding: "120px 24px", background: C.cream }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="A solução"
            title="Três forças que cabem no bolso da família."
            subtitle="Tudo em português do Brasil, com cuidado emocional e na medida da idade."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 56 }}>
            <FeatureCard
              emoji="🧠"
              color={C.amber}
              title="Responde"
              text="Curiosidade que vira conversa. O Kidzz responde qualquer pergunta do seu filho com carinho e na medida da idade."
            />
            <FeatureCard
              emoji="📖"
              color={C.sage}
              title="Acolhe"
              text="Histórias onde seu filho é o herói, narradas com voz real em português — pra imaginar e dormir em paz."
            />
            <FeatureCard
              emoji="🌙"
              color={C.gold}
              title="Acalma"
              text="Respiração e rituais de sono pros momentos em que a criança (e você) precisam de calma."
            />
          </div>
        </div>
      </section>

      {/* DEMO */}
      <DemoSection />

      {/* FOR PARENTS */}
      <section style={{ padding: "120px 24px", background: C.cream }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(30px, 4vw, 46px)",
              fontWeight: 800,
              color: C.deep,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            Você não está comprando um joguinho. Está investindo no desenvolvimento e na conexão com seu filho.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 56 }}>
            {[
              { i: "🛡️", t: "Seguro e sem anúncios" },
              { i: "💛", t: "Cuidado emocional" },
              { i: "🎙️", t: "Voz em PT-BR" },
              { i: "🇧🇷", t: "Feito no Brasil" },
            ].map((b) => (
              <div
                key={b.t}
                style={{
                  padding: "24px 18px",
                  background: "#fff",
                  borderRadius: 18,
                  border: `1px solid ${C.sage}22`,
                  boxShadow: "0 8px 24px rgba(27,58,47,0.05)",
                }}
              >
                <div style={{ fontSize: 32 }}>{b.i}</div>
                <div style={{ marginTop: 10, fontWeight: 700, color: C.deep, fontSize: 15 }}>{b.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />


      {/* FINAL CTA */}
      <section style={{ padding: "120px 24px", background: C.deep, color: C.cream, position: "relative", overflow: "hidden" }}>
        <Fireflies count={20} color={C.gold} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <Kidzz size={240} mood="wave" reactive={false} />
          <h2
            style={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: "clamp(32px, 5vw, 52px)",
              marginTop: 20,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            A infância passa rápido. Faça dela uma jornada de descobertas — juntos.
          </h2>
          <div style={{ marginTop: 36 }}>
            <PrimaryButton onClick={() => goApp("final_cta")}>Começar agora ✨</PrimaryButton>
          </div>
        </div>
      </section>

      <Footer />

      {/* responsive helpers */}
      <style>{`
        @media (max-width: 820px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid > div:last-child { order: -1; }
          .hero-grid h1, .hero-grid p { margin-left: auto !important; margin-right: auto !important; }
          .hero-grid .cta-row, .hero-grid .meta-row { justify-content: center !important; }
          .quiz-grid { grid-template-columns: 1fr !important; }
          .quiz-kiko { display: none !important; }
        }
      `}</style>
    </main>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function Nav({ onCta }: { onCta: () => void }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(14px)",
        background: "rgba(255,248,240,0.78)",
        borderBottom: `1px solid ${C.sage}22`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.amber}, ${C.gold})`,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 18,
              fontFamily: display,
              boxShadow: `0 6px 18px ${C.amber}55`,
            }}
          >
            K
          </div>
          <span style={{ fontFamily: display, fontWeight: 800, fontSize: 20, color: C.deep, letterSpacing: "-0.01em" }}>
            Kidzz
          </span>
        </div>
        <button
          onClick={onCta}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            background: C.amber,
            color: "#fff",
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: `0 6px 16px ${C.amber}55`,
          }}
        >
          Fazer o teste
        </button>
      </div>
    </header>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  full,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  full?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: `0 18px 36px ${C.amber}66` }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{
        padding: "16px 28px",
        borderRadius: 16,
        background: `linear-gradient(180deg, ${C.amber}, ${C.amberDark})`,
        color: "#fff",
        border: "none",
        fontWeight: 800,
        fontSize: 17,
        cursor: "pointer",
        boxShadow: `0 10px 24px ${C.amber}55, inset 0 1px 0 rgba(255,255,255,0.3)`,
        fontFamily: display,
        letterSpacing: "-0.005em",
        width: full ? "100%" : "auto",
      }}
    >
      {children}
    </motion.button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        padding: "16px 24px",
        borderRadius: 16,
        background: "transparent",
        color: C.deep,
        border: `2px solid ${C.deep}33`,
        fontWeight: 700,
        fontSize: 16,
        cursor: "pointer",
        fontFamily: display,
      }}
    >
      {children}
    </motion.button>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      required={required}
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        border: `2px solid ${C.sage}33`,
        fontSize: 16,
        outline: "none",
        fontFamily: body,
        background: "#FFFCF7",
        transition: "border .2s",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = C.amber)}
      onBlur={(e) => (e.currentTarget.style.borderColor = `${C.sage}33`)}
    />
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: C.inkSoft, marginBottom: 8 }}>
        <span>{label}</span>
        <span style={{ color: C.amber }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(27,58,47,0.08)", borderRadius: 999, overflow: "hidden" }}>
        <motion.div
          initial={false}
          animate={{ width: `${value * 100}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${C.sage}, ${C.amber})` }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      {eyebrow && (
        <span
          style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 999,
            background: `${C.sage}22`,
            color: C.sageDark,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: display,
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 800,
          color: C.deep,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <p style={{ color: C.inkSoft, marginTop: 14, fontSize: 17, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ emoji, color, title, text }: { emoji: string; color: string; title: string; text: string }) {
  return (
    <TiltCard intensity={6}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          background: "#fff",
          padding: 28,
          borderRadius: 24,
          border: `1px solid ${color}22`,
          boxShadow: `0 16px 40px ${color}1f`,
          minHeight: 240,
          transform: "translateZ(0)",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: `${color}22`,
            display: "grid",
            placeItems: "center",
            fontSize: 30,
            marginBottom: 16,
          }}
        >
          {emoji}
        </div>
        <h3 style={{ fontFamily: display, fontWeight: 800, fontSize: 22, color: C.deep, margin: "0 0 10px" }}>{title}</h3>
        <p style={{ color: C.inkSoft, lineHeight: 1.55, margin: 0, fontSize: 15 }}>{text}</p>
      </motion.div>
    </TiltCard>
  );
}

function DemoSection() {
  const [msgIdx, setMsgIdx] = useState(0);
  const reduced = useReducedMotion();
  const sequence = useMemo(
    () => [
      { who: "kid", text: "Por que as estrelas brilham?" },
      { who: "kiko", text: "Porque elas são sóis gigantes muito longe! ✨" },
      { who: "kiko", text: "Quer ouvir uma história sobre uma estrelinha curiosa?" },
    ],
    [],
  );

  useEffect(() => {
    if (reduced) {
      setMsgIdx(sequence.length);
      return;
    }
    const id = setInterval(() => setMsgIdx((i) => (i >= sequence.length ? 1 : i + 1)), 2200);
    return () => clearInterval(id);
  }, [sequence, reduced]);

  return (
    <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${C.cream} 0%, #F3E7D2 100%)` }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        <div>
          <SectionHeader eyebrow="Demonstração" title="Veja o Kidzz em ação." />
          <p style={{ color: C.inkSoft, marginTop: 16, fontSize: 17, lineHeight: 1.55 }}>
            Uma conversa real entre uma criança curiosa e o Kidzz. Sem propaganda. Sem violência. Só descoberta.
          </p>
          <ul style={{ marginTop: 22, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
            {["Respostas adaptadas à idade", "Tom carinhoso e sem julgamento", "Você acompanha tudo pelo painel dos pais"].map((t) => (
              <li key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: C.deep, fontWeight: 600 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: C.sage,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                  }}
                >
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <PhoneMock>
          <div style={{ padding: 18, display: "grid", gap: 10 }}>
            {sequence.slice(0, msgIdx).map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: m.who === "kid" ? "flex-end" : "flex-start",
                  background: m.who === "kid" ? C.amber : "#fff",
                  color: m.who === "kid" ? "#fff" : C.deep,
                  padding: "12px 16px",
                  borderRadius: 18,
                  maxWidth: "85%",
                  fontSize: 14,
                  fontWeight: 500,
                  boxShadow: "0 6px 14px rgba(27,58,47,0.08)",
                }}
              >
                {m.text}
              </motion.div>
            ))}
          </div>
        </PhoneMock>
      </div>
    </section>
  );
}

function PhoneMock({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      animate={reduced ? {} : { rotateY: [-6, 6, -6], y: [0, -8, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        margin: "0 auto",
        width: 280,
        height: 560,
        borderRadius: 42,
        background: "#1b1b1b",
        padding: 12,
        boxShadow: `0 40px 80px rgba(27,58,47,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset`,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 32,
          background: `linear-gradient(180deg, ${C.cream}, #F3E7D2)`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            background: C.deep,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: C.sage }} />
          Kidzz • online
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
    </motion.div>
  );
}

function TestimonialsSection() {
  const items = [
    { quote: "A primeira vez que meu filho pediu uma história em vez de outro vídeo, eu entendi.", who: "Marina, mãe do Theo" },
    { quote: "Parece pequeno, mas mudou o clima da noite aqui em casa.", who: "Rafael, pai da Nina" },
    { quote: "É acolhedor sem parecer infantilizado. Eu uso junto com ela.", who: "Camila, mãe da Lis" },
  ];
  return (
    <section style={{ padding: "120px 24px", background: C.cream }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="Famílias reais" title="O que pais e mães estão dizendo." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 48 }}>
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                background: "#fff",
                padding: 28,
                borderRadius: 22,
                border: `1px solid ${C.sage}22`,
                boxShadow: "0 12px 30px rgba(27,58,47,0.06)",
              }}
            >
              <div style={{ color: C.gold, fontSize: 18 }}>★★★★★</div>
              <p style={{ marginTop: 14, color: C.deep, lineHeight: 1.55, fontSize: 16, fontWeight: 500 }}>"{t.quote}"</p>
              <p style={{ marginTop: 14, color: C.inkMuted, fontSize: 13, fontWeight: 700 }}>— {t.who}</p>
            </motion.div>
          ))}
        </div>
        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 20,
            textAlign: "center",
          }}
        >
          {[
            { n: "+12 mil", t: "famílias" },
            { n: "4.9★", t: "avaliação" },
            { n: "+1M", t: "perguntas respondidas" },
            { n: "98%", t: "recomendam" },
          ].map((s) => (
            <div key={s.t}>
              <div style={{ fontFamily: display, fontWeight: 800, fontSize: 32, color: C.amber, letterSpacing: "-0.02em" }}>{s.n}</div>
              <div style={{ color: C.inkMuted, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  name,
  price,
  suffix,
  perks,
  highlight,
  badge,
  onClick,
}: {
  name: string;
  price: string;
  suffix: string;
  perks: string[];
  highlight?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <TiltCard intensity={highlight ? 6 : 4}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: highlight ? `linear-gradient(180deg, #fff, #FFF4E2)` : "#fff",
          padding: 32,
          borderRadius: 24,
          border: `2px solid ${highlight ? C.gold : `${C.sage}22`}`,
          boxShadow: highlight ? `0 30px 60px ${C.gold}33` : "0 12px 30px rgba(27,58,47,0.08)",
          position: "relative",
          transform: highlight ? "scale(1.03)" : "none",
        }}
      >
        {badge && (
          <span
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              background: C.gold,
              color: C.deep,
              padding: "6px 14px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              boxShadow: `0 6px 16px ${C.gold}66`,
            }}
          >
            {badge}
          </span>
        )}
        <div style={{ fontWeight: 700, color: C.inkSoft, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>{name}</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: display, fontSize: 44, fontWeight: 800, color: C.deep, letterSpacing: "-0.02em" }}>{price}</span>
          <span style={{ color: C.inkMuted, fontWeight: 600 }}>{suffix}</span>
        </div>
        <ul style={{ marginTop: 20, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
          {perks.map((p) => (
            <li key={p} style={{ display: "flex", alignItems: "center", gap: 10, color: C.deep, fontSize: 15, fontWeight: 500 }}>
              <span style={{ color: C.sage, fontWeight: 800 }}>✓</span>
              {p}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 24 }}>
          <PrimaryButton onClick={onClick} full>
            {highlight ? "Quero o anual ✨" : "Quero o mensal"}
          </PrimaryButton>
        </div>
      </motion.div>
    </TiltCard>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "40px 24px", background: C.deep, color: "rgba(255,248,240,0.7)", fontSize: 13 }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${C.amber}, ${C.gold})`,
              color: "#fff",
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              fontFamily: display,
            }}
          >
            K
          </div>
          <span style={{ color: C.cream, fontWeight: 700 }}>Kidzz</span>
        </div>
        <nav style={{ display: "flex", gap: 22 }}>
          <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
            Privacidade
          </a>
          <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
            Termos
          </a>
          <a href="mailto:kidzz.ia@icloud.com" style={{ color: "inherit", textDecoration: "none" }}>
            Contato
          </a>
        </nav>
        <span>© 2026 Kidzz · Feito com 💛 no Brasil</span>
      </div>
    </footer>
  );
}
