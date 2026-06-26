import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Crown, LogIn, Link2, Copy, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QuestionHistoryPanel from "@/components/parental/QuestionHistoryPanel";

interface ParentalSettingsProps {
  onClose: () => void;
}

const AMBER = "#E8821A";
const AMBER_DEEP = "#C96B0E";

const AGE_RANGES = [
  { range: "0-3", label: "0 a 3 anos", emoji: "👶", description: "Sons, cores e palavras curtas." },
  { range: "3-7", label: "3 a 7 anos", emoji: "🧒", description: "Historinhas e exemplos do dia a dia." },
  { range: "7-10", label: "7 a 10 anos", emoji: "🧑‍🎓", description: "Curiosidades e desafios científicos." },
];

const ParentalSettings = ({ onClose }: ParentalSettingsProps) => {
  const { user, profile, tier, updateProfile, signOut, openCustomerPortal } = useAuth();
  const { affiliateCode, generateCode, loading: affLoading } = useAffiliate();
  const navigate = useNavigate();
  const currentAge = profile?.age_range || "3-7";
  const isPremium = profile?.is_premium ?? false;

  const [affInput, setAffInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAgeChange = async (range: string) => {
    await updateProfile({ age_range: range });
  };

  const handleReset = async () => {
    await signOut();
    onClose();
  };

  const goToAuth = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="bg-card rounded-3xl p-5 w-full max-w-md shadow-2xl relative max-h-[85vh] overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <h2 className="font-extrabold text-xl text-foreground text-center mb-1">⚙️ Controle Parental</h2>
        <p className="text-muted-foreground text-xs text-center mb-5">Gerencie a experiência do seu filho</p>

        <div className="space-y-4">
          {/* Account status */}
          {!user && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-center space-y-3">
              <div className="text-3xl">🔐</div>
              <h3 className="text-sm font-extrabold text-foreground">Crie sua conta para proteger os dados</h3>
              <p className="text-xs text-muted-foreground">
                Acompanhe o progresso, gere link de afiliado e gerencie a assinatura com segurança.
              </p>
              <motion.button
                onClick={goToAuth}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(180deg, ${AMBER} 0%, ${AMBER_DEEP} 100%)`,
                  boxShadow: "0 8px 20px -8px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <LogIn size={16} />
                Entrar ou criar conta
              </motion.button>
            </div>
          )}

          {user && (
            <div className="bg-kid-green/10 border border-kid-green/30 rounded-2xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Logado como</p>
              <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
            </div>
          )}

          {/* Current plan highlight */}
          <div className={`rounded-2xl p-4 text-center ${isPremium ? "kid-gradient-premium text-white" : "bg-muted"}`}>
            <p className="font-extrabold text-lg">
              {tier === "premium"
                ? "⚡ Kidzz Premium Ativo"
                : isPremium
                ? "⭐ Plano Kidzz Ativo"
                : "Plano Gratuito"}
            </p>
            <p className="text-sm opacity-80">
              {isPremium
                ? "Você tem acesso completo. ✨"
                : "Experimente algumas perguntas e 1 história por dia."}
            </p>
          </div>

          {/* Plans — CTA unificado para a tela canônica */}
          {!isPremium && (
            <div>
              <label className="font-bold text-foreground text-sm block mb-2">
                <Crown size={14} className="inline mr-1" />
                Assinatura Kidzz
              </label>
              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Crie uma conta primeiro para assinar!");
                    goToAuth();
                    return;
                  }
                  onClose();
                  navigate("/?paywall=1");
                }}
                className="w-full py-3 rounded-2xl kid-gradient-premium text-white font-extrabold text-sm shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                ✨ Ver planos e começar
              </button>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Pagamento seguro via Stripe · Cancele quando quiser · Você não será cobrado hoje sem confirmar
              </p>
            </div>
          )}

          {/* Age range */}
          <div>
            <label className="font-bold text-foreground text-sm block mb-2">
              <ShieldCheck size={14} className="inline mr-1" />
              Faixa etária
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_RANGES.map(({ range, emoji, label, description }) => (
                <button
                  key={range}
                  onClick={() => handleAgeChange(range)}
                  className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                    currentAge === range
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  <span className="text-lg block">{emoji}</span>
                  {label}
                  <span className="block text-[9px] mt-0.5 opacity-70">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content safety */}
          <div className="bg-kid-green/10 border border-kid-green/30 rounded-2xl p-3">
            <p className="font-extrabold text-sm text-foreground">🔒 Segurança de conteúdo</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Todas as respostas são filtradas automaticamente. Conteúdos impróprios como violência, linguagem adulta ou temas inadequados são bloqueados em tempo real. O nível de linguagem se adapta à faixa etária selecionada.
            </p>
          </div>

          {/* Child info */}
          <div className="bg-muted/50 rounded-2xl p-3">
            <p className="font-bold text-sm text-foreground">👧 Nome da criança</p>
            <p className="text-sm text-muted-foreground">{profile?.child_name || "Não definido"}</p>
          </div>

          {/* Question history (parent panel) */}
          <QuestionHistoryPanel />

          {/* Affiliate program */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 size={16} className="text-primary" />
              <p className="font-extrabold text-sm text-foreground">Programa de Afiliados</p>
            </div>
            <p className="text-xs text-muted-foreground">Ganhe 10% de comissão por cada assinatura feita pelo seu link!</p>

            {!user ? (
              <button
                onClick={goToAuth}
                className="w-full py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/70 transition-all"
              >
                Faça login para criar seu link de afiliado
              </button>
            ) : affiliateCode ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/?ref=${affiliateCode}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-background border border-border text-foreground text-xs"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?ref=${affiliateCode}`);
                      setCopied(true);
                      toast.success("Link copiado!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 rounded-xl bg-primary text-primary-foreground"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={affInput}
                  onChange={(e) => setAffInput(e.target.value)}
                  placeholder="Escolha seu código (ex: joao)"
                  className="flex-1 py-2 px-3 rounded-xl bg-background border border-border text-foreground text-xs"
                />
                <button
                  onClick={async () => {
                    const { error } = await generateCode(affInput);
                    if (error) toast.error(error);
                    else toast.success("Link de afiliado criado! 🎉");
                  }}
                  disabled={affLoading || affInput.length < 3}
                  className="py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50"
                >
                  Criar
                </button>
              </div>
            )}
          </div>

          {/* Manage subscription */}
          {user && isPremium && (
            <button
              onClick={() => openCustomerPortal()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-kid-purple/10 text-kid-purple font-bold text-sm hover:bg-kid-purple/20 transition-all border border-kid-purple/30"
            >
              <Crown size={16} />
              Gerenciar / Cancelar assinatura
            </button>
          )}

          {/* Support email */}
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="font-bold text-sm text-foreground">📧 Suporte</p>
            <a href="mailto:kidzz.ia@icloud.com" className="text-xs text-primary font-bold hover:underline">
              kidzz.ia@icloud.com
            </a>
          </div>

          {/* Privacy Policy */}
          <button
            onClick={() => { onClose(); navigate("/privacy"); }}
            className="w-full py-3 rounded-2xl bg-muted/50 text-muted-foreground font-bold text-xs hover:bg-muted transition-all"
          >
            🔒 Política de Privacidade e Termos de Uso
          </button>

          {/* Logout - only show when logged in */}
          {user && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-all"
            >
              Sair da conta
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParentalSettings;
