import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Lock, FileText, ScrollText, Users, Trash2, ChevronRight, ChevronLeft, Loader2, Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SUPPORT_EMAIL = "kidzz.ia@icloud.com";

type View = "home" | "cuidados" | "politica" | "termos" | "crianca" | "excluir";

interface Props {
  onClose: () => void;
}

const ITEMS: { id: View; emoji: string; icon: JSX.Element; label: string }[] = [
  { id: "cuidados", emoji: "🔒", icon: <Lock size={16} />, label: "Como cuidamos dos seus dados" },
  { id: "politica", emoji: "📄", icon: <FileText size={16} />, label: "Política de Privacidade" },
  { id: "termos", emoji: "📋", icon: <ScrollText size={16} />, label: "Termos de Uso" },
  { id: "crianca", emoji: "👨‍👩‍👧", icon: <Users size={16} />, label: "Dados da criança" },
  { id: "excluir", emoji: "🗑️", icon: <Trash2 size={16} />, label: "Excluir dados" },
];

const PrivacyCenter = ({ onClose }: Props) => {
  const { user } = useAuth();
  const [view, setView] = useState<View>("home");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const requestByEmail = (subject: string, body: string) => {
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const exportData = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const [criancas, memories, conclusoes, perguntas, profile] = await Promise.all([
        supabase.from("criancas").select("*").eq("user_id", user.id),
        supabase.from("memories").select("*").eq("user_id", user.id),
        supabase.from("conclusoes").select("*").eq("user_id", user.id),
        supabase.from("kidzz_questions_log").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      const payload = {
        exportado_em: new Date().toISOString(),
        conta: { id: user.id, email: user.email },
        perfil: profile.data ?? null,
        criancas: criancas.data ?? [],
        memorias: memories.data ?? [],
        atividades_concluidas: conclusoes.data ?? [],
        perguntas: perguntas.data ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kidzz-meus-dados.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Arquivo com seus dados gerado.");
    } catch {
      toast.error("Não foi possível gerar o arquivo agora.");
    } finally {
      setBusy(false);
    }
  };

  const title =
    view === "home" ? "Privacidade e Segurança"
    : view === "cuidados" ? "Como cuidamos dos seus dados"
    : view === "politica" ? "Política de Privacidade"
    : view === "termos" ? "Termos de Uso"
    : view === "crianca" ? "Dados da criança"
    : "Excluir dados da criança";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Privacidade e Segurança"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="bg-card rounded-3xl w-full max-w-md shadow-2xl relative max-h-[85vh] overflow-y-auto overscroll-contain p-5"
      >
        <div className="flex items-center gap-2 mb-4 pr-10">
          {view !== "home" && (
            <button
              onClick={() => { setView("home"); setConfirmDelete(false); }}
              className="w-9 h-9 -ml-1 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0"
              aria-label="Voltar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="text-[17px] font-black text-foreground leading-tight">{title}</h2>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === "home" ? -8 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {view === "home" && (
              <div className="space-y-4">
                <p className="text-[13px] font-bold text-foreground">
                  Cuidamos dos dados da sua família com responsabilidade.
                </p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Os dados do KIDZZ são utilizados para oferecer uma experiência personalizada e segura
                  para sua família. No caso de crianças, adotamos cuidados adicionais e tratamos essas
                  informações considerando sempre o seu melhor interesse.
                </p>
                <div className="space-y-2">
                  {ITEMS.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setView(it.id)}
                      className="w-full min-h-[52px] flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-base" aria-hidden>{it.emoji}</span>
                      <span className="flex-1 text-[13px] font-bold text-foreground">{it.label}</span>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === "cuidados" && (
              <div className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
                <p className="text-[14px] font-extrabold text-foreground">Privacidade em primeiro lugar</p>
                <p>
                  O KIDZZ coleta e utiliza apenas os dados necessários para oferecer suas funcionalidades,
                  personalizar a experiência e manter a segurança da plataforma.
                </p>
                <p>
                  Dados relacionados às crianças recebem cuidados especiais. O acesso é limitado ao perfil
                  correspondente e não deve existir compartilhamento de informações entre irmãos ou outros perfis.
                </p>
                <p>Não vendemos dados pessoais.</p>
                <p>
                  Quando utilizamos serviços de terceiros para operar determinadas funcionalidades, eles recebem
                  apenas as informações necessárias para executar aquele serviço, conforme aplicável.
                </p>
              </div>
            )}

            {view === "politica" && (
              <div className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
                <p>
                  Esta Política explica como o KIDZZ coleta, utiliza, armazena e protege dados pessoais
                  durante a utilização da plataforma.
                </p>
                <p className="text-[11px] italic opacity-70">
                  Documento em atualização. A versão jurídica definitiva será disponibilizada aqui.
                </p>
              </div>
            )}

            {view === "termos" && (
              <div className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
                <p>Estes Termos estabelecem as condições para utilização dos serviços KIDZZ.</p>
                <p>Leia atentamente antes de utilizar a plataforma.</p>
                <p className="text-[11px] italic opacity-70">
                  Documento em atualização. A versão jurídica definitiva será disponibilizada aqui.
                </p>
              </div>
            )}

            {view === "crianca" && (
              <div className="space-y-4">
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Você pode consultar, corrigir ou solicitar informações sobre os dados associados ao perfil
                  da sua criança. O KIDZZ busca manter essas informações protegidas e vinculadas ao perfil correto.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={exportData}
                    disabled={busy || !user}
                    className="w-full min-h-[48px] rounded-2xl bg-muted/60 hover:bg-muted text-foreground font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Consultar meus dados
                  </button>
                  <button
                    onClick={() => requestByEmail("Solicitação de correção de dados - KIDZZ", `Conta: ${user?.email ?? ""}\n\nDescreva a correção desejada:`)}
                    className="w-full min-h-[48px] rounded-2xl bg-muted/60 hover:bg-muted text-foreground font-bold text-[13px]"
                  >
                    Solicitar correção
                  </button>
                  <button
                    onClick={() => setView("excluir")}
                    className="w-full min-h-[48px] rounded-2xl bg-muted/60 hover:bg-muted text-foreground font-bold text-[13px]"
                  >
                    Solicitar exclusão
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground/80">
                  Correção e exclusão são registradas como solicitação e tratadas pela nossa equipe.
                </p>
              </div>
            )}

            {view === "excluir" && (
              <div className="space-y-4">
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Se você desejar excluir os dados associados ao perfil da sua criança, poderá solicitar a
                  exclusão. Alguns dados poderão precisar ser mantidos quando houver obrigação legal ou outra
                  hipótese permitida pela legislação.
                </p>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full min-h-[48px] rounded-2xl bg-destructive/10 text-destructive font-extrabold text-[13px] hover:bg-destructive/20"
                  >
                    Solicitar exclusão dos dados
                  </button>
                ) : (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <p className="text-[13px] font-bold text-foreground">Confirmar como responsável</p>
                    <p className="text-[12px] text-muted-foreground">
                      Confirmo que sou o responsável e desejo solicitar a exclusão dos dados.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 min-h-[44px] rounded-xl bg-muted text-foreground font-bold text-[13px]"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          requestByEmail(
                            "Solicitação de exclusão de dados - KIDZZ",
                            `Conta: ${user?.email ?? ""}\nID: ${user?.id ?? ""}\n\nConfirmo, como responsável, a solicitação de exclusão dos dados associados ao perfil da minha criança.`,
                          );
                          toast.success("Solicitação preparada no seu e-mail.");
                          setConfirmDelete(false);
                        }}
                        className="flex-1 min-h-[44px] rounded-xl bg-destructive text-destructive-foreground font-extrabold text-[13px]"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground/80">
                  A exclusão é processada pela nossa equipe após a solicitação. Ainda não é executada
                  automaticamente pelo aplicativo.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyCenter;
