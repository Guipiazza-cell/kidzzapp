import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flame, Leaf, Award, Bell, Clock } from "lucide-react";
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

const BADGES = [
  { id: "first", emoji: "🌱", label: "Primeira atividade", test: (s: any) => s.total_conclusoes >= 1 },
  { id: "streak3", emoji: "🌿", label: "3 dias seguidos", test: (s: any) => s.streak >= 3 },
  { id: "streak7", emoji: "🌳", label: "7 dias seguidos", test: (s: any) => s.streak >= 7 },
  { id: "five", emoji: "🎨", label: "5 atividades feitas", test: (s: any) => s.total_conclusoes >= 5 },
  { id: "ten", emoji: "🏕️", label: "10 atividades feitas", test: (s: any) => s.total_conclusoes >= 10 },
  { id: "explorer", emoji: "🧭", label: "Explorou 4 tipos", test: (s: any) => s.categorias_exploradas >= 4 },
  { id: "all-cats", emoji: "🌟", label: "Explorou as 7 categorias", test: (s: any) => s.categorias_exploradas >= 7 },
  { id: "hours1", emoji: "⏳", label: "1 hora sem tela", test: (s: any) => s.total_minutos >= 60 },
  { id: "hours5", emoji: "🌄", label: "5 horas sem tela", test: (s: any) => s.total_minutos >= 300 },
  { id: "outdoor", emoji: "🌤️", label: "Primeira aventura ao ar livre", test: () => false },
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
    if (c >= 20) return { emoji: "🌳", legend: "Árvore plantada e firme. Que orgulho!" };
    if (c >= 10) return { emoji: "🌲", legend: "Sua árvore tá ganhando força." };
    if (c >= 5) return { emoji: "🌿", legend: "Folhas brotando. Continuem assim." };
    if (c >= 1) return { emoji: "🌱", legend: "A semente germinou. Bora regar?" };
    return { emoji: "🌰", legend: "Faça a primeira atividade pra plantar a semente." };
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
          className="fixed inset-0 z-[150] overflow-y-auto"
          style={{
            background: "linear-gradient(180deg, #FFFDF6 0%, #FFF3D9 100%)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 160px)",
          }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
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
              style={{ background: "rgba(47,94,31,.08)", color: "#2F5E1F" }}
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
              className="rounded-3xl p-5 text-center"
              style={{
                background: "linear-gradient(165deg, #E8F4D9 0%, #C8E0A5 100%)",
                border: "1.5px solid rgba(255,255,255,.85)",
                boxShadow: "0 22px 44px -16px rgba(40,80,30,.28)",
              }}
            >
              <div style={{ fontSize: 92, lineHeight: 1 }}>{treeStage.emoji}</div>
              <p className="font-bora-body mt-2" style={{ fontSize: 13, color: "#3a2f23" }}>
                {treeStage.legend}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat label="min sem tela" value={stats.total_minutos} icon={<Clock size={14} />} />
                <Stat label="dias seguidos" value={stats.streak} icon={<Flame size={14} />} />
                <Stat label="tipos" value={`${stats.categorias_exploradas}/7`} icon={<Leaf size={14} />} />
              </div>
            </section>

            {stats.streak === 0 && stats.total_conclusoes > 0 && (
              <p className="text-center font-bora-body" style={{ fontSize: 12.5, color: "#7a6a52" }}>
                Tudo bem ter dado uma pausa. Bora recomeçar hoje? 🌿
              </p>
            )}

            {/* Conquistas */}
            <section
              className="rounded-3xl p-5"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(255,255,255,.85)",
                boxShadow: "0 16px 32px -16px rgba(60,40,15,.18)",
              }}
            >
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#E8772A" }}>
                <Award size={13} /> Conquistas ({earned.length}/{BADGES.length})
              </div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {BADGES.map((b) => {
                  const got = earned.find((e) => e.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className="rounded-2xl py-3 px-1 text-center"
                      style={{
                        background: got ? "linear-gradient(160deg, #FFE9C2, #F4C58A)" : "rgba(47,94,31,.05)",
                        opacity: got ? 1 : 0.55,
                        border: got ? "1px solid rgba(232,130,26,.3)" : "1px solid rgba(47,94,31,.08)",
                      }}
                    >
                      <div style={{ fontSize: 28, lineHeight: 1, filter: got ? "none" : "grayscale(.8)" }}>{b.emoji}</div>
                      <div className="mt-1 font-bora-body" style={{ fontSize: 9.5, color: "#3a2f23", lineHeight: 1.15 }}>
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
                background: "#fff",
                border: "1.5px solid rgba(255,255,255,.85)",
                boxShadow: "0 16px 32px -16px rgba(60,40,15,.18)",
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
                    <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
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
                  Ativo 🌿 Vamos lembrar você às {String(hour).padStart(2, "0")}:00 quando o app estiver aberto.
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
                background: "#fff",
                border: "1.5px solid rgba(255,255,255,.85)",
                boxShadow: "0 16px 32px -16px rgba(60,40,15,.18)",
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
                      <div className="text-xl">🌿</div>
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

const Stat = ({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) => (
  <div
    className="rounded-2xl py-3 px-2"
    style={{ background: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.85)" }}
  >
    <div className="flex items-center justify-center gap-1" style={{ color: "#2F5E1F" }}>
      {icon}
      <span className="font-bora-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {value}
      </span>
    </div>
    <div className="mt-0.5 font-bora-body text-center" style={{ fontSize: 10, color: "#7a6a52", lineHeight: 1.1 }}>
      {label}
    </div>
  </div>
);
