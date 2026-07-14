import { useState, useCallback, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library } from "lucide-react";
import KidzzHeader from "@/components/common/KidzzHeader";
import AvatarCustomization from "./AvatarCustomization";
import PersonalizationPanel, { StoryIntent, EnsinarSub, VoiceRate } from "./PersonalizationPanel";
import StoryDisplay from "./StoryDisplay";
import GeneratingOverlay from "./GeneratingOverlay";
import StoryGallery from "./StoryGallery";
import ParentalGate from "@/components/ParentalGate";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import { toast } from "sonner";
import { ChildAvatar } from "@/types/story";
import { completeMissionStep, addXp, bumpSessionActions } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`;

type Step = "intro" | "avatar" | "form" | "display";

// Marca por sessão — pai não precisa digitar PIN toda vez que voltar pra Fábrica.
const SESSION_GATE_KEY = "kidzz_story_factory_gate_ok";

/* ── SVG paths (portados do design Historias.dc.html) ── */
const D = {
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12ZM11 4v15m2-15v15",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 10h.01m6.99 0h.01M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8",
  star: "M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.7-5.3 2.7 1-5.8L3.5 9.7l5.9-.9Z",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5Z",
  note: "M9 17.5V6.8a1 1 0 0 1 .8-1l7.4-1.4a1 1 0 0 1 1.2 1v10.1M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.4-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  sparkle: "M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z",
};

/* ── Helpers de estilo (valores exatos do design) ── */
const cardBase: CSSProperties = {
  position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 11,
  borderRadius: 20, padding: "11px 12px", textAlign: "left", fontFamily: "'Nunito',sans-serif",
  transition: "transform .3s cubic-bezier(.34,1.4,.64,1)",
  background: "linear-gradient(155deg,rgba(255,253,247,.9),rgba(250,240,222,.62))",
  backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
  border: "1px solid rgba(255,255,255,1)",
  boxShadow: "0 10px 22px rgba(150,95,20,.14), inset 0 1.5px 0 rgba(255,255,255,1)",
};
const gloss = (l: string, m: string, d: string): CSSProperties => ({
  flex: "none", width: 42, height: 42, borderRadius: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${l} 18%, ${m} 58%, ${d} 100%)`,
  boxShadow: "0 6px 14px rgba(150,95,20,.25), inset 0 1.5px 2px rgba(255,255,255,.7), inset 0 -4px 8px rgba(0,0,0,.16)",
});

const Icon = ({ d, stroke = "#fff", size = 20, sw = 1.9 }: { d: string; stroke?: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Passos reais da Fábrica (avatar → palavras → objetivo → narração),
   apresentados com o cartão de vidro + ícone glossy do design. */
const STEPS: { d: string; g: [string, string, string]; title: string; sub: string }[] = [
  { d: D.smile, g: ["#FFD9A8", "#F0A24C", "#C77E1E"], title: "Monte o avatar", sub: "O rosto e o jeitinho do seu filho" },
  { d: D.star, g: ["#FFE9A8", "#F2C24C", "#C98F1E"], title: "Escolha palavras-chave", sub: "O mundo e os interesses dele" },
  { d: D.compass, g: ["#C0EDC8", "#5CB57A", "#2F7A4E"], title: "Diga o objetivo", sub: "O que a história precisa entregar" },
  { d: D.note, g: ["#D2CCF0", "#8A7AD8", "#5E4EA8"], title: "Narração suave", sub: "Voz feminina que embala e acalma" },
];

const HERO_BG = "linear-gradient(180deg,#FAF1DF 0%,#F3E6CC 42%,#EBDABA 75%,#E2CDA4 100%)";
const DEFAULT_BG = "linear-gradient(180deg,#FDF8EE 0%, #F2EFE6 100%)";

const StoryFactory = ({ onBack }: {onBack: () => void;}) => {
  const { session, profile, tier, canGenerateStory, storiesRemaining, incrementStories } = useAuth();
  const { speak } = useTTS();
  const { addMemory } = useMemories();
  const childName = profile?.child_name || "amigo";
  const childAge = (() => {
    const r = profile?.age_range || "3-7";
    const first = parseInt(String(r).split("-")[0]) || 5;
    return Math.min(10, Math.max(3, first));
  })();

  const [step, setStep] = useState<Step>("intro");
  const [avatar, setAvatar] = useState<ChildAvatar | null>(null);
  const [story, setStory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gatePassed, setGatePassed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(SESSION_GATE_KEY) === "1"; } catch { return false; }
  });
  // Guarda o rate de voz escolhido no painel pra reutilizar na narração
  const voiceRateRef = useRef<number>(0.88);

  const requireGate = useCallback((cb: () => void) => {
    if (gatePassed) { cb(); return; }
    setGateOpen(true);
    // armazena callback via micro-state — usamos efeito simples: depois do gate, abre próximo step
    pendingAfterGate.current = cb;
  }, [gatePassed]);

  const pendingAfterGate = useRef<(() => void) | null>(null);

  const handleAvatarComplete = useCallback((a: ChildAvatar) => {
    setAvatar(a);
    setStep("form");
  }, []);

  const handleGenerate = useCallback(async (params: {
    age: number; interests: string; keywords: string[]; intent: StoryIntent; ensinarSub?: EnsinarSub; voiceRate: VoiceRate;
  }) => {
    if (!avatar) return;
    // Voz: aplica rate
    voiceRateRef.current = params.voiceRate === "lenta" ? 0.72 : 0.88;

    if (!canGenerateStory()) {
      if (tier === "free") {
        toast.info(`A primeira foi por nossa conta. 💛 Assine e crie histórias ilimitadas só do(a) ${childName}.`);
        window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "story_limit" } }));
      } else {
        toast.info("O Kidzz ficou sonolento por aqui 😴 Volte amanhã para mais histórias 💛");
      }
      return;
    }
    setIsGenerating(true);
    setProgress(3);

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const target = 92 * (1 - Math.exp(-elapsed / 25));
      setProgress((p) => Math.max(p, target));
    }, 300);

    try {
      if (!session?.access_token) {
        toast.error("Faça login para criar histórias.");
        setIsGenerating(false);
        clearInterval(timer);
        return;
      }
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          childName,
          childAvatar: avatar,
          age: params.age,
          interests: params.interests,
          keywords: params.keywords,
          intent: params.intent,
          ensinarSub: params.ensinarSub,
          ageRange: profile?.age_range || "3-7",
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro" }));
        if (resp.status === 403 && err.error === "LIMIT_REACHED") {
          window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "story_limit" } }));
          throw new Error(err.message || "Você já usou sua história gratuita.");
        }
        throw new Error(err.error || "A história fugiu, vamos tentar de novo?");
      }

      const data = await resp.json();
      setProgress(95);
      setStory(data.story);
      setImages(data.images || []);
      await incrementStories();

      try {
        const firstScene = (data.story || "").split(/\[CENA \d+\]/).filter((s: string) => s.trim())[0] || "";
        const firstSentence = firstScene.split(/[.!?\n]/)[0]?.trim() || "Aventura Mágica";
        const title = firstSentence.length > 60 ? firstSentence.slice(0, 57) + "..." : firstSentence;
        await addMemory({
          type: "story",
          title,
          content: data.story,
          is_special: false,
          image_url: data.images?.[0] || null,
          metadata: {
            age: params.age,
            interests: params.interests,
            keywords: params.keywords,
            intent: params.intent,
            scenes: data.images?.length ?? 0,
          },
        });
      } catch (e) {
        console.warn("Could not save story to memories", e);
      }

      setStep("display");
      const { newlyMarked } = completeMissionStep("story");
      if (newlyMarked) {
        const { gained } = addXp("story");
        showXpGained(gained, "história");
      }
      bumpSessionActions();
      sfx("complete");
      haptic("success");
      toast.success("História pronta! ✨");
    } catch (e: any) {
      console.error("Story generation error:", e);
      sfx("error");
      haptic("error");
      toast.error(e.message || "A história fugiu, vamos tentar de novo?");
    } finally {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setIsGenerating(false), 500);
    }
  }, [avatar, childName, profile?.age_range, canGenerateStory, incrementStories, addMemory, session, tier]);

  const handleReset = useCallback(() => {
    setStep("intro");
    setAvatar(null);
    setStory("");
    setImages([]);
  }, []);

  const handleSpeak = useCallback(async (text: string) => {
    try {
      await speak(text, { rate: voiceRateRef.current });
    } catch {
      toast.error("Erro na narração");
    }
  }, [speak]);

  const remaining = storiesRemaining();
  const badgeText = tier === "free"
    ? (remaining > 0 ? "Primeira história por nossa conta ✨" : "Assine para criar mais")
    : `${remaining} ${remaining === 1 ? "história" : "histórias"} hoje`;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      style={{ background: step === "intro" ? HERO_BG : DEFAULT_BG }}
    >
      {/* keyframes locais (prefixo hist- evita colisão global) */}
      <style>{`
        @keyframes hist-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes hist-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes hist-twinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes hist-sparklefloat{0%,100%{opacity:.15;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-14px) scale(1.12)}}
        @keyframes hist-emberfloat{0%{transform:translateY(0) scale(1);opacity:0}20%{opacity:.9}100%{transform:translateY(-40px) scale(.4);opacity:0}}
        @keyframes hist-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
        @keyframes hist-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hist-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,24px) scale(1.16)}}
        @keyframes hist-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-34px,-18px) scale(1.1)}}
      `}</style>

      {/* Orbes de luz quentes — só na tela inicial (design) */}
      {step === "intro" && (
        <>
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(45% 28% at 50% 14%,rgba(255,190,90,.18),transparent 70%),radial-gradient(42% 28% at 12% 60%,rgba(255,215,140,.16),transparent 70%),radial-gradient(50% 30% at 82% 90%,rgba(220,150,70,.12),transparent 70%)" }} />
          <div aria-hidden style={{ position: "absolute", top: -50, left: -70, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,205,120,.28),transparent 65%)", filter: "blur(30px)", animation: "hist-drift1 15s ease-in-out infinite", pointerEvents: "none" }} />
          <div aria-hidden style={{ position: "absolute", bottom: 110, right: -90, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(240,170,80,.22),transparent 65%)", filter: "blur(32px)", animation: "hist-drift2 18s ease-in-out 3s infinite", pointerEvents: "none" }} />
        </>
      )}

      <KidzzHeader
        onBack={onBack}
        right={
          <motion.button
            onClick={() => setGalleryOpen(true)}
            className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-amber-600"
            whileTap={{ scale: 0.9 }}
            aria-label="Galeria de histórias"
          >
            <Library size={18} />
          </motion.button>
        }
      />

      <div
        className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop: 12,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
        }}
      >
        {step === "intro" &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative">

            {/* ── HERO (cartão com cena + CTA) ── */}
            <div
              style={{
                position: "relative", marginTop: 8, borderRadius: 26, overflow: "hidden",
                boxShadow: "0 18px 40px rgba(150,95,20,.28),inset 0 1.5px 0 rgba(255,255,255,.5)",
                border: "1px solid rgba(255,255,255,.6)", willChange: "transform",
                animation: "hist-heroIn .7s cubic-bezier(.22,1,.36,1) both",
              }}
            >
              <div style={{ position: "relative", height: 196, overflow: "hidden" }}>
                <img
                  src="/exemplos/assets/cena-historias.png"
                  alt="Criança lendo um livro mágico"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 34%", animation: "hist-floaty 7s ease-in-out infinite", filter: "saturate(1.08) contrast(1.02)" }}
                />
                {/* fagulhas mágicas */}
                <div aria-hidden style={{ position: "absolute", top: 26, left: "38%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 10px 3px rgba(255,210,120,.85)", animation: "hist-twinkle 3s ease-in-out infinite" }} />
                <div aria-hidden style={{ position: "absolute", top: 60, left: "64%", width: 4, height: 4, borderRadius: 99, background: "#FFF3CC", boxShadow: "0 0 8px 2px rgba(255,220,140,.8)", animation: "hist-sparklefloat 4.2s ease-in-out .8s infinite" }} />
                <div aria-hidden style={{ position: "absolute", bottom: 40, left: "50%", width: 5, height: 8, borderRadius: 99, background: "#FFCF7A", boxShadow: "0 0 10px 3px rgba(255,180,80,.8)", animation: "hist-emberfloat 3.4s ease-in-out infinite" }} />
                <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg,rgba(30,18,6,.12) 0%,rgba(30,18,6,0) 40%,rgba(250,241,223,.1) 100%)" }} />
                {/* selo de saldo (dado real: storiesRemaining) */}
                <div style={{ position: "absolute", top: 12, right: 12, padding: "6px 12px", borderRadius: 999, background: "rgba(58,36,16,.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.35)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3), 0 4px 12px rgba(58,36,16,.35)", color: "#FAF1DF", fontFamily: "'Nunito',sans-serif", fontSize: 10.5, fontWeight: 900, letterSpacing: ".2px" }}>
                  {badgeText}
                </div>
              </div>

              <div style={{ padding: "16px 17px 17px", background: "linear-gradient(180deg,rgba(255,250,240,.95),rgba(250,240,222,.92))", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12Z" stroke="#D97A1E" strokeWidth="1.9" strokeLinejoin="round" /></svg>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.6px", color: "#D97A1E" }}>FÁBRICA DE HISTÓRIAS</span>
                </div>
                <h1 style={{ margin: "0 0 7px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 29, lineHeight: 1.1, color: "#3A2410", letterSpacing: "-.4px" }}>Uma história só sua</h1>
                <p style={{ margin: "0 0 15px", fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, color: "#7A5E38", maxWidth: 290 }}>
                  Criada com o nome, o rosto e o mundo do seu filho — do jeitinho que só ele merece.
                </p>
                <button
                  onClick={() => requireGate(() => setStep("avatar"))}
                  className="active:scale-[0.97]"
                  style={{ position: "relative", overflow: "hidden", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: 14, borderRadius: 999, cursor: "pointer", background: "radial-gradient(130% 130% at 30% 22%,#FFD98A 0%,#F2A62B 52%,#D97A1E 100%)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 10px 24px rgba(180,110,20,.4),inset 0 1.5px 1px rgba(255,255,255,.7),inset 0 -5px 10px rgba(150,80,0,.3)", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: ".6px", color: "#FFF6E6", transition: "transform .2s" }}
                >
                  <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.35) 50%,transparent 100%)", animation: "hist-shine 5s ease-in-out infinite" }} />
                  <span style={{ display: "inline-flex", filter: "drop-shadow(0 1px 1.5px rgba(120,60,0,.28))" }}>
                    <Icon d={D.sparkle} stroke="#FFF6E6" size={16} />
                  </span>
                  CRIAR MINHA HISTÓRIA
                  <span style={{ display: "inline-flex", filter: "drop-shadow(0 1px 1.5px rgba(120,60,0,.28))" }}>
                    <Icon d={D.arrow} stroke="#FFF6E6" size={16} sw={2.4} />
                  </span>
                </button>
              </div>
            </div>

            {/* ── COMO FUNCIONA (passos reais da Fábrica) ── */}
            <div style={{ padding: "22px 4px 12px" }}>
              <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 22, color: "#3A2410" }}>Como funciona</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  style={{ ...cardBase, animation: `hist-cascade .5s ${0.15 + i * 0.08}s both` }}
                >
                  <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.3) 50%,transparent 100%)", animation: "hist-shine 6s ease-in-out infinite" }} />
                  <div style={{ ...gloss(...s.g), position: "relative" }}>
                    {/* specular sheen no topo do ícone glossy (premium glass) */}
                    <div aria-hidden style={{ position: "absolute", top: 2, left: 4, right: 4, height: 12, borderRadius: 12, background: "linear-gradient(180deg,rgba(255,255,255,.55),transparent)", pointerEvents: "none" }} />
                    <Icon d={s.d} size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#3A2410", lineHeight: 1.15 }}>{s.title}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A6E42", lineHeight: 1.3 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Nota de proteção (Portão dos Pais) — pílula de vidro premium ── */}
            <div style={{ padding: "18px 8px 8px", display: "flex", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: 320, padding: "9px 15px", borderRadius: 999, background: "linear-gradient(160deg,rgba(255,252,244,.82),rgba(245,232,210,.5))", backdropFilter: "blur(14px) saturate(150%)", WebkitBackdropFilter: "blur(14px) saturate(150%)", border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 8px 20px rgba(150,95,20,.12), inset 0 1.5px 0 rgba(255,255,255,1)", fontSize: 11, fontWeight: 800, color: "#8A6E42", lineHeight: 1.4, textAlign: "left" }}>
                <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>🔒</span>
                <span>A personalização é feita pelos pais. A criança recebe só a história pronta.</span>
              </div>
            </div>
            <div style={{ padding: "10px 20px 4px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#A88E5E", letterSpacing: ".2px" }}>
              Narração em voz feminina suave · Fábrica KIDZZ
            </div>
          </motion.div>
        }

        {step === "avatar" && <AvatarCustomization childName={childName} onComplete={handleAvatarComplete} />}
        {step === "form" && (
          <PersonalizationPanel
            childName={childName}
            childAge={childAge}
            onGenerate={handleGenerate}
            isLoading={isGenerating}
            storiesRemaining={storiesRemaining()}
            isPremium={tier !== "free"}
            onUpgrade={() => window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "story_limit" } }))}
          />
        )}
        {step === "display" && <StoryDisplay story={story} images={images} onReset={handleReset} onSpeak={handleSpeak} isPremium={tier !== "free"} />}
      </div>

      <GeneratingOverlay open={isGenerating} progress={progress} />

      <AnimatePresence>
        {galleryOpen && <StoryGallery onClose={() => setGalleryOpen(false)} />}
      </AnimatePresence>

      {/* Portão dos Pais — protege a personalização */}
      <AnimatePresence>
        {gateOpen && (
          <ParentalGate
            onSuccess={() => {
              setGatePassed(true);
              try { sessionStorage.setItem(SESSION_GATE_KEY, "1"); } catch {}
              setGateOpen(false);
              const cb = pendingAfterGate.current;
              pendingAfterGate.current = null;
              if (cb) cb();
            }}
            onCancel={() => {
              pendingAfterGate.current = null;
              setGateOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryFactory;
