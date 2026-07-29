/**
 * KALM v2 — Sub-telas dos 6 pilares DIURNOS.
 * Nada de conteúdo noturno aqui (isso vive em Sonhos).
 * Cada pilar tem uma "cara" diferente — variedade real, não repete tipo.
 */
import {
  ArrowLeft, ChevronRight, Lock, ExternalLink, Plus,
  Heart, Wind, Cloud, Sparkles, CircleDot, Leaf, Volume2,
  Hand, Droplets, Eye, Smile, Coffee, Users, Footprints,
  MessageCircle, BookOpen, Utensils, Apple, CookingPot,
  Flower2, Sun, Waves, type LucideIcon,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { haptic } from "@/lib/haptics";
import {
  findActivity, MOTOR_TINT,
  WINS, type Activity, type Motor,
} from "./data";
import { useJar, useWins } from "./state";
import jarroGratidao from "@/assets/kidzz/jarro-gratidao.webp";
import { KALM_DOCK_CLEARANCE } from "./layout";

/* ── Paleta escura florestal (alinhada à KalmHome) ─────────── */
const ink = "#F1EEE4";
const inkSoft = "rgba(241,238,228,0.72)";
const inkMuted = "rgba(241,238,228,0.48)";
const bgDark =
  "radial-gradient(120% 50% at 50% 0%, rgba(232,185,58,0.07) 0%, transparent 55%)," +
  "linear-gradient(180deg,#0E1712 0%,#0B1310 60%,#0A110E 100%)";

const glassChrome: CSSProperties = {
  background: "linear-gradient(155deg, rgba(28,42,34,0.92), rgba(14,23,18,0.96))",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)",
};

const glassCard: CSSProperties = {
  // 100% opaco — evita o MagicalBackground claro "vazar" pelos cards
  background: "linear-gradient(165deg, #24342A, #101A14)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 12px 28px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.08)",
};

/** Shell de cada pilar: fundo opaco + folga do dock + scroll iOS nos cards */
const pillarShellStyle: CSSProperties = {
  background: bgDark,
  backgroundColor: "#0B1310",
  minHeight: "100%",
  paddingBottom: KALM_DOCK_CLEARANCE,
};

/* ── Ícones por atividade (visual real no lugar de slot vazio) ─ */
const ACTIVITY_ICON: Record<string, LucideIcon> = {
  "pausa-1min": Heart,
  "sentir-vento": Wind,
  "nuvem-macia": Cloud,
  "soltar-balao": CircleDot,
  "bolhas-magicas": CircleDot,
  "alongamento-urso": Leaf,
  "zumbido-camaleao": Volume2,
  "escuta-coracao": Heart,
  "aperta-limao": Hand,
  "frasco-calma": Sparkles,
  "cinco-sentidos": Eye,
  "tres-boas": Sun,
  "missao-bondade": Flower2,
  "caca-beleza": Sparkles,
  "festival-risada": Smile,
  "cafe-sem-culpa": Coffee,
  "massagem-amor": Hand,
  "abraco-20s": Heart,
  "maos-cuidam": Hand,
  "olhos-nos-olhos": Eye,
  "caminhada-maos": Footprints,
  "tres-gratidoes": Sparkles,
  "elogio-especifico": MessageCircle,
  "diario-uma-linha": BookOpen,
  "agua-familia": Droplets,
  "agua-com-fruta": Droplets,
  "prato-colorido": Apple,
  "cores-novas": Apple,
  "cozinhar-juntos": CookingPot,
  "refeicao-sem-tela": Utensils,
  "bacterias-boas": Leaf,
};

const MOTOR_ICON: Record<Motor, LucideIcon> = {
  corpo: Leaf,
  interocepcao: Heart,
  grounding: Waves,
  gratidao: Sparkles,
  bondade: Flower2,
  saborear: Apple,
  visualizacao: Cloud,
  toque: Hand,
  ocitocina: Heart,
  conexao: Users,
  exalacao: Wind,
  nutricao: Utensils,
  hidratacao: Droplets,
};

const activityIcon = (a: Activity): LucideIcon =>
  ACTIVITY_ICON[a.id] ?? MOTOR_ICON[a.motor] ?? Sparkles;

const TopBar = ({ title, tint, onBack }: { title: string; tint: string; onBack: () => void }) => (
  <div className="px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
    <button
      onClick={() => { haptic("light"); onBack(); }}
      aria-label="Voltar"
      className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
      style={glassChrome}
    >
      <ArrowLeft size={18} style={{ color: ink }} />
    </button>
    <div
      className="flex-1 h-11 rounded-full flex items-center justify-center px-4 text-[14px] font-bold tracking-wide"
      style={{ ...glassChrome, color: tint }}
    >
      {title}
    </div>
    <div className="w-11" />
  </div>
);

const PillarHero = ({
  kicker, title, subtitle, tint,
}: {
  kicker: string; title: string; subtitle: string; tint: string;
}) => (
  <div className="px-5 pt-1 pb-1">
    <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: tint }}>
      {kicker}
    </p>
    <h1
      className="mt-1.5 leading-[1.12]"
      style={{
        color: ink,
        fontFamily: "'Fraunces', 'Nunito', serif",
        fontSize: "clamp(26px, 7.5vw, 34px)",
      }}
    >
      {title}
    </h1>
    <p className="mt-1.5 text-[14px] leading-snug" style={{ color: inkSoft }}>
      {subtitle}
    </p>
  </div>
);

/** Card de atividade — visual sólido com ícone, sem caixa de imagem vazia */
const ActivityCard = ({
  a, onOpen, locked, isPremium,
}: {
  a: Activity;
  onOpen: () => void;
  locked?: boolean;
  isPremium: boolean;
}) => {
  const tint = MOTOR_TINT[a.motor];
  const isLocked = locked ?? (!isPremium && a.premium === true);
  const Icon = activityIcon(a);

  return (
    <button
      type="button"
      onClick={() => {
        haptic("light");
        if (isLocked) {
          window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
          return;
        }
        onOpen();
      }}
      className="text-left rounded-[22px] p-3.5 flex flex-col gap-2.5 active:scale-[0.98] transition-transform w-full"
      style={{ ...glassCard, touchAction: "pan-y" }}
      aria-label={isLocked ? `${a.title} (Premium)` : a.title}
    >
      {/* Cabeçalho visual: ícone + badges */}
      <div className="relative flex items-start justify-between gap-2">
        <div
          className="relative w-[56px] h-[56px] rounded-[16px] flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${tint}55, ${tint}18)`,
            border: `1px solid ${tint}40`,
            boxShadow: `0 8px 18px -8px ${tint}66, inset 0 1px 0 rgba(255,255,255,0.18)`,
          }}
        >
          <span
            aria-hidden
            className="absolute -top-3 -right-3 w-10 h-10 rounded-full opacity-50"
            style={{ background: `radial-gradient(circle, ${tint}, transparent 70%)` }}
          />
          <Icon size={26} strokeWidth={1.75} style={{ color: "#FFFCF5", position: "relative" }} />
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className="px-2 h-6 rounded-full text-[10.5px] font-bold flex items-center"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: ink,
            }}
          >
            {a.duration}
          </span>
          {isLocked && (
            <span
              className="px-2 h-6 rounded-full text-[10px] font-bold flex items-center gap-1"
              style={{ background: "rgba(232,130,26,0.18)", color: "#F0B060" }}
            >
              <Lock size={10} /> Premium
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 min-h-[72px]">
        <p
          className="font-bold leading-tight text-[14px]"
          style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
          {a.title}
        </p>
        <p className="text-[12px] leading-snug line-clamp-2" style={{ color: inkSoft }}>
          {a.oneLine}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[10.5px] font-semibold" style={{ color: inkMuted }}>
          {a.audience === "parent" ? "Fazer junto" : "Para a criança"}
        </span>
        <span
          className="text-[12px] font-bold inline-flex items-center gap-0.5"
          style={{ color: tint }}
        >
          {isLocked ? "Desbloquear" : "Começar"}
          <ChevronRight size={13} />
        </span>
      </div>
    </button>
  );
};

const pickIds = (ids: string[]): Activity[] =>
  ids.map(findActivity).filter((x): x is Activity => !!x);

/* ══════════════════ 1. SENTIR ══════════════════ */
export const PilarSentir = ({
  onBack, onOpen, isPremium,
}: {
  onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean;
}) => {
  const tint = "#B49CE8";
  const conversas = [
    "O que fez sua nuvem aparecer hoje?",
    "Se hoje fosse um clima, qual seria?",
    "Onde no corpo você sente a alegria?",
    "O que faria seu sol brilhar mais forte agora?",
  ];
  const respirar = pickIds(["bolhas-magicas", "zumbido-camaleao", "frasco-calma", "cinco-sentidos"]);
  const nomear = pickIds(["escuta-coracao", "aperta-limao", "soltar-balao", "sentir-vento"]);

  return (
    <div className="min-h-full" style={pillarShellStyle}>
      <TopBar title="Sentir" tint={tint} onBack={onBack} />
      <PillarHero
        kicker="Emoção"
        title="Nomear é acalmar."
        subtitle="Reconhecer o que sentimos já é metade do caminho."
        tint={tint}
      />

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: tint }}>
          Conversa da emoção
        </p>
        <p className="mt-1 text-[12.5px]" style={{ color: inkSoft }}>
          Uma pergunta pro pai/mãe conversar com o filho. Sem certo nem errado.
        </p>
        <div className="mt-3 grid gap-2">
          {conversas.map((q, i) => (
            <div
              key={i}
              className="rounded-[18px] p-3.5 flex items-start gap-3"
              style={{
                ...glassCard,
                borderLeft: `3px solid ${tint}`,
              }}
            >
              <MessageCircle size={16} className="shrink-0 mt-0.5" style={{ color: tint }} />
              <p className="text-[14px] leading-snug" style={{ color: ink }}>{q}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="text-[17px] font-bold" style={{ color: ink }}>Respirar</h2>
        <p className="text-[12.5px] mt-0.5" style={{ color: inkSoft }}>
          Quando a emoção sobe forte — 1 a 3 min.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {respirar.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="text-[17px] font-bold" style={{ color: ink }}>Sentir o corpo</h2>
        <p className="text-[12.5px] mt-0.5" style={{ color: inkSoft }}>
          Interocepção — a emoção deixa rastro no corpo.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {nomear.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════ 2. AGRADECER ══════════════════ */
export const PilarAgradecer = ({
  onBack, onOpen, isPremium,
}: {
  onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean;
}) => {
  const tint = "#F4CB55";
  const { items: jarItems, add: addJar } = useJar();
  const { today: winsToday, toggle, count } = useWins();
  const [jarText, setJarText] = useState("");

  const memoriaFeliz = jarItems.length > 3 ? jarItems[Math.min(jarItems.length - 1, 3)] : null;
  const outras = pickIds(["tres-boas", "caca-beleza", "elogio-especifico", "diario-uma-linha", "tres-gratidoes"]);

  return (
    <div className="min-h-full" style={pillarShellStyle}>
      <TopBar title="Agradecer" tint={tint} onBack={onBack} />
      <PillarHero
        kicker="Gratidão & memória"
        title="Guardar o que foi bom."
        subtitle="Saborear pequenos brilhos multiplica a alegria."
        tint={tint}
      />

      {/* Jarro com imagem real */}
      <section className="px-5 pt-5">
        <div
          className="rounded-[24px] p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg,#1A3326 0%,#0E1F18 55%,#0C1814 100%)",
            border: "1px solid rgba(244,203,85,0.22)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-[72px] h-[72px] rounded-[18px] overflow-hidden shrink-0"
              style={{
                background: "rgba(244,203,85,0.12)",
                border: "1px solid rgba(244,203,85,0.28)",
              }}
            >
              <img
                src={jarroGratidao}
                alt="Jarro de gratidão"
                className="w-full h-full object-cover"
                style={{ objectPosition: "50% 40%" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[18px] font-bold leading-tight" style={{ color: "#FFFCF8" }}>
                O que foi bom hoje?
              </h3>
              <p className="text-[12.5px] mt-1 leading-snug" style={{ color: "rgba(255,252,248,0.72)" }}>
                Uma estrelinha no jarro. Depois vocês releem juntos.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex gap-2">
            <input
              value={jarText}
              onChange={(e) => setJarText(e.target.value)}
              placeholder="Um abraço, uma risada, um obrigado..."
              className="flex-1 h-11 rounded-full px-4 text-[13px] outline-none"
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "#FFFCF8",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              aria-label="Momento de gratidão"
            />
            <button
              onClick={() => {
                if (jarText.trim()) {
                  haptic("light");
                  addJar(jarText);
                  setJarText("");
                }
              }}
              aria-label="Guardar"
              className="h-11 px-4 rounded-full font-bold text-[12.5px] flex items-center gap-1 active:scale-95 shrink-0"
              style={{ background: tint, color: "#1F1A12" }}
            >
              <Plus size={14} /> Guardar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 min-h-[24px]">
            {Array.from({ length: Math.min(jarItems.length, 24) }).map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: tint, boxShadow: `0 0 8px ${tint}88` }}
                aria-hidden
              />
            ))}
            {jarItems.length === 0 && (
              <span className="text-[12px]" style={{ color: "rgba(255,252,248,0.55)" }}>
                Seu jarro está vazio. Comece hoje.
              </span>
            )}
            {jarItems.length > 0 && (
              <span className="text-[11px] ml-1 font-semibold" style={{ color: tint }}>
                {jarItems.length} {jarItems.length === 1 ? "momento" : "momentos"}
              </span>
            )}
          </div>
        </div>
      </section>

      {memoriaFeliz && (
        <section className="px-5 pt-5">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: tint }}>
            Memória feliz
          </p>
          <div
            className="mt-2 rounded-[18px] p-4"
            style={{ ...glassCard, borderColor: `${tint}40` }}
          >
            <p className="text-[13.5px] leading-snug" style={{ color: ink }}>
              Você guardou: <em style={{ color: tint }}>"{memoriaFeliz.text}"</em>
            </p>
            <p className="mt-1 text-[11.5px]" style={{ color: inkSoft }}>Lembre-se disso hoje.</p>
          </div>
        </section>
      )}

      {/* Pequenas vitórias */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#F0A45E" }}>
            Pequenas vitórias
          </p>
          <span
            className="text-[11px] font-bold px-2.5 h-6 rounded-full flex items-center"
            style={{ background: "rgba(240,164,94,0.16)", color: "#F0A45E" }}
          >
            {count} hoje
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {WINS.map((w) => {
            const on = !!winsToday[w.id];
            return (
              <button
                key={w.id}
                onClick={() => { haptic("light"); toggle(w.id); }}
                className="rounded-2xl p-3 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                style={{
                  background: on
                    ? "linear-gradient(135deg,#7FB069,#46703A)"
                    : "linear-gradient(165deg, #24342A, #101A14)",
                  border: `1px solid ${on ? "transparent" : "rgba(255,255,255,0.10)"}`,
                  color: on ? "#fff" : ink,
                  boxShadow: on ? "0 8px 20px rgba(70,112,58,0.35)" : undefined,
                  touchAction: "pan-y",
                }}
                aria-pressed={on}
              >
                <span
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[16px] shrink-0"
                  style={{
                    background: on ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
                  }}
                  aria-hidden
                >
                  {w.emoji}
                </span>
                <span className="flex-1 text-[12.5px] font-semibold leading-tight">{w.label}</span>
                {on && <span className="text-[13px] font-bold opacity-90">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Rituais de gratidão */}
      <section className="px-5 pt-8">
        <h2 className="text-[17px] font-bold" style={{ color: ink }}>Rituais de gratidão</h2>
        <p className="text-[12.5px] mt-0.5" style={{ color: inkSoft }}>
          Para fazer em família, na mesa ou no carro.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {outras.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════ 3. MOVER ══════════════════ */
export const PilarMover = ({
  onBack, onOpen, isPremium,
}: {
  onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean;
}) => {
  const tint = "#9BD07A";
  const items = pickIds([
    "alongamento-urso", "aperta-limao", "escuta-coracao",
    "festival-risada", "nuvem-macia", "sentir-vento",
  ]);
  return (
    <div className="min-h-full" style={pillarShellStyle}>
      <TopBar title="Mover" tint={tint} onBack={onBack} />
      <PillarHero
        kicker="Corpo em movimento"
        title="Um minuto muda tudo."
        subtitle="Movimento leve regula a emoção pelo corpo."
        tint={tint}
      />
      <section className="px-5 pt-5">
        <div
          className="rounded-[18px] p-3.5 flex items-start gap-3"
          style={{ ...glassCard, borderColor: `${tint}35` }}
        >
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: `${tint}28`, border: `1px solid ${tint}40` }}
          >
            <Users size={18} style={{ color: tint }} />
          </div>
          <p className="text-[12.5px] leading-snug" style={{ color: inkSoft }}>
            <strong style={{ color: ink }}>Fazer junto</strong> — pai e filho se movem lado a lado.
            O corpo aprende com o corpo do outro.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════ 4. NUTRIR ══════════════════ */
export const PilarNutrir = ({
  onBack, onOpen, isPremium,
}: {
  onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean;
}) => {
  const tint = "#F0A45E";
  const hidratar = pickIds(["agua-familia", "agua-com-fruta"]);
  const comer = pickIds(["prato-colorido", "bacterias-boas", "cores-novas"]);
  const juntos = pickIds(["cozinhar-juntos", "refeicao-sem-tela"]);

  return (
    <div className="min-h-full" style={pillarShellStyle}>
      <TopBar title="Nutrir" tint={tint} onBack={onBack} />
      <PillarHero
        kicker="Alimentação com consciência"
        title="Cor, água e presença."
        subtitle="Nada de dieta, calorias ou peso. Aqui é vínculo e prazer de comer junto."
        tint={tint}
      />

      <section className="px-5 pt-5">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#7FB2E0" }}>
          Hidratar
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {hidratar.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: tint }}>
          Comer com atenção
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {comer.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#9BD07A" }}>
          Cozinhar e comer juntos
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {juntos.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
          ))}
        </div>
      </section>

      <div className="px-5 pt-6">
        <p className="text-[11.5px] leading-snug rounded-2xl p-3" style={{ ...glassCard, color: inkSoft }}>
          Aqui a gente não fala de peso, calorias ou "comida boa/ruim". Foco em variedade, cor, energia e o prazer de estar juntos.
        </p>
      </div>
    </div>
  );
};

/* ══════════════════ 5. CONECTAR ══════════════════ */
export const PilarConectar = ({
  onBack, onOpen, isPremium,
}: {
  onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean;
}) => {
  const tint = "#7EC8A0";
  const items = pickIds([
    "abraco-20s", "olhos-nos-olhos", "festival-risada",
    "elogio-especifico", "missao-bondade", "massagem-amor",
    "maos-cuidam", "caminhada-maos",
  ]);
  return (
    <div className="min-h-full" style={pillarShellStyle}>
      <TopBar title="Conectar" tint={tint} onBack={onBack} />
      <PillarHero
        kicker="Bondade & vínculo"
        title="A família é o abrigo."
        subtitle="Pequenos gestos hoje, memórias que ficam para sempre."
        tint={tint}
      />
      <section className="px-5 pt-5 grid grid-cols-2 gap-3">
        {items.map((a) => (
          <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
        ))}
      </section>
    </div>
  );
};

/* ══════════════════ 6. CUIDAR DE QUEM CUIDA ══════════════════ */
export const PilarCuidar = ({
  onBack, onOpen, isPremium,
}: {
  onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean;
}) => {
  const tint = "#EFA598";
  const items = pickIds(["cafe-sem-culpa", "caminhada-maos", "diario-uma-linha", "tres-gratidoes"]);
  const dicas = [
    "Você não pode cuidar de vazio. Cuidar de si é cuidar da família.",
    "Três respirações longas antes de responder mudam a próxima fala.",
    "Um 'não' cheio de calma vale mais que um 'sim' cheio de cansaço.",
    "Elogie o esforço da criança, não só o resultado.",
  ];
  const dica = dicas[new Date().getDate() % dicas.length];

  return (
    <div className="min-h-full" style={pillarShellStyle}>
      <TopBar title="Cuidar de você" tint={tint} onBack={onBack} />
      <PillarHero
        kicker="Para você, mãe e pai"
        title="Pausas diurnas, sem culpa."
        subtitle="Cuidar de si é a base de toda a família."
        tint={tint}
      />

      <section className="px-5 pt-5">
        <div
          className="rounded-[20px] p-4"
          style={{
            ...glassCard,
            borderColor: `${tint}40`,
          }}
        >
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: tint }}>
            Dica do dia
          </p>
          <p className="mt-1.5 text-[14px] leading-snug" style={{ color: ink }}>{dica}</p>
        </div>
      </section>

      <section className="px-5 pt-5 grid grid-cols-2 gap-3">
        {items.map((a) => (
          <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />
        ))}
      </section>
    </div>
  );
};

/* ══════════════════ Link Sonhos (rodapé) ══════════════════ */
export const HoraDeDormir = ({ onGoDreams }: { onGoDreams: () => void }) => (
  <button
    onClick={() => { haptic("light"); onGoDreams(); }}
    className="w-full rounded-[16px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
    style={{
      background: "linear-gradient(135deg, rgba(42,42,74,0.35), rgba(108,92,184,0.18))",
      border: "1px solid rgba(108,92,184,0.28)",
    }}
  >
    <div
      className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
      style={{ background: "rgba(108,92,184,0.25)" }}
    >
      <Cloud size={18} style={{ color: "#B49CE8" }} />
    </div>
    <div className="flex-1 text-left">
      <p className="text-[13px] font-semibold" style={{ color: ink }}>Hora de dormir?</p>
      <p className="text-[11.5px]" style={{ color: inkSoft }}>
        Sons, histórias e ritual noturno vivem em Sonhos.
      </p>
    </div>
    <ExternalLink size={16} style={{ color: "#B49CE8" }} />
  </button>
);

