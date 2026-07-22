/**
 * KALM v2 — Sub-telas dos 6 pilares DIURNOS.
 * Nada de conteúdo noturno aqui (isso vive em Sonhos).
 * Cada pilar tem uma "cara" diferente — variedade real, não repete tipo.
 */
import { ArrowLeft, ChevronRight, Lock, ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { haptic } from "@/lib/haptics";
import {
  ACTIVITIES, findActivity, MOTOR_TINT,
  WINS, type Activity,
} from "./data";
import { useJar, useWins } from "./state";

// Paleta escura florestal (mesma da KalmHome)
const ink = "#F1EEE4";
const inkSoft = "rgba(241,238,228,0.68)";
const cream = "rgba(255,255,255,0.045)"; // "card" escuro translúcido
const bgDark = "linear-gradient(180deg,#0E1712 0%,#0B1310 60%,#0A110E 100%)";

const glass: React.CSSProperties = {
  background: "linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const TopBar = ({ title, tint, onBack }: { title: string; tint: string; onBack: () => void }) => (
  <div className="px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
    <button onClick={() => { haptic("light"); onBack(); }} aria-label="Voltar"
      className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95" style={glass}>
      <ArrowLeft size={18} style={{ color: ink }} />
    </button>
    <div className="flex-1 h-11 rounded-full flex items-center justify-center px-4 text-[14px] font-bold"
      style={{ ...glass, color: tint }}>
      {title}
    </div>
    <div className="w-11" />
  </div>
);

const PillarHero = ({ kicker, title, subtitle, tint }: {
  kicker: string; title: string; subtitle: string; tint: string;
}) => (
  <div className="px-5 pt-2">
    <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: tint }}>{kicker}</p>
    <h1 className="mt-1 leading-tight" style={{
      color: ink, fontFamily: "'Fraunces', 'Nunito', serif",
      fontSize: "clamp(26px, 8vw, 34px)",
    }}>{title}</h1>
    <p className="mt-1 text-[14px]" style={{ color: inkSoft }}>{subtitle}</p>
  </div>
);

const ActivityCard = ({ a, onOpen, locked, isPremium }: {
  a: Activity; onOpen: () => void; locked?: boolean; isPremium: boolean;
}) => {
  const tint = MOTOR_TINT[a.motor];
  const isLocked = locked ?? (!isPremium && a.premium === true);
  return (
    <button onClick={() => {
      haptic("light");
      if (isLocked) { window.dispatchEvent(new CustomEvent("kidzz:open-plans")); return; }
      onOpen();
    }}
      className="text-left rounded-[20px] p-3 flex flex-col gap-2 active:scale-[0.98]"
      style={{ background: cream, border: "1px solid rgba(42,37,32,0.06)", minHeight: 168 }}>
      <div className="relative h-[84px] rounded-[14px] overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${tint}33, ${tint}11)` }}>
        <span className="absolute top-2 right-2 px-2 h-6 rounded-full text-[10.5px] font-bold flex items-center"
          style={{ background: "rgba(255,255,255,.85)", color: tint }}>
          {a.duration}
        </span>
        {isLocked && (
          <span className="absolute top-2 left-2 px-2 h-6 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{ background: "rgba(255,255,255,.85)", color: "#E8821A" }}>
            <Lock size={10} /> Premium
          </span>
        )}
        <span className="absolute bottom-2 left-2 px-2 h-5 rounded-full text-[9.5px] font-bold flex items-center gap-1"
          style={{ background: "rgba(255,255,255,.85)", color: tint }}>
          {a.audience === "parent" ? "Fazer junto" : "Criança"}
        </span>
      </div>
      <p className="font-semibold leading-tight text-[14px]" style={{ color: ink }}>{a.title}</p>
      <p className="text-[11.5px] leading-snug" style={{ color: inkSoft }}>{a.oneLine}</p>
      <span className="text-[12px] font-bold mt-auto inline-flex items-center gap-0.5" style={{ color: tint }}>
        Começar <ChevronRight size={12} />
      </span>
    </button>
  );
};

const pickIds = (ids: string[]): Activity[] =>
  ids.map(findActivity).filter((x): x is Activity => !!x);

/* ══════════════════ 1. SENTIR ══════════════════ */
export const PilarSentir = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const tint = "#6C5CB8";
  const conversas = [
    "O que fez sua nuvem aparecer hoje?",
    "Se hoje fosse um clima, qual seria?",
    "Onde no corpo você sente a alegria?",
    "O que faria seu sol brilhar mais forte agora?",
  ];
  const respirar = pickIds(["bolhas-magicas", "zumbido-camaleao", "frasco-calma", "cinco-sentidos"]);
  const nomear = pickIds(["escuta-coracao", "aperta-limao", "soltar-balao", "sentir-vento"]);

  return (
    <div className="min-h-full pb-24" style={{ background: bgDark }}>
      <TopBar title="🌦 Sentir" tint={tint} onBack={onBack} />
      <PillarHero kicker="Emoção" title="Nomear é acalmar."
        subtitle="Reconhecer o que sentimos já é metade do caminho." tint={tint} />

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: tint }}>
          Conversa da emoção
        </p>
        <p className="mt-1 text-[12.5px]" style={{ color: inkSoft }}>
          Uma pergunta pro pai/mãe conversar com o filho. Sem certo nem errado.
        </p>
        <div className="mt-3 grid gap-2">
          {conversas.map((q, i) => (
            <div key={i} className="rounded-[18px] p-3.5 text-[14px] leading-snug"
              style={{ background: `${tint}12`, border: `1px solid ${tint}25`, color: ink }}>
              💬 {q}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="text-[18px] font-semibold" style={{ color: ink }}>Respirar (quando sobe forte)</h2>
        <p className="text-[12.5px]" style={{ color: inkSoft }}>Ferramenta pontual de regulação — 1 a 3 min.</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {respirar.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="text-[18px] font-semibold" style={{ color: ink }}>Sentir o corpo</h2>
        <p className="text-[12.5px]" style={{ color: inkSoft }}>Interocepção — a emoção deixa rastro no corpo.</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {nomear.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════ 2. AGRADECER ══════════════════ */
export const PilarAgradecer = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const tint = "#C9A227";
  const { items: jarItems, add: addJar } = useJar();
  const { today: winsToday, toggle, count } = useWins();
  const [jarText, setJarText] = useState("");

  const memoriaFeliz = jarItems.length > 3 ? jarItems[Math.min(jarItems.length - 1, 3)] : null;
  const outras = pickIds(["tres-boas", "caca-beleza", "elogio-especifico", "diario-uma-linha", "tres-gratidoes"]);

  return (
    <div className="min-h-full pb-24" style={{ background: bgDark }}>
      <TopBar title="🫙 Agradecer" tint={tint} onBack={onBack} />
      <PillarHero kicker="Gratidão & memória" title="Guardar o que foi bom."
        subtitle="Saborear pequenos brilhos multiplica a alegria." tint={tint} />

      {/* Jarro */}
      <section className="px-5 pt-6">
        <div className="rounded-[22px] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#1F3A2B,#0E1F18)", color: "#FFFCF8" }}>
          <h3 className="text-[20px] font-semibold leading-tight">O que foi bom hoje?</h3>
          <p className="text-[12.5px] opacity-80 mt-1">
            Uma estrelinha no jarro. Depois vocês releem juntos.
          </p>
          <div className="mt-3 flex gap-2">
            <input value={jarText} onChange={(e) => setJarText(e.target.value)}
              placeholder="Um abraço, uma risada, um obrigado..."
              className="flex-1 h-11 rounded-full px-4 text-[13px] outline-none"
              style={{ background: "rgba(255,255,255,0.12)", color: "#FFFCF8" }}
              aria-label="Momento de gratidão" />
            <button onClick={() => { if (jarText.trim()) { haptic("light"); addJar(jarText); setJarText(""); } }}
              aria-label="Guardar"
              className="h-11 px-4 rounded-full font-bold text-[12.5px] flex items-center gap-1 active:scale-95"
              style={{ background: "#C9A227", color: "#1F1A12" }}>
              <Plus size={14} /> Guardar
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(jarItems.length, 30) }).map((_, i) => (
              <span key={i} className="text-[16px]" aria-hidden>⭐</span>
            ))}
            {jarItems.length === 0 && <span className="text-[11.5px] opacity-60">Seu jarro está vazio. Comece hoje.</span>}
          </div>
        </div>
      </section>

      {/* Memória feliz */}
      {memoriaFeliz && (
        <section className="px-5 pt-5">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: tint }}>Memória feliz</p>
          <div className="mt-2 rounded-[18px] p-4"
            style={{ background: `${tint}15`, border: `1px solid ${tint}30` }}>
            <p className="text-[13.5px] leading-snug" style={{ color: ink }}>
              ✨ Você guardou: "<em>{memoriaFeliz.text}</em>"
            </p>
            <p className="mt-1 text-[11.5px]" style={{ color: inkSoft }}>Lembre-se disso hoje.</p>
          </div>
        </section>
      )}

      {/* Pequenas vitórias */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#E8821A" }}>
            ✦ Pequenas vitórias
          </p>
          <span className="text-[11px] font-bold px-2 h-6 rounded-full flex items-center"
            style={{ background: "#E8821A22", color: "#E8821A" }}>{count} hoje</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {WINS.map((w) => {
            const on = !!winsToday[w.id];
            return (
              <button key={w.id} onClick={() => { haptic("light"); toggle(w.id); }}
                className="rounded-2xl p-2.5 flex items-center gap-2 text-left active:scale-95"
                style={{
                  background: on ? "linear-gradient(135deg,#7FB069,#46703A)" : cream,
                  border: `1px solid ${on ? "transparent" : "rgba(42,37,32,0.06)"}`,
                  color: on ? "#fff" : ink,
                }} aria-pressed={on}>
                <span className="text-[20px]">{w.emoji}</span>
                <span className="flex-1 text-[12.5px] font-semibold leading-tight">{w.label}</span>
                {on && <span className="text-[14px]">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Círculo de gratidão + outras */}
      <section className="px-5 pt-8">
        <h2 className="text-[18px] font-semibold" style={{ color: ink }}>Rituais de gratidão</h2>
        <p className="text-[12.5px]" style={{ color: inkSoft }}>Para fazer em família, na mesa ou no carro.</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {outras.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════ 3. MOVER ══════════════════ */
export const PilarMover = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const tint = "#7FB069";
  const items = pickIds([
    "alongamento-urso", "aperta-limao", "escuta-coracao",
    "festival-risada", "nuvem-macia", "sentir-vento",
  ]);
  return (
    <div className="min-h-full pb-24" style={{ background: bgDark }}>
      <TopBar title="🌿 Mover" tint={tint} onBack={onBack} />
      <PillarHero kicker="Corpo em movimento" title="Um minuto muda tudo."
        subtitle="Movimento leve regula a emoção pelo corpo." tint={tint} />
      <section className="px-5 pt-6">
        <div className="rounded-[18px] p-3.5 flex items-start gap-2"
          style={{ background: `${tint}18`, border: `1px solid ${tint}30` }}>
          <span className="text-[18px]">💚</span>
          <p className="text-[12.5px] leading-snug" style={{ color: ink }}>
            <strong>Fazer junto</strong> — pai e filho se movem lado a lado. O corpo aprende com o corpo do outro.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {items.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════ 4. NUTRIR ══════════════════ */
export const PilarNutrir = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const tint = "#E8821A";
  const hidratar = pickIds(["agua-familia", "agua-com-fruta"]);
  const comer = pickIds(["prato-colorido", "bacterias-boas", "cores-novas"]);
  const juntos = pickIds(["cozinhar-juntos", "refeicao-sem-tela"]);

  return (
    <div className="min-h-full pb-24" style={{ background: bgDark }}>
      <TopBar title="🍎 Nutrir" tint={tint} onBack={onBack} />
      <PillarHero kicker="Alimentação com consciência" title="Cor, água e presença."
        subtitle="Nada de dieta, calorias ou peso. Aqui é vínculo e prazer de comer junto." tint={tint} />

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#4F8FC9" }}>💧 Hidratar</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {hidratar.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: tint }}>🌈 Comer com atenção</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {comer.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>

      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#46703A" }}>👨‍🍳 Cozinhar & comer juntos</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {juntos.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
        </div>
      </section>

      <div className="px-5 pt-6">
        <p className="text-[11px] leading-snug" style={{ color: inkSoft }}>
          🛡 Aqui a gente não fala de peso, calorias ou "comida boa/ruim". Foco em variedade, cor, energia e o prazer de estar juntos.
        </p>
      </div>
    </div>
  );
};

/* ══════════════════ 5. CONECTAR ══════════════════ */
export const PilarConectar = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const tint = "#46703A";
  const items = pickIds([
    "abraco-20s", "olhos-nos-olhos", "festival-risada",
    "elogio-especifico", "missao-bondade", "massagem-amor",
    "maos-cuidam", "caminhada-maos",
  ]);
  return (
    <div className="min-h-full pb-24" style={{ background: bgDark }}>
      <TopBar title="💚 Conectar" tint={tint} onBack={onBack} />
      <PillarHero kicker="Bondade & vínculo" title="A família é o abrigo."
        subtitle="Pequenos gestos hoje, memórias que ficam para sempre." tint={tint} />
      <section className="px-5 pt-6 grid grid-cols-2 gap-2.5">
        {items.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
      </section>
    </div>
  );
};

/* ══════════════════ 6. CUIDAR DE QUEM CUIDA ══════════════════ */
export const PilarCuidar = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const tint = "#D98C7A";
  const items = pickIds(["cafe-sem-culpa", "caminhada-maos", "diario-uma-linha", "tres-gratidoes"]);
  const dicas = [
    "Você não pode cuidar de vazio. Cuidar de si é cuidar da família.",
    "Três respirações longas antes de responder mudam a próxima fala.",
    "Um 'não' cheio de calma vale mais que um 'sim' cheio de cansaço.",
    "Elogie o esforço da criança, não só o resultado.",
  ];
  const dica = dicas[new Date().getDate() % dicas.length];

  return (
    <div className="min-h-full pb-24" style={{ background: bgDark }}>
      <TopBar title="☕ Cuidar de quem cuida" tint={tint} onBack={onBack} />
      <PillarHero kicker="Para você, mãe e pai" title="Pausas diurnas, sem culpa."
        subtitle="Cuidar de si é a base de toda a família." tint={tint} />

      <section className="px-5 pt-6">
        <div className="rounded-[20px] p-4"
          style={{ background: `${tint}18`, border: `1px solid ${tint}35` }}>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: tint }}>Dica do dia</p>
          <p className="mt-1 text-[14px] leading-snug" style={{ color: ink }}>{dica}</p>
        </div>
      </section>

      <section className="px-5 pt-6 grid grid-cols-2 gap-2.5">
        {items.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} isPremium={isPremium} />)}
      </section>
    </div>
  );
};

/* ══════════════════ Link Sonhos (rodapé) ══════════════════ */
export const HoraDeDormir = ({ onGoDreams }: { onGoDreams: () => void }) => (
  <button onClick={() => { haptic("light"); onGoDreams(); }}
    className="w-full rounded-[16px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
    style={{
      background: "linear-gradient(135deg,#2a2a4a10,#6C5CB815)",
      border: "1px solid rgba(108,92,184,0.20)",
    }}>
    <span className="text-[22px]">🌙</span>
    <div className="flex-1 text-left">
      <p className="text-[13px] font-semibold" style={{ color: ink }}>Hora de dormir?</p>
      <p className="text-[11.5px]" style={{ color: inkSoft }}>Sons, histórias e ritual noturno vivem em Sonhos.</p>
    </div>
    <ExternalLink size={16} style={{ color: "#6C5CB8" }} />
  </button>
);
