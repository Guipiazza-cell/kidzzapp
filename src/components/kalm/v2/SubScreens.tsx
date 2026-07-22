/**
 * KALM v2 — sub-telas (Relaxar, Ritual, SOS, Vínculo).
 * Cada sub-tela é stateless: recebe onBack e onOpen(activity).
 */
import { useState } from "react";
import { ArrowLeft, ChevronRight, Heart, Wind, Sparkles, Shield, Moon, Lock, Crown, Trees, Waves } from "lucide-react";
import { haptic } from "@/lib/haptics";
import {
  KID_ACTIVITIES, PARENT_ACTIVITIES, ACTIVITIES,
  JOURNEYS, MOTOR_TINT, type Activity,
} from "./data";

// Paleta escura florestal (mesma da KalmHome)
const ink = "#F1EEE4";
const inkSoft = "rgba(241,238,228,0.68)";
const cream = "rgba(255,255,255,0.045)"; // card escuro translúcido
const bgDark = "linear-gradient(180deg,#0E1712 0%,#0B1310 60%,#0A110E 100%)";

const glassCard: React.CSSProperties = {
  background: "linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const TopBar = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
    <button onClick={() => { haptic("light"); onBack(); }} aria-label="Voltar"
      className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
      style={glassCard}>
      <ArrowLeft size={18} style={{ color: ink }} />
    </button>
    <div className="flex-1 h-11 rounded-full flex items-center justify-center px-4 text-[14px] font-bold"
      style={{ ...glassCard, color: ink }}>
      🌿 {title}
    </div>
    <div className="w-11" />
  </div>
);

const ActivityCard = ({ a, onOpen, locked }: { a: Activity; onOpen: () => void; locked?: boolean }) => {
  const tint = MOTOR_TINT[a.motor];
  return (
    <button onClick={() => { haptic("light"); onOpen(); }}
      className="text-left rounded-[20px] p-3 flex flex-col gap-2 active:scale-[0.98] transition-transform"
      style={{
        background: cream,
        border: "1px solid rgba(42,37,32,0.06)",
        boxShadow: "0 4px 16px -6px rgba(42,37,32,0.10)",
        minHeight: 168,
      }}>
      {/* Slot da imagem — fallback gradiente do motor + emoji */}
      <div className="relative h-[88px] rounded-[14px] overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${tint}33, ${tint}11)` }}>
        <span className="absolute top-2 right-2 px-2 h-6 rounded-full text-[10.5px] font-bold flex items-center"
          style={{ background: "rgba(255,255,255,.85)", color: tint }}>
          {a.duration}
        </span>
        {locked && (
          <span className="absolute top-2 left-2 px-2 h-6 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{ background: "rgba(255,255,255,.85)", color: "#E8821A" }}>
            <Lock size={10} /> Premium
          </span>
        )}
      </div>
      <p className="font-semibold leading-tight" style={{
        color: ink, fontFamily: "'Nunito', system-ui, sans-serif",
        fontSize: "clamp(13px, 4vw, 15px)",
      }}>{a.title}</p>
      <p className="text-[11.5px] leading-snug" style={{ color: inkSoft }}>
        {a.oneLine}
      </p>
      <span className="text-[12px] font-bold mt-auto inline-flex items-center gap-0.5" style={{ color: tint }}>
        Começar <ChevronRight size={12} />
      </span>
    </button>
  );
};

/* ─────────────── RELAXAR AGORA ─────────────── */
export const RelaxarAgora = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => (
  <div className="min-h-full pb-20" style={{ background: bgDark }}>
    <TopBar title="Alívio em minutos" onBack={onBack} />
    <div className="px-5 pt-2">
      <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#46703A" }}>
        Quick Relief
      </p>
      <h1 className="mt-1 leading-tight" style={{
        color: ink, fontFamily: "'Nunito', system-ui, sans-serif",
        fontSize: "clamp(26px, 8vw, 34px)",
      }}>Alívio em minutos</h1>
      <p className="mt-1 text-[14px]" style={{ color: inkSoft }}>
        Pequenas pausas que restauram já.
      </p>
      <div className="mt-3 rounded-[18px] p-3 flex items-start gap-2"
        style={{ background: "rgba(108,92,184,0.10)", border: "1px solid rgba(108,92,184,0.18)" }}>
        <Heart size={16} style={{ color: "#6C5CB8" }} />
        <p className="text-[12.5px] leading-snug" style={{ color: "#2A2520" }}>
          <strong>Conectem-se.</strong> Pequenos momentos juntos geram grandes mudanças.
        </p>
      </div>
    </div>

    {/* Trilha crianças */}
    <section className="px-5 pt-6">
      <h2 className="text-[18px] font-semibold" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        Para as crianças ✦
      </h2>
      <p className="text-[12.5px]" style={{ color: inkSoft }}>
        Ferramentas simples para acalmar, relaxar e se reconectar.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {KID_ACTIVITIES.map((a, i) => (
          <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)}
            locked={!isPremium && a.premium === true && i > 4} />
        ))}
      </div>
    </section>

    {/* Trilha adultos */}
    <section className="px-5 pt-8">
      <h2 className="text-[18px] font-semibold" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        Para você, mãe e pai 💚
      </h2>
      <p className="text-[12.5px]" style={{ color: inkSoft }}>
        Pausas adultas. Cuidar de quem cuida.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {PARENT_ACTIVITIES.map((a) => (
          <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} />
        ))}
      </div>
    </section>

    {/* Rodapé selos de benefício */}
    <div className="px-5 pt-8 grid grid-cols-2 gap-2 text-[11.5px]">
      {[
        { e: "🌿", t: "Mais calma e menos estresse" },
        { e: "💞", t: "Vínculos mais fortes em família" },
        { e: "🌙", t: "Melhor sono e bem-estar" },
        { e: "🌱", t: "Desenvolvimento emocional saudável" },
      ].map((b) => (
        <div key={b.t} className="rounded-2xl p-2.5 flex items-center gap-2" style={glassCard}>
          <span className="text-[18px]">{b.e}</span>
          <span className="font-semibold leading-tight" style={{ color: ink }}>{b.t}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────── RITUAL RÁPIDO ─────────────── */
export const RitualRapido = ({ onBack, onOpen }:
  { onBack: () => void; onOpen: (a: Activity) => void }) => {
  const breath = (sec: number): Activity => ({
    id: `breath-${sec}`, audience: "kid",
    title: `Respirar com o camaleão (${sec}s)`,
    duration: `${sec}s`, durationSec: sec,
    oneLine: "Um respiro pequeno, do tamanho da sua vontade.",
    motor: "exalacao", kind: "breath",
    steps: [
      "Senta confortável. Mão na barriga.",
      "Inspire devagar pelo nariz.",
      "Solte ainda mais devagar pela boca.",
      "Continua no seu ritmo, sem pressa.",
    ],
    imgSlot: "imgChamMeditando",
  });

  const rituais: Activity[] = [
    { id: "meditacao-guiada", audience: "kid", title: "Meditação guiada", duration: "5 min", durationSec: 300,
      oneLine: "Pausa profunda, com voz que conduz a respiração.",
      motor: "corpo", kind: "breath",
      steps: ["Deita ou senta confortável.", "Fecha os olhos.", "Inspira em 4, segura em 2, solta em 6.", "Repete por cinco respirações."],
      imgSlot: "meditacaoGuiada", premium: true },
    { id: "resp-446", audience: "kid", title: "Respiração 4-4-6", duration: "3 min", durationSec: 180,
      oneLine: "Inspira 4, segura 4, solta 6. Repete.",
      motor: "exalacao", kind: "breath",
      steps: ["Inspira contando até 4.", "Segura contando até 4.", "Solta contando até 6.", "Mais quatro rodadas."],
      imgSlot: "imgAtiv_resp446" },
    { id: "wellness-familia", audience: "kid", title: "Wellness família", duration: "Juntos", durationSec: 240,
      oneLine: "Um ritual rápido para fazer com seu filho.",
      motor: "conexao", kind: "steps",
      steps: ["Sentem-se lado a lado.", "Três respirações juntos.", "Um abraço de 20 segundos.", "Olhem nos olhos e sorriam."],
      imgSlot: "imgAtiv_wellnessFamilia" },
    { id: "sons-natureza", audience: "kid", title: "Sons da natureza", duration: "Loop", durationSec: 600,
      oneLine: "Atmosfera da floresta para acalmar a casa.",
      motor: "grounding", kind: "steps",
      steps: ["Toque play e respire.", "Feche os olhos.", "Imagine onde esses sons vivem.", "Volte aos poucos."],
      imgSlot: "sonsNatureza" },
    { id: "mini-mindfulness", audience: "kid", title: "Mini mindfulness", duration: "2 min", durationSec: 120,
      oneLine: "Pequena pausa de atenção plena.",
      motor: "grounding", kind: "scan",
      steps: ["Sente os pés no chão.", "Sente o corpo na cadeira.", "Sente o ar entrando.", "Sente o ar saindo."],
      imgSlot: "imgAtiv_miniMind" },
    { id: "pausa-do-dia", audience: "kid", title: "Pausa do dia", duration: "1 min", durationSec: 60,
      oneLine: "Um minuto de calma no meio do dia.",
      motor: "corpo", kind: "breath",
      steps: ["Para o que estiver fazendo.", "Três respirações longas.", "Pisca devagar três vezes.", "Volta com mais leveza."],
      imgSlot: "imgAtiv_pausaDia" },
    { id: "rotina-calma", audience: "kid", title: "Rotina calma", duration: "Hoje", durationSec: 60,
      oneLine: "Uma micro-rotina para encerrar o dia em paz.",
      motor: "conexao", kind: "steps",
      steps: ["Apaga a luz forte.", "Conversa baixinho com a família.", "Três coisas boas do dia.", "Boa noite."],
      imgSlot: "imgAtiv_rotinaCalma" },
  ];

  return (
    <div className="min-h-full pb-20" style={{ background: bgDark }}>
      <TopBar title="Ritual rápido" onBack={onBack} />
      <div className="px-5 pt-2">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#E8821A" }}>
          Respirar com o camaleão
        </p>
        <h1 className="mt-1 leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: "clamp(26px, 8vw, 34px)" }}>
          Um respiro pequeno
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: inkSoft }}>
          Do tamanho da sua vontade.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[{ s: 30, l: "30s · Rapidinho" }, { s: 60, l: "60s · Um minuto" }, { s: 90, l: "90s · Mais profundo" }].map((b) => (
            <button key={b.s} onClick={() => { haptic("light"); onOpen(breath(b.s)); }}
              className="h-20 rounded-2xl flex flex-col items-center justify-center font-semibold active:scale-95"
              style={{
                background: `linear-gradient(135deg,#7FB069,#46703A)`,
                color: "#fff",
                boxShadow: "0 8px 22px -8px rgba(70,112,58,.5)",
              }}>
              <span className="text-[20px] font-bold">{b.s}s</span>
              <span className="text-[10.5px] opacity-90">{b.l.split("·")[1]?.trim()}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="px-5 pt-6">
        <h2 className="text-[18px] font-semibold" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
          Pequenos rituais
        </h2>
        <p className="text-[12.5px]" style={{ color: inkSoft }}>
          Cada toque conta como um dia de calma.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {rituais.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} />)}
        </div>
      </section>
    </div>
  );
};

/* ─────────────── SOS EMOCIONAL ─────────────── */
export const SosEmocional = ({ onBack, onOpen, onOpenParents }:
  { onBack: () => void; onOpen: (a: Activity) => void; onOpenParents: () => void }) => {
  const sosBreath: Activity = {
    id: "sos-breath", audience: "kid",
    title: "Respiro guiado SOS", duration: "90s", durationSec: 90,
    oneLine: "Faça junto com seu filho, lado a lado.",
    motor: "exalacao", kind: "breath",
    steps: [
      "Mão na barriga. Puxe o ar pelo nariz e encha a barriga como um balão.",
      "Solte bem devagar pela boca, como apagar uma velinha sem pressa.",
      "Faça um zumbido baixinho, mmmm, e sinta o cosquinho acalmar.",
      "Olhe ao redor: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que prova.",
    ],
    imgSlot: "imgSosBreath",
  };

  return (
    <div className="min-h-full pb-20" style={{ background: bgDark }}>
      <TopBar title="SOS emocional" onBack={onBack} />
      <div className="px-5 pt-2">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#46703A" }}>
          Apoio imediato
        </p>
        <h1 className="mt-1 leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: "clamp(26px, 8vw, 34px)" }}>
          Tá tudo bem não estar bem.
        </h1>
        <p className="mt-2 text-[14px] leading-snug" style={{ color: inkSoft }}>
          Quando a emoção fica grande demais, a gente respira primeiro.
          Faça junto com seu filho, lado a lado.
        </p>
      </div>

      <div className="px-5 pt-5 space-y-3">
        {[
          "Mão na barriga. Puxe o ar pelo nariz e encha a barriga como um balão.",
          "Solte bem devagar pela boca, como apagar uma velinha sem pressa.",
          "Faça um zumbido baixinho, mmmm, e sinta o cosquinho acalmar.",
          "Olhe ao redor: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que prova.",
        ].map((s, i) => (
          <div key={i} className="rounded-[18px] p-4 flex items-start gap-3"
            style={{ background: cream, border: "1px solid rgba(42,37,32,0.08)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[14px]"
              style={{ background: "linear-gradient(135deg,#7FB069,#46703A)" }}>
              {i + 1}
            </div>
            <p className="flex-1 text-[14px] leading-snug" style={{ color: ink }}>{s}</p>
          </div>
        ))}

        <button onClick={() => { haptic("medium"); onOpen(sosBreath); }}
          className="w-full h-14 rounded-full text-white font-bold text-[15px] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#46703A,#7FB069)",
            boxShadow: "0 14px 30px -8px rgba(70,112,58,.55)",
          }}>
          Começar o respiro guiado (90s)
        </button>

        {/* Bloco de segurança */}
        <div className="rounded-[20px] p-4 mt-3"
          style={{ background: "rgba(108,92,184,0.08)", border: "1px solid rgba(108,92,184,0.20)" }}>
          <p className="text-[13px] leading-snug" style={{ color: ink }}>
            Se a tristeza ou o medo forem grandes demais e não passarem, isso não é fraqueza.
            Procure um adulto de confiança ou um profissional. Pedir ajuda é um ato de coragem.
          </p>
          <button onClick={() => { haptic("light"); onOpenParents(); }}
            className="mt-3 w-full h-11 rounded-full font-bold text-[13.5px] flex items-center justify-center gap-2"
            style={{ background: "#6C5CB8", color: "#fff" }}>
            <Shield size={14} /> Falar com um responsável
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── VÍNCULO EM FAMÍLIA ─────────────── */
export const VinculoFamilia = ({ onBack, onOpen, isPremium }:
  { onBack: () => void; onOpen: (a: Activity) => void; isPremium: boolean }) => {
  const experiencias: Activity[] = [
    { id: "reconexao-conflito", audience: "parent", title: "Reconexão após conflito",
      duration: "5 min", durationSec: 300,
      oneLine: "Três gestos simples para reabrir o canal.",
      motor: "conexao", kind: "steps",
      steps: ["Sente-se na altura dele. Diga: 'eu te vejo'.", "Pergunte: 'o que você sentiu agora?'", "Um abraço silencioso de 20 segundos."],
      imgSlot: "imgVin_reconexao" },
    { id: "cinco-min-juntos", audience: "parent", title: "5 minutos juntos",
      duration: "5 min", durationSec: 300,
      oneLine: "Presença total, sem tela, sem objetivo.",
      motor: "conexao", kind: "steps",
      steps: ["Guarde o celular.", "Sentem-se juntos.", "Cinco minutos de atenção total.", "Sem corrigir, sem ensinar."],
      imgSlot: "imgVin_5min" },
    { id: "gratidao-familia", audience: "parent", title: "Gratidão em família",
      duration: "3 min", durationSec: 180,
      oneLine: "Cada um diz uma coisa boa do dia.",
      motor: "gratidao", kind: "steps",
      steps: ["Reúnam-se em roda.", "Cada um diz uma coisa boa.", "Sem julgar a resposta dos outros.", "Encerrem com obrigado."],
      imgSlot: "imgVin_grat" },
    { id: "fortalecendo", audience: "parent", title: "Fortalecendo vínculos",
      duration: "Hábito", durationSec: 240,
      oneLine: "Mini ritual de presença todos os dias.",
      motor: "conexao", kind: "steps",
      steps: ["Escolham um horário fixo.", "Dois minutos juntos, sem distrações.", "Olho no olho. Um abraço."],
      imgSlot: "imgVin_forta" },
    { id: "sound-chuva", audience: "kid", title: "Chuva",
      duration: "Loop", durationSec: 300,
      oneLine: "Chuva suave, contínua.",
      motor: "grounding", kind: "steps",
      steps: ["Deita confortável.", "Fecha os olhos.", "Imagina a chuva no telhado.", "Respira no ritmo dela."],
      imgSlot: "chuva" },
    { id: "sound-floresta", audience: "kid", title: "Floresta",
      duration: "Loop", durationSec: 300,
      oneLine: "Folhas, vento, pássaros.",
      motor: "grounding", kind: "steps",
      steps: ["Imagine-se na floresta.", "Sinta o vento nas folhas.", "Escute os pássaros.", "Respire o ar limpo."],
      imgSlot: "floresta" },
    { id: "sound-oceano", audience: "kid", title: "Oceano",
      duration: "Loop", durationSec: 300,
      oneLine: "Ondas lentas, respiração do mar.",
      motor: "exalacao", kind: "breath",
      steps: ["Sente o ritmo das ondas.", "Inspire quando elas chegam.", "Solte quando elas voltam.", "Devagar."],
      imgSlot: "oceano" },
    { id: "sound-noite", audience: "kid", title: "Noite tranquila",
      duration: "Loop", durationSec: 300,
      oneLine: "Brisa fina e ruído branco gentil.",
      motor: "grounding", kind: "steps",
      steps: ["Apaga a luz.", "Deita confortável.", "Escuta o silêncio em volta.", "Respira devagar."],
      imgSlot: "noite" },
    { id: "sound-rio", audience: "kid", title: "Rio suave",
      duration: "Loop", durationSec: 300,
      oneLine: "Água correndo, sem pressa.",
      motor: "grounding", kind: "steps",
      steps: ["Imagine um rio calmo.", "Veja a água passar.", "Sem prender, só observar.", "Respire junto."],
      imgSlot: "rio" },
  ];

  return (
    <div className="min-h-full pb-20" style={{ background: bgDark }}>
      <TopBar title="Vínculo em família" onBack={onBack} />
      <div className="px-5 pt-2">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#C9A227" }}>
          Connection
        </p>
        <h1 className="mt-1 leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: "clamp(26px, 8vw, 34px)" }}>
          Vínculo em família
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: inkSoft }}>
          Experiências para fortalecer o que importa.
        </p>
      </div>

      <div className="px-5 pt-4 grid grid-cols-2 gap-2.5">
        {experiencias.map((a) => <ActivityCard key={a.id} a={a} onOpen={() => onOpen(a)} />)}
      </div>

      <div className="px-5 pt-5">
        <div className="rounded-[20px] p-4" style={{ background: "rgba(127,176,105,0.10)", border: "1px solid rgba(127,176,105,0.25)" }}>
          <p className="text-[13px] leading-snug" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif", fontStyle: "italic" }}>
            "Pequenos momentos hoje, memórias que ficam para sempre."
          </p>
        </div>
      </div>

      {/* Jornadas completas */}
      <section className="px-5 pt-8">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#5A6660" }}>
          Journeys
        </p>
        <h2 className="text-[20px] font-semibold leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
          Jornadas completas
        </h2>
        <p className="text-[12.5px]" style={{ color: inkSoft }}>
          Experiências de vários dias para construir hábito.
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          {JOURNEYS.map((j) => {
            const locked = j.premium && !isPremium;
            return (
              <button key={j.id}
                onClick={() => {
                  haptic("light");
                  if (locked) window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
                }}
                className="rounded-[20px] p-3 flex items-center gap-3 active:scale-[0.98] text-left"
                style={{ background: cream, border: "1px solid rgba(42,37,32,0.08)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px]"
                  style={{ background: "linear-gradient(135deg,#C9A22733,#7FB06933)" }}>
                  {j.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {j.premium && (
                      <span className="px-2 h-5 rounded-full text-[10px] font-bold flex items-center gap-1"
                        style={{ background: "#E8821A22", color: "#E8821A" }}>
                        <Crown size={10} /> Premium
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: inkSoft }}>{j.days} dias</span>
                  </div>
                  <p className="mt-0.5 font-semibold text-[15px] leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                    {j.title}
                  </p>
                  <p className="text-[12px]" style={{ color: inkSoft }}>{j.desc}</p>
                </div>
                <ChevronRight size={18} style={{ color: locked ? "#E8821A" : "#46703A" }} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Em breve */}
      <section className="px-5 pt-8 pb-4">
        <div className="rounded-[20px] p-4" style={{
          background: "linear-gradient(135deg,#C9A22722,#7FB06922)",
          border: "1px dashed rgba(201,162,39,0.4)",
        }}>
          <p className="text-[10.5px] font-bold tracking-[0.2em] uppercase" style={{ color: "#46703A" }}>
            Em breve
          </p>
          <p className="mt-1 text-[16px] font-semibold" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Lugares para viver
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: inkSoft }}>
            Experiências físicas curadas para famílias.
          </p>
        </div>
      </section>
    </div>
  );
};
