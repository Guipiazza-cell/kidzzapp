import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const landBg = { url: "/lp/land-bg.jpeg" };
const landKidzz = { url: "/lp/land-kidzz.jpeg" };


/* ── Ícones (paths) ───────────────────────────────────────── */
const D = {
  screen:
    "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16h-13A1.5 1.5 0 0 1 4 14.5v-9ZM9 20h6m-3-4v4",
  storm: "M13 2 4.5 13.5H11l-1 8L19.5 10H13l0-8Z",
  moon: "M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z",
  heart:
    "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  chat:
    "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5Z",
  calm: "M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11",
  book:
    "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12ZM11 4v15m2-15v15",
  puzzle:
    "M9.5 4.5a2 2 0 1 1 4 0H16a1.5 1.5 0 0 1 1.5 1.5v2.5a2 2 0 1 1 0 4V15A1.5 1.5 0 0 1 16 16.5h-2.5a2 2 0 1 0-4 0H7A1.5 1.5 0 0 1 5.5 15v-2.5a2 2 0 1 0 0-4V6A1.5 1.5 0 0 1 7 4.5h2.5Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8",
  film:
    "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 0v16m8-16v16M4 9.5h4m-4 5h4m8-5h4m-4 5h4",
  note:
    "M9 17.5V6.8a1 1 0 0 1 .8-1l7.4-1.4a1 1 0 0 1 1.2 1v10.1M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.4-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  cal:
    "M7 3v3m10-3v3M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18V7.5Zm0 3.2h16",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5Z",
  hands:
    "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7-6a3 3 0 0 1 0 6m4 6v-1a4 4 0 0 0-3-3.8",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
};

const STAR_PATH =
  "M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.7-5.3 2.7 1-5.8L3.5 9.2l5.9-.9Z";

const GREEN_BTN =
  "radial-gradient(130% 130% at 30% 22%,#C7E8A8,#5EA83E 55%,#3A7A26)";

const GRAD = {
  g: "radial-gradient(130% 130% at 30% 22%,#8FE0A0,#4EA35E 55%,#2E7A42)",
  teal: "radial-gradient(130% 130% at 30% 22%,#A8E8C0,#4EA88E 55%,#2E7A62)",
  purple: "radial-gradient(130% 130% at 30% 22%,#B8AEE8,#7A6ACE 55%,#4E3A9A)",
  amber: "radial-gradient(130% 130% at 30% 22%,#F5D9A8,#E0A85A 55%,#B0701A)",
  coral: "radial-gradient(130% 130% at 30% 22%,#FFD9A8,#F2823E 55%,#D9542E)",
  blue: "radial-gradient(130% 130% at 30% 22%,#A8CCF0,#5E86C0 55%,#2E5A8A)",
};

const QUESTIONS = [
  {
    key: "desafio",
    kicker: "O SEU MAIOR DESAFIO",
    icon: D.screen,
    titulo: "Qual desafio mais pesa na sua casa hoje?",
    opts: [
      { v: "tela", label: "Tempo de tela sem propósito", d: D.screen },
      { v: "birra", label: "Birras e desregulação emocional", d: D.storm },
      { v: "sono", label: "A hora de dormir é uma batalha", d: D.moon },
      { v: "conexao", label: "Falta tempo de qualidade juntos", d: D.heart },
    ],
  },
  {
    key: "noite",
    kicker: "AS NOITES",
    icon: D.moon,
    titulo: "Como costumam ser as noites com as crianças?",
    opts: [
      { v: "agitadas", label: "Agitadas, custam a desacelerar", d: D.storm },
      { v: "telas", label: "Só relaxam com telas", d: D.screen },
      { v: "medos", label: "Aparecem medos e ansiedade", d: D.heart },
      {
        v: "tranquilas",
        label: "Tranquilas, mas quero rituais melhores",
        d: D.calm,
      },
    ],
  },
  {
    key: "desejo",
    kicker: "O QUE VOCÊS QUEREM",
    icon: D.sparkle,
    titulo: "O que você mais gostaria de cultivar?",
    opts: [
      {
        v: "curiosidade",
        label: "Curiosidade e vontade de aprender",
        d: D.compass,
      },
      { v: "calma", label: "Calma e regulação emocional", d: D.calm },
      { v: "imaginacao", label: "Imaginação e criatividade", d: D.book },
      { v: "vinculo", label: "Vínculo e memórias em família", d: D.heart },
    ],
  },
  {
    key: "idade",
    kicker: "A CRIANÇA",
    icon: D.hands,
    titulo: "Qual a idade do seu filho(a)?",
    opts: [
      { v: "2-3", label: "2 a 3 anos", d: D.puzzle },
      { v: "4-5", label: "4 a 5 anos", d: D.sun },
      { v: "6-8", label: "6 a 8 anos", d: D.book },
      { v: "9+", label: "9 anos ou mais", d: D.compass },
    ],
  },
] as const;

const FT: Record<
  string,
  { nome: string; desc: string; d: string; grad: string }
> = {
  perguntas: {
    nome: "Perguntas",
    desc: "O KIDZZ responde tudo com curiosidade",
    d: D.chat,
    grad: GRAD.g,
  },
  kalm: {
    nome: "KALM",
    desc: "Respiração e calma guiadas",
    d: D.calm,
    grad: GRAD.teal,
  },
  sonhos: {
    nome: "Sonhos",
    desc: "Rituais e sons para dormir",
    d: D.moon,
    grad: GRAD.purple,
  },
  historias: {
    nome: "Histórias",
    desc: "Aventuras que acendem a imaginação",
    d: D.book,
    grad: GRAD.amber,
  },
  bora: {
    nome: "Bora!",
    desc: "Missões para sair da tela juntos",
    d: D.sun,
    grad: GRAD.coral,
  },
  memorias: {
    nome: "Memórias",
    desc: "Guardem as memórias em família",
    d: D.heart,
    grad: "radial-gradient(130% 130% at 30% 22%,#F2C0D8,#D888B0 55%,#9A3A6A)",
  },
};

const FEATURE_DEFS = [
  { nome: "Perguntas", desc: "O KIDZZ responde qualquer curiosidade no ritmo da criança.", d: D.chat, g: GRAD.g },
  { nome: "Descobrir", desc: "Explorações que levam seu filho a conhecer o mundo.", d: D.compass, g: GRAD.blue },
  { nome: "KALM", desc: "Respiração guiada e sons que acalmam em minutos.", d: D.calm, g: GRAD.teal },
  { nome: "Sonhos", desc: "Rituais e paisagens sonoras para uma noite tranquila.", d: D.moon, g: GRAD.purple },
  { nome: "Histórias", desc: "Aventuras que acendem a imaginação e o vocabulário.", d: D.book, g: GRAD.amber },
  { nome: "Brincar", desc: "Jogos e desafios pra aprender brincando junto.", d: D.puzzle, g: "radial-gradient(130% 130% at 30% 22%,#C7E8A8,#6BBF52 55%,#3E8A2E)" },
  { nome: "Bora!", desc: "Missões diárias pra sair da tela e viver junto.", d: D.sun, g: GRAD.coral },
  { nome: "Cinema", desc: "Sessões em família com curadoria por idade.", d: D.film, g: "radial-gradient(130% 130% at 30% 22%,#F5B0A8,#E0645A 55%,#B03A34)" },
  { nome: "Música", desc: "Cantigas e playlists que animam ou acalmam.", d: D.note, g: "radial-gradient(130% 130% at 30% 22%,#B0B8F0,#6E7FE8 55%,#3E4AB0)" },
  { nome: "Rotina", desc: "Ritmos e combinados que organizam o dia.", d: D.cal, g: "radial-gradient(130% 130% at 30% 22%,#A8E8C8,#4EA888 55%,#2E7A5E)" },
  { nome: "Memórias", desc: "Um álbum vivo das memórias que a família cria.", d: D.heart, g: "radial-gradient(130% 130% at 30% 22%,#F2C0D8,#D888B0 55%,#9A3A6A)" },
];

const CHIP_PALETTE = [
  { bg: "linear-gradient(150deg,rgba(210,240,180,.66),rgba(140,200,120,.46))", bd: "rgba(230,250,210,.7)", tx: "#1E4D22" },
  { bg: "linear-gradient(150deg,rgba(255,236,170,.7),rgba(240,190,90,.48))", bd: "rgba(255,240,190,.72)", tx: "#7A5A10" },
  { bg: "linear-gradient(150deg,rgba(200,224,255,.64),rgba(130,170,235,.44))", bd: "rgba(215,235,255,.68)", tx: "#274C86" },
  { bg: "linear-gradient(150deg,rgba(240,205,225,.66),rgba(210,140,180,.44))", bd: "rgba(245,220,235,.7)", tx: "#7A2E5A" },
];

const chipStyle = (c: number): CSSProperties => {
  const P = CHIP_PALETTE[c % 4];
  return {
    padding: "9px 14px",
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 900,
    color: P.tx,
    background: P.bg,
    border: "1px solid " + P.bd,
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 16px rgba(0,0,0,.24)",
    animation: "lpfloaty2 6s ease-in-out infinite",
  };
};

const LP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,600&family=Nunito:wght@600;700;800;900&display=swap');
.lp-root{font-family:'Nunito',system-ui,sans-serif}
.lp-root a{color:#8FE3AD;text-decoration:none}
.lp-root a:hover{color:#B6F0C0}
.lp-root input,.lp-root button{font-family:inherit}
@keyframes lpfloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes lpfloaty2{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-16px) rotate(3deg)}}
@keyframes lporb1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(46px,34px) scale(1.16)}}
@keyframes lporb2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-52px,-30px) scale(1.12)}}
@keyframes lpshine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(260%) skewX(-18deg)}}
@keyframes lpraysweep{0%,100%{opacity:.32;transform:translateX(-3%) rotate(-2deg)}50%{opacity:.7;transform:translateX(3%) rotate(2deg)}}
@keyframes lprise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes lppop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes lpstepin{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
@keyframes lpglowpulse{0%,100%{box-shadow:0 12px 30px rgba(40,110,40,.4),0 0 0 0 rgba(120,210,130,.5)}50%{box-shadow:0 12px 34px rgba(40,110,40,.5),0 0 0 12px rgba(120,210,130,0)}}
.lp-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:20px;align-items:center;padding:18px 0 4px;min-height:54vh}
.lp-featgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.lp-tilt{transition:transform .3s cubic-bezier(.34,1.4,.64,1)}
.lp-tilt:hover{transform:perspective(760px) rotateX(-1.5deg) rotateY(2deg) translateY(-3px)}
.lp-h1{font-size:48px}
.lp-h2{font-size:38px}
@media (max-width:860px){
  .lp-hero{grid-template-columns:1fr;gap:26px;padding-top:6px}
  .lp-featgrid{grid-template-columns:repeat(2,1fr);gap:12px}
  .lp-h1{font-size:34px}
  .lp-h2{font-size:27px}
}
@media (max-width:520px){ .lp-featgrid{grid-template-columns:1fr} }
@media (prefers-reduced-motion:reduce){
  .lp-root *{animation:none!important;transition:none!important}
}
`;

const Icon = ({ d, stroke = "#fff", size = 20, sw = 1.9 }: { d: string; stroke?: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LandingPremium() {
  const quizRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const advRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(advRef.current), []);

  const total = QUESTIONS.length;
  const cur = QUESTIONS[Math.min(step, total - 1)];
  const chosen = answers[cur.key];

  const scrollToQuiz = () => {
    const q = quizRef.current;
    if (q) window.scrollTo({ top: q.getBoundingClientRect().top + window.scrollY - 20, behavior: "smooth" });
  };

  const pick = (key: string, v: string) => {
    setAnswers((a) => ({ ...a, [key]: v }));
    clearTimeout(advRef.current);
    advRef.current = setTimeout(() => {
      setStep((s) => {
        const next = s + 1;
        if (next >= total) {
          setDone(true);
          return s;
        }
        return next;
      });
    }, 340);
  };

  const barPct = done ? 100 : Math.round((step / total) * 100 + (chosen ? (1 / total) * 100 : 0));

  const resultado = useMemo(() => {
    const A = answers;
    let p: string[] = [];
    if (A.desafio === "tela" || A.desejo === "curiosidade") p.push("perguntas", "bora");
    if (A.desafio === "birra" || A.desejo === "calma" || A.noite === "medos") p.push("kalm");
    if (A.desafio === "sono" || A.noite === "agitadas" || A.noite === "telas") p.push("sonhos");
    if (A.desejo === "imaginacao") p.push("historias");
    if (A.desafio === "conexao" || A.desejo === "vinculo") p.push("memorias", "perguntas");
    if (!p.length) p = ["perguntas", "kalm", "sonhos"];
    p = [...new Set(p)].slice(0, 3);
    while (p.length < 3) {
      for (const k of ["perguntas", "kalm", "sonhos", "bora"]) {
        if (!p.includes(k)) { p.push(k); break; }
      }
    }
    return {
      titulo:
        A.desafio === "sono" ? "Noites mais leves, começando hoje"
        : A.desafio === "birra" ? "Mais calma para toda a família"
        : A.desafio === "conexao" ? "Reconexão em família"
        : "Curiosidade que vira conexão",
      texto: "Com base nas suas respostas, montamos um caminho no KIDZZ que fala direto com o que a sua família vive agora.",
      features: p.map((k) => FT[k]),
    };
  }, [answers]);

  const dores = [
    { t: "A birra quando o tablet vai embora", d: D.storm },
    { t: "Tela demais e conversa de menos", d: D.screen },
    { t: "A hora de dormir que vira briga", d: D.moon },
  ];
  const trust = ["Sem anúncios", "Conteúdo com curadoria", "Cancele quando quiser"];
  const perguntasTopo = [
    { t: "Por que o céu é azul?", c: 0 },
    { t: "Como o avião voa?", c: 1 },
    { t: "De onde vem o arco-íris?", c: 2 },
  ];
  const perguntasBase = [
    { t: "Pra onde vai o sol de noite?", c: 1 },
    { t: "Por que o mar é salgado?", c: 3 },
    { t: "Os dinossauros existiram mesmo?", c: 0 },
    { t: "Por que a gente boceja?", c: 2 },
  ];

  const ctaLabel = sent ? "✓ Pronto! Enviamos o acesso" : email.trim() ? "Criar minha conta grátis" : "Começar grátis agora";

  return (
    <div
      className="lp-root"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        color: "#FBF4E4",
        background: "radial-gradient(130% 90% at 50% -8%,#3E5E2A 0%,#2E4A1F 46%,#1A2E12 100%)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: LP_CSS }} />

      <div style={{ position: "absolute", top: "-4%", left: "-4%", width: "108%", height: "74%", backgroundImage: `url('${landBg.url}')`, backgroundSize: "cover", backgroundPosition: "center 34%", filter: "blur(3px) saturate(1.15) brightness(.9)", opacity: 0.55, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg,rgba(20,38,16,.34) 0%,rgba(22,42,20,.1) 22%,rgba(18,34,14,.5) 62%,rgba(13,26,10,.92) 100%)" }} />
      <div style={{ position: "absolute", top: -120, left: -120, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(150,220,130,.3),transparent 66%)", filter: "blur(38px)", animation: "lporb1 15s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "12%", right: -140, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,194,78,.2),transparent 66%)", filter: "blur(40px)", animation: "lporb2 19s ease-in-out 2s infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-8%", left: "8%", width: "70%", height: "70%", pointerEvents: "none", background: "conic-gradient(from 200deg at 32% 0%,rgba(255,238,170,.24),transparent 22%,rgba(255,232,150,.14) 40%,transparent 62%)", filter: "blur(14px)", mixBlendMode: "screen", animation: "lpraysweep 12s ease-in-out infinite" }} />

      <div style={{ position: "relative", zIndex: 5, maxWidth: 1120, margin: "0 auto", padding: "0 22px" }}>
        {/* NAV */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 0 8px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".3px", color: "rgba(224,236,208,.62)" }}>
            Para famílias de 2 a 12 anos
          </div>
          <button onClick={scrollToQuiz} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, cursor: "pointer", border: "1px solid rgba(200,240,170,.5)", color: "#153A16", fontWeight: 900, fontSize: 14, background: GREEN_BTN, boxShadow: "0 10px 24px rgba(40,110,40,.4),inset 0 1.5px 1px rgba(255,255,255,.5)", transition: "transform .2s" }}>
            Começar grátis
            <Icon d="m9 6 6 6-6 6" stroke="#153A16" size={15} sw={2.4} />
          </button>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div style={{ animation: "lprise .7s cubic-bezier(.22,1,.36,1) both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 15px", borderRadius: 999, marginBottom: 22, background: "rgba(255,248,228,.12)", border: "1px solid rgba(255,240,200,.3)", backdropFilter: "blur(10px)", fontSize: 12.5, fontWeight: 900, letterSpacing: ".4px", color: "#F2EAD8" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5C24E" aria-hidden><path d={STAR_PATH} /></svg>
              Feito por um pai brasileiro que sabe o que as crianças realmente precisam
            </div>
            <h1 className="lp-h1" style={{ margin: "0 0 14px", fontFamily: "'Lora',serif", fontWeight: 600, lineHeight: 1.02, letterSpacing: "-1.2px", color: "#FBF4E4", textShadow: "0 3px 18px rgba(0,0,0,.4)" }}>
              Desligue a tela,<br />ligue a <span style={{ color: "#8FE3AD" }}>infância</span>.
            </h1>
            <p style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, lineHeight: 1.45, color: "rgba(238,232,214,.82)", maxWidth: 448 }}>
              Aquela birra quando você tira o tablet? A noite que vira briga pra dormir? O KIDZZ é o amiguinho camaleão que responde as perguntas do seu filho, acalma a hora do sono e traz a família pra perto de novo.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18, maxWidth: 432 }}>
              {dores.map((p) => (
                <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 14, background: "rgba(255,248,228,.07)", border: "1px solid rgba(255,240,200,.16)" }}>
                  <div style={{ flex: "none", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(240,140,110,.2)", border: "1px solid rgba(240,150,120,.3)" }}>
                    <Icon d={p.d} stroke="#F0A08A" size={16} />
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "rgba(238,232,214,.86)" }}>{p.t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button onClick={scrollToQuiz} style={{ display: "flex", alignItems: "center", gap: 10, padding: "17px 28px", borderRadius: 18, cursor: "pointer", border: "1px solid rgba(200,240,170,.55)", color: "#153A16", fontWeight: 900, fontSize: 16, background: GREEN_BTN, animation: "lpglowpulse 3s ease-in-out infinite", transition: "transform .2s" }}>
                Responda essas perguntas em 30 segundos
                <Icon d="M5 12h14m-6-6 6 6-6 6" stroke="#153A16" size={18} sw={2.4} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(150deg,#F2A97C,#D97A4E)", border: "2px solid #24401F", marginRight: -10 }} />
                  <span style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(150deg,#8FCF66,#3E8A2E)", border: "2px solid #24401F", marginRight: -10 }} />
                  <span style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(150deg,#C9A8E8,#9A6ACE)", border: "2px solid #24401F" }} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1.25, color: "rgba(230,240,214,.72)" }}>Muitas famílias já brincam juntas</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 16, flexWrap: "wrap" }}>
              {trust.map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 800, color: "rgba(224,236,208,.7)" }}>
                  <Icon d="m5 13 4 4L19 7" stroke="#8FE3AD" size={16} sw={2.4} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", animation: "lprise .7s cubic-bezier(.22,1,.36,1) .12s both" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 14 }}>
              {perguntasTopo.map((q) => (<div key={q.t} style={chipStyle(q.c)}>{q.t}</div>))}
            </div>

            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "1209/880", border: "1px solid rgba(255,228,160,.34)", boxShadow: "0 30px 70px rgba(0,0,0,.5),inset 0 2px 0 rgba(255,240,200,.2)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent,rgba(255,244,210,.16) 50%,transparent)", animation: "lpshine 8s ease-in-out infinite", zIndex: 3 }} />
              <img src={landKidzz.url} alt="KIDZZ, o camaleão, chamando a família pra floresta" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", animation: "lpfloaty 7s ease-in-out infinite" }} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 14 }}>
              {perguntasBase.map((q) => (<div key={q.t} style={chipStyle(q.c)}>{q.t}</div>))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 14, padding: "11px 16px", borderRadius: 16, background: "rgba(18,34,14,.42)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,240,200,.22)" }}>
              <div style={{ flex: "none", width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%,#B6F0C0,#4EA35E 60%,#2E7A42)", boxShadow: "0 4px 10px rgba(40,110,60,.4)" }}>
                <Icon d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 1 0-7 0v5A3.5 3.5 0 0 0 12 15Zm6-4a6 6 0 0 1-12 0m6 6v3.5" size={17} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#F2EAD8", lineHeight: 1.3 }}>
                Seu filho pergunta por voz ou texto, e o KIDZZ responde no jeitinho de criança.
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "center", padding: "2px 0 30px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.6 }}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, color: "#B6D0A6" }}>DESCUBRA COMO</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "lpfloaty 2.4s ease-in-out infinite" }} aria-hidden>
              <path d="M12 5v14m-6-6 6 6 6-6" stroke="#B6D0A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* QUIZ */}
        <section ref={quizRef} style={{ padding: "20px 0 70px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 30px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, marginBottom: 16, background: "rgba(200,240,170,.14)", border: "1px solid rgba(200,240,170,.34)", fontSize: 12, fontWeight: 900, letterSpacing: ".6px", color: "#B6E89A" }}>
              QUIZ DA FAMÍLIA · 30 SEGUNDOS
            </div>
            <h2 className="lp-h2" style={{ margin: "0 0 10px", fontFamily: "'Lora',serif", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-.6px", color: "#FBF4E4" }}>
              Descubra o que a sua família precisa
            </h2>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "rgba(230,240,214,.72)" }}>
              Responda 4 perguntas rápidas e veja como o KIDZZ resolve, sem precisar de cadastro pra começar.
            </p>
          </div>

          <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", borderRadius: 30, overflow: "hidden", background: "linear-gradient(155deg,rgba(90,74,48,.5),rgba(46,38,24,.42))", backdropFilter: "blur(22px) saturate(150%)", border: "1px solid rgba(255,228,160,.3)", boxShadow: "0 26px 60px rgba(0,0,0,.46),inset 0 2px 0 rgba(255,240,200,.2)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent,rgba(255,244,210,.1) 50%,transparent)", animation: "lpshine 9s ease-in-out infinite", zIndex: 2 }} />
            <div style={{ position: "relative", zIndex: 3, padding: "24px 26px 28px" }}>
              {!done ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 99, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: barPct + "%", borderRadius: 99, background: "linear-gradient(90deg,#5EA83E,#8FCF66,#C7E8A8)", transition: "width .5s cubic-bezier(.22,1,.36,1)", boxShadow: "0 0 12px rgba(120,200,100,.6)" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#B6E89A", whiteSpace: "nowrap" }}>
                      {Math.min(step + 1, total)} / {total}
                    </span>
                  </div>

                  <div key={"q" + step} style={{ animation: "lpstepin .4s cubic-bezier(.22,1,.36,1) both" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
                      <div style={{ flex: "none", width: 40, height: 40, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: GREEN_BTN, border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 6px 14px rgba(40,110,40,.4),inset 0 1px 1px rgba(255,255,255,.5)" }}>
                        <Icon d={cur.icon} size={21} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, color: "#9EC98A" }}>{cur.kicker}</div>
                    </div>
                    <h3 style={{ margin: "0 0 20px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 25, lineHeight: 1.15, color: "#FBF4E4" }}>{cur.titulo}</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {cur.opts.map((o) => {
                        const on = chosen === o.v;
                        return (
                          <button key={o.v} onClick={() => pick(cur.key, o.v)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 16px", borderRadius: 16, cursor: "pointer", textAlign: "left", color: on ? "#FBF4E4" : "#E8EEDC", transition: "transform .15s, background .25s, border .25s", border: on ? "1px solid rgba(200,240,170,.7)" : "1px solid rgba(255,240,200,.2)", background: on ? "linear-gradient(150deg,rgba(120,200,90,.4),rgba(60,140,50,.3))" : "rgba(255,248,228,.08)", boxShadow: on ? "0 10px 24px rgba(40,110,40,.34), inset 0 1px 0 rgba(255,255,255,.25)" : "inset 0 1px 0 rgba(255,255,255,.08)" }}>
                            <div style={{ flex: "none", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .25s", background: on ? GREEN_BTN : "rgba(255,255,255,.1)", border: on ? "1px solid rgba(255,255,255,.5)" : "1px solid rgba(255,255,255,.14)", boxShadow: on ? "0 4px 10px rgba(40,110,40,.4), inset 0 1px 1px rgba(255,255,255,.5)" : "none" }}>
                              <Icon d={o.d} stroke={on ? "#fff" : "#8AA97A"} />
                            </div>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, lineHeight: 1.25 }}>{o.label}</span>
                            <div style={{ flex: "none", width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(.5)", transition: "all .3s cubic-bezier(.34,1.6,.64,1)", background: "radial-gradient(130% 130% at 30% 22%,#C7E8A8,#4EA35E 60%,#2E7A42)", boxShadow: "0 3px 8px rgba(40,110,40,.4)" }}>
                              <Icon d="m5 13 4 4L19 7" size={14} sw={2.6} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
                      <button onClick={() => { setStep((s) => Math.max(0, s - 1)); setDone(false); }} style={{ display: step > 0 ? "flex" : "none", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, cursor: "pointer", border: "1px solid rgba(255,240,200,.24)", background: "rgba(255,248,228,.08)", color: "rgba(230,240,214,.8)", fontWeight: 800, fontSize: 13 }}>
                        <Icon d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" size={15} sw={2.2} />
                        Voltar
                      </button>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: "rgba(220,232,204,.5)" }}>Sem respostas certas ou erradas 🌿</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ animation: "lpstepin .5s cubic-bezier(.22,1,.36,1) both" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 22 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, background: GREEN_BTN, border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 10px 24px rgba(40,110,40,.45),inset 0 1.5px 2px rgba(255,255,255,.5)", animation: "lppop .5s both" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden><path d={STAR_PATH} fill="rgba(255,255,255,.25)" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, color: "#9EC98A", marginBottom: 6 }}>O PLANO DA SUA FAMÍLIA</div>
                    <h3 style={{ margin: "0 0 8px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 28, lineHeight: 1.1, color: "#FBF4E4" }}>{resultado.titulo}</h3>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.5, color: "rgba(232,240,216,.78)", maxWidth: 420 }}>{resultado.texto}</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 22 }}>
                    {resultado.features.map((f) => (
                      <div key={f.nome} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 15px", borderRadius: 18, background: "linear-gradient(150deg,rgba(246,238,214,.9),rgba(228,214,180,.8))", border: "1px solid rgba(255,248,228,.6)", boxShadow: "0 10px 22px rgba(40,50,20,.2)" }}>
                        <div style={{ flex: "none", width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: f.grad, border: "1px solid rgba(255,255,255,.6)", boxShadow: "0 6px 14px rgba(0,0,0,.16),inset 0 1px 2px rgba(255,255,255,.6)" }}>
                          <Icon d={f.d} size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 16, color: "#26401E" }}>{f.nome}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#5E7A50", marginTop: 1 }}>{f.desc}</div>
                        </div>
                        <Icon d="m9 6 6 6-6 6" stroke="#7AA05E" size={18} sw={2.2} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu melhor e-mail"
                      type="email"
                      aria-label="Seu melhor e-mail"
                      style={{ width: "100%", boxSizing: "border-box", padding: 16, borderRadius: 15, border: "1px solid rgba(255,240,200,.34)", background: "rgba(255,248,228,.14)", fontSize: 14, fontWeight: 700, color: "#F6EFDD", outline: "none", boxShadow: "inset 0 2px 6px rgba(0,0,0,.16)" }}
                    />
                    <button
                      onClick={() => {
                        if (!email.trim() || !/@/.test(email)) return;
                        setSent(true);
                        window.location.href = "/auth?email=" + encodeURIComponent(email.trim());
                      }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 17, borderRadius: 16, cursor: "pointer", border: "1px solid rgba(200,240,170,.55)", color: "#153A16", fontWeight: 900, fontSize: 16, background: GREEN_BTN, boxShadow: "0 12px 28px rgba(40,110,40,.45),inset 0 1.5px 1px rgba(255,255,255,.5)", transition: "transform .2s" }}
                    >
                      {ctaLabel}
                      <Icon d="M5 12h14m-6-6 6 6-6 6" stroke="#153A16" size={18} sw={2.4} />
                    </button>
                    <button onClick={() => { setStep(0); setAnswers({}); setDone(false); scrollToQuiz(); }} style={{ alignSelf: "center", marginTop: 4, padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 800, color: "rgba(220,232,204,.6)" }}>
                      ↺ Refazer o quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: "20px 0 60px" }}>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 34px" }}>
            <h2 className="lp-h2" style={{ margin: "0 0 10px", fontFamily: "'Lora',serif", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-.5px", color: "#FBF4E4" }}>
              Tudo o que a família precisa, num lugar só
            </h2>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "rgba(230,240,214,.72)" }}>
              Todos os mundos KIDZZ, um para cada momento do dia, da curiosidade da manhã ao sono da noite.
            </p>
          </div>
          <div className="lp-featgrid">
            {FEATURE_DEFS.map((f) => (
              <div key={f.nome} className="lp-tilt" style={{ position: "relative", overflow: "hidden", padding: "20px 18px 22px", borderRadius: 22, border: "1px solid rgba(255,240,200,.2)", background: "linear-gradient(155deg,rgba(90,74,48,.42),rgba(46,38,24,.34))", backdropFilter: "blur(16px) saturate(150%)", boxShadow: "0 16px 34px rgba(0,0,0,.34), inset 0 1.5px 0 rgba(255,240,200,.16)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "46%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent,rgba(255,255,255,.12) 50%,transparent)", animation: "lpshine 8s ease-in-out infinite", zIndex: 2 }} />
                <div style={{ width: 50, height: 50, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 3, background: f.g, border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 8px 18px rgba(0,0,0,.24), inset 0 1.5px 2px rgba(255,255,255,.5)" }}>
                  <Icon d={f.d} size={24} />
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#FBF4E4", marginTop: 16, position: "relative", zIndex: 3 }}>{f.nome}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, color: "rgba(228,236,214,.7)", marginTop: 5, position: "relative", zIndex: 3 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DEPOIMENTO */}
        <section style={{ padding: "10px 0 70px" }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: "44px 40px", textAlign: "center", background: "linear-gradient(150deg,rgba(96,78,50,.5),rgba(52,42,26,.42))", backdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,228,160,.32)", boxShadow: "0 26px 60px rgba(0,0,0,.46),inset 0 2px 0 rgba(255,240,200,.22)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent,rgba(255,244,210,.12) 50%,transparent)", animation: "lpshine 9s ease-in-out infinite" }} />
            <div style={{ position: "relative", zIndex: 3 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="#F5C24E" aria-hidden><path d={STAR_PATH} /></svg>
                ))}
              </div>
              <p style={{ margin: "0 auto 20px", maxWidth: 600, fontFamily: "'Lora',serif", fontWeight: 500, fontStyle: "italic", fontSize: 23, lineHeight: 1.4, color: "#FBF4E4" }}>
                “Meu filho parou de pedir o tablet e começou a me perguntar sobre o mundo. O KIDZZ virou nosso momento juntos.”
              </p>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#B6E89A" }}>Marina · mãe da Alice, 6 anos</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: "0 0 80px" }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: "48px 40px", textAlign: "center", background: "radial-gradient(120% 120% at 50% 0%,rgba(94,168,62,.34),rgba(46,122,66,.2))", border: "1px solid rgba(200,240,170,.4)", boxShadow: "0 26px 60px rgba(30,80,30,.4),inset 0 2px 0 rgba(255,255,255,.2)" }}>
            <h2 className="lp-h2" style={{ margin: "0 0 12px", fontFamily: "'Lora',serif", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-.8px", color: "#FBF4E4", textShadow: "0 2px 14px rgba(0,0,0,.3)" }}>
              Comece hoje a brincar juntos
            </h2>
            <p style={{ margin: "0 auto 26px", maxWidth: 460, fontSize: 16, fontWeight: 700, color: "rgba(240,248,228,.85)" }}>
              Grátis para começar. Cancele quando quiser.
            </p>
            <button onClick={scrollToQuiz} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 34px", borderRadius: 18, cursor: "pointer", border: "1px solid rgba(255,255,255,.6)", color: "#153A16", fontWeight: 900, fontSize: 17, background: "linear-gradient(160deg,#F1F7EC,#CFE4C2)", boxShadow: "0 14px 32px rgba(0,0,0,.34),inset 0 1.5px 1px rgba(255,255,255,.8)", transition: "transform .2s" }}>
              Fazer o quiz e começar
              <Icon d="M5 12h14m-6-6 6 6-6 6" stroke="#153A16" size={18} sw={2.4} />
            </button>
          </div>
        </section>

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 40, flexWrap: "wrap", gap: 14, borderTop: "1px solid rgba(200,224,180,.14)", paddingTop: 26 }}>
          <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 22, letterSpacing: 3, background: "linear-gradient(180deg,#CFF29A,#3E8A2E)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>KIDZZ</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "rgba(220,232,204,.5)" }}>© 2026 KIDZZ · Desligue a tela, ligue a infância</div>
          <div style={{ display: "flex", gap: 20, fontSize: 13, fontWeight: 800, color: "rgba(224,236,208,.66)" }}>
            <a href="/privacy">Privacidade</a>
            <a href="mailto:kidzz.ia@icloud.com">Contato</a>
            <a href="/auth">Entrar</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
