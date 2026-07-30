import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Award, Bell } from "lucide-react";
import { useBoraStats } from "@/hooks/useBoraStats";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getReminderHour, setReminderHour, requestNotificationPermission, scheduleDailyReminder } from "@/lib/dailyReminder";

type Conclusao = {
  id: string;
  titulo_snapshot: string | null;
  tela_min: number | null;
  feito_em: string;
};

const D = "/exemplos/assets/bora-v2/diario";

const BADGES = [
  { id: "first", icon: `${D}/badge-first.png`, label: "Primeira atividade", test: (s: any) => s.total_conclusoes >= 1 },
  { id: "streak3", icon: `${D}/badge-streak3.png`, label: "3 dias seguidos", test: (s: any) => s.streak >= 3 },
  { id: "streak7", icon: `${D}/badge-streak7.png`, label: "7 dias seguidos", test: (s: any) => s.streak >= 7 },
  { id: "five", icon: `${D}/badge-five.png`, label: "5 atividades feitas", test: (s: any) => s.total_conclusoes >= 5 },
  { id: "ten", icon: `${D}/badge-ten.png`, label: "10 atividades feitas", test: (s: any) => s.total_conclusoes >= 10 },
  { id: "explorer", icon: `${D}/badge-explorer.png`, label: "Explorou 4 tipos", test: (s: any) => s.categorias_exploradas >= 4 },
  { id: "all-cats", icon: `${D}/badge-allcats.png`, label: "Explorou as 7 categorias", test: (s: any) => s.categorias_exploradas >= 7 },
  { id: "hours1", icon: `${D}/badge-hours1.png`, label: "1 hora sem tela", test: (s: any) => s.total_minutos >= 60 },
  { id: "hours5", icon: `${D}/badge-hours5.png`, label: "5 horas sem tela", test: (s: any) => s.total_minutos >= 300 },
  { id: "outdoor", icon: `${D}/badge-outdoor.png`, label: "Primeira aventura ao ar livre", test: () => false },
];

type Props = { open: boolean; onClose: () => void; childName?: string };

export const DiarioSemTela = ({ open, onClose, childName = "" }: Props) => {
  const { user } = useAuth();
  const { stats, refresh } = useBoraStats();
  const [hist, setHist] = useState<Conclusao[]>([]);
  const [hour, setHour] = useState<number>(getReminderHour());
  const [notifAllowed, setNotifAllowed] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (!open || !user) return;
    refresh();
    (async () => {
      const { data } = await supabase
        .from("conclusoes")
        .select("id,titulo_snapshot,tela_min,feito_em")
        .order("feito_em", { ascending: false })
        .limit(15);
      setHist((data as Conclusao[]) || []);
    })();
  }, [open, user, refresh]);

  const earned = useMemo(() => BADGES.filter((b) => b.test(stats)), [stats]);

  const treeStage = useMemo(() => {
    const c = stats.total_conclusoes;
    if (c >= 20) return { icon: `${D}/tree-mature.png`, legend: "Árvore plantada e firme. Que orgulho!" };
    if (c >= 10) return { icon: `${D}/tree-young.png`, legend: "Sua árvore tá ganhando força." };
    if (c >= 5) return { icon: `${D}/tree-leaves.png`, legend: "Folhas brotando. Continuem assim." };
    if (c >= 1) return { icon: `${D}/tree-sprout.png`, legend: "A semente germinou. Bora regar?" };
    return { icon: `${D}/tree-seed.png`, legend: "Faça a primeira atividade pra plantar a semente." };
  }, [stats.total_conclusoes]);

  const enableNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifAllowed(perm);
    if (perm === "granted") scheduleDailyReminder(childName);
  };

  const onHourChange = (h: number) => {
    setHour(h);
    setReminderHour(h);
    if (notifAllowed === "granted") scheduleDailyReminder(childName);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] overflow-y-auto overflow-x-hidden"
          style={{
            background: "linear-gradient(180deg, #FFFDF6 0%, #FFF3D9 100%)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 160px)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
        >
          <header
            className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
            style={{
              background: "linear-gradient(180deg, rgba(255,253,246,.98) 60%, rgba(255,253,246,0) 100%)",
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.55))",
                border: "0.5px solid rgba(255,255,255,.95)",
                boxShadow: "0 8px 20px rgba(40,60,25,.12), 0 1px 0 rgba(255,255,255,1) inset",
                color: "#2F5E1F",
              }}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#E8772A" }}>
                Movimento Menos Tela
              </div>
              <h1 className="font-bora-display" style={{ fontSize: 22, color: "#2F5E1F", letterSpacing: "-0.01em" }}>
                Diário Sem Tela
              </h1>
            </div>
          </header>

          <main className="px-5 space-y-4">
            {/* Tree + stats */}
            <section
              className="rounded-3xl p-5 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(165deg, #E8F4D9 0%, #C8E0A5 55%, #B5D48E 100%)",
                border: "1.5px solid rgba(255,255,255,.9)",
                boxShadow:
                  "0 22px 44px -16px rgba(40,80,30,.28), 0 1px 0 rgba(255,255,255,.95) inset, 0 -8px 20px rgba(255,255,255,.2) inset",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(70% 60% at 50% 20%, rgba(255,255,255,.45), transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div className="relative z-[1] mx-auto" style={{ width: 120, height: 120 }}>
                <img
                  src={treeStage.icon}
                  alt=""
                  width={120}
                  height={120}
                  draggable={false}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 28,
                    boxShadow: "0 16px 36px rgba(40,70,25,.22), 0 2px 0 rgba(255,255,255,.7) inset",
                  }}
                />
              </div>
              <p className="font-bora-body mt-3 relative z-[1]" style={{ fontSize: 13.5, color: "#2F3A24", fontWeight: 600, lineHeight: 1.4 }}>
                {treeStage.legend}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 relative z-[1]">
                <Stat label="min sem tela" value={stats.total_minutos} iconSrc={`${D}/stat-clock.png`} />
                <Stat label="dias seguidos" value={stats.streak} iconSrc={`${D}/stat-flame.png`} />
                <Stat label="tipos" value={`${stats.categorias_exploradas}/7`} iconSrc={`${D}/stat-leaf.png`} />
              </div>
            </section>

            {stats.streak === 0 && stats.total_conclusoes > 0 && (
              <p className="text-center font-bora-body" style={{ fontSize: 12.5, color: "#7a6a52" }}>
                Tudo bem ter dado uma pausa. Bora recomeçar hoje?
              </p>
            )}

            {/* Conquistas */}
            <section
              className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,.96) 0%, rgba(255,252,245,.92) 100%)",
                border: "1.5px solid rgba(255,255,255,.95)",
                boxShadow: "0 16px 36px -14px rgba(60,40,15,.16), 0 1px 0 rgba(255,255,255,1) inset",
              }}
            >
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#E8772A" }}>
                <Award size={13} /> Conquistas ({earned.length}/{BADGES.length})
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2.5">
                {BADGES.map((b) => {
                  const got = !!earned.find((e) => e.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className="rounded-2xl py-2.5 px-1 text-center"
                      style={{
                        background: got
                          ? "linear-gradient(165deg, #FFF4DE 0%, #F8D9A0 100%)"
                          : "linear-gradient(165deg, rgba(255,255,255,.72), rgba(245,250,240,.55))",
                        opacity: got ? 1 : 0.72,
                        border: got ? "1px solid rgba(232,130,26,.32)" : "1px solid rgba(47,94,31,.08)",
                        boxShadow: got
                          ? "0 8px 18px rgba(180,100,20,.16), 0 1px 0 rgba(255,255,255,.85) inset"
                          : "0 2px 8px rgba(40,50,30,.04)",
                      }}
                    >
                      <div
                        className="mx-auto overflow-hidden"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          filter: got ? "none" : "grayscale(0.85) brightness(1.05)",
                          boxShadow: got ? "0 4px 12px rgba(180,100,20,.2)" : "none",
                        }}
                      >
                        <img
                          src={b.icon}
                          alt=""
                          width={40}
                          height={40}
                          draggable={false}
                          style={{ width: 40, height: 40, objectFit: "cover", display: "block" }}
                        />
                      </div>
                      <div className="mt-1.5 font-bora-body" style={{ fontSize: 9.5, color: "#3a2f23", lineHeight: 1.15, fontWeight: 700 }}>
                        {b.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Lembrete */}
            <section
              className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,.96) 0%, rgba(255,252,245,.92) 100%)",
                border: "1.5px solid rgba(255,255,255,.95)",
                boxShadow: "0 16px 36px -14px rgba(60,40,15,.16), 0 1px 0 rgba(255,255,255,1) inset",
              }}
            >
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#2F5E1F" }}>
                <Bell size={13} /> Lembrete diário gentil
              </div>
              <h3 className="font-bora-display mt-1" style={{ fontSize: 16, color: "#3a2f23" }}>
                Um toque por dia. Sem spam.
              </h3>
              <p className="font-bora-body mt-1" style={{ fontSize: 12.5, color: "#7a6a52" }}>
                Você escolhe o horário. A gente lembra de propor 15 min sem tela.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <label className="font-bora-body" style={{ fontSize: 12.5, color: "#3a2f23" }}>
                  Horário:
                </label>
                <select
                  value={hour}
                  onChange={(e) => onHourChange(parseInt(e.target.value, 10))}
                  className="rounded-full px-3 py-1.5 font-semibold"
                  style={{ background: "rgba(47,94,31,.08)", color: "#2F5E1F", fontSize: 13 }}
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              {notifAllowed !== "granted" && (
                <button
                  type="button"
                  onClick={enableNotif}
                  className="mt-3 w-full rounded-full py-2.5 font-bold text-white active:scale-[.98]"
                  style={{
                    background: "linear-gradient(135deg, #F4A659, #E8821A)",
                    boxShadow: "0 8px 18px -4px rgba(232,130,26,.5)",
                    fontSize: 13.5,
                  }}
                >
                  Permitir lembrete diário
                </button>
              )}
              {notifAllowed === "granted" && (
                <p className="mt-2 font-bora-body" style={{ fontSize: 11.5, color: "#7a6a52" }}>
                  Ativo. Vamos lembrar você às {String(hour).padStart(2, "0")}:00 quando o app estiver aberto.
                </p>
              )}
              {notifAllowed === "denied" && (
                <p className="mt-2 font-bora-body" style={{ fontSize: 11.5, color: "#b45309" }}>
                  Notificações bloqueadas. Habilite nas configurações do navegador.
                </p>
              )}
            </section>

            {/* Histórico */}
            <section
              className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,.96) 0%, rgba(255,252,245,.92) 100%)",
                border: "1.5px solid rgba(255,255,255,.95)",
                boxShadow: "0 16px 36px -14px rgba(60,40,15,.16), 0 1px 0 rgba(255,255,255,1) inset",
              }}
            >
              <div className="text-[10.5px] font-bold uppercase tracking-wider mb-3" style={{ color: "#2F5E1F" }}>
                Últimos momentos
              </div>
              {hist.length === 0 ? (
                <p className="font-bora-body text-center" style={{ fontSize: 13, color: "#7a6a52" }}>
                  Sua primeira brincadeira aparece aqui. Bora começar?
                </p>
              ) : (
                <ul className="space-y-2">
                  {hist.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-2xl"
                      style={{ background: "rgba(47,94,31,.04)" }}
                    >
                      <img
                        src={`${D}/tree-leaves.png`}
                        alt=""
                        width={32}
                        height={32}
                        draggable={false}
                        style={{ width: 32, height: 32, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate" style={{ fontSize: 13, color: "#3a2f23" }}>
                          {h.titulo_snapshot || "Atividade Kidzz"}
                        </div>
                        <div className="font-bora-body" style={{ fontSize: 11, color: "#7a6a52" }}>
                          {new Date(h.feito_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          {" • "}
                          {h.tela_min || 0} min sem tela
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Stat = ({
  label,
  value,
  iconSrc,
}: {
  label: string;
  value: number | string;
  iconSrc: string;
}) => (
  <div
    className="rounded-2xl py-2.5 px-2"
    style={{
      background: "linear-gradient(165deg, rgba(255,255,255,.88), rgba(255,255,255,.62))",
      border: "1px solid rgba(255,255,255,.95)",
      boxShadow: "0 6px 16px rgba(40,60,25,.08), 0 1px 0 rgba(255,255,255,1) inset",
    }}
  >
    <div className="flex items-center justify-center gap-1.5">
      <img
        src={iconSrc}
        alt=""
        width={22}
        height={22}
        draggable={false}
        style={{ width: 22, height: 22, borderRadius: 7, objectFit: "cover" }}
      />
      <span className="font-bora-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#2F5E1F" }}>
        {value}
      </span>
    </div>
    <div className="mt-0.5 font-bora-body text-center" style={{ fontSize: 10, color: "#5a6a48", lineHeight: 1.1, fontWeight: 600 }}>
      {label}
    </div>
  </div>
);
