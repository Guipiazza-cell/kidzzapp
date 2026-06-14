import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Crown, Sparkles, MessageCircle, Volume2, Lock, Star, Zap, LogIn, Link2, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QuestionHistoryPanel from "@/components/parental/QuestionHistoryPanel";

interface ParentalSettingsProps {
  onClose: () => void;
}

const AGE_RANGES = [
{ range: "0-3", label: "0 a 3 anos", emoji: "👶", description: "Sons, cores e palavras curtas." },
{ range: "3-7", label: "3 a 7 anos", emoji: "🧒", description: "Historinhas e exemplos do dia a dia." },
{ range: "7-10", label: "7 a 10 anos", emoji: "🧑‍🎓", description: "Curiosidades e desafios científicos." }];

type BillingPeriod = "monthly" | "annual";


const ParentalSettings = ({ onClose }: ParentalSettingsProps) => {
  const { user, profile, tier, updateProfile, signOut, signIn, signUp, handleCheckout, openCustomerPortal } = useAuth();
  const { affiliateCode, generateCode, loading: affLoading } = useAffiliate();
  const navigate = useNavigate();
  const currentAge = profile?.age_range || "3-7";
  const isPremium = profile?.is_premium ?? false;

  // Auth form state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [affInput, setAffInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");

  const currentPlan = tier === "premium" ? "super_premium" : isPremium ? "premium" : "free";

  const handleAgeChange = async (range: string) => {
    await updateProfile({ age_range: range });
  };

  const handleReset = async () => {
    await signOut();
    onClose();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const { error } = await signUp(email, password);
        if (error) toast.error(error);else
        toast.success("Conta criada com sucesso! 🎉");
      } else {
        const { error } = await signIn(email, password);
        if (error) toast.error(error);else
        toast.success("Login realizado! 🎉");
      }
      setShowAuth(false);
    } catch {
      toast.error("Erro ao autenticar");
    } finally {
      setAuthLoading(false);
    }
  };

  const onPlanCheckout = async (planId: string) => {
    if (planId === "free") return;
    if (!user) {
      toast.error("Crie uma conta primeiro para assinar!");
      setShowAuth(true);
      return;
    }
    setCheckoutLoading(planId);
    try {
      await handleCheckout(planId as any);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="bg-card rounded-3xl p-5 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto opacity-85 border-4">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X size={20} />
        </button>

        <h2 className="font-extrabold text-xl text-foreground text-center mb-1">⚙️ Controle Parental</h2>
        <p className="text-muted-foreground text-xs text-center mb-4">Gerencie a experiência do seu filho</p>

        <div className="space-y-4">
          {/* Account status */}
          {!user &&
          <button
            onClick={() => setShowAuth(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all">
            
              <LogIn size={16} />
              Criar conta / Fazer login
            </button>
          }

          {/* Auth form */}
          {showAuth && !user &&
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleAuth}
            className="bg-muted/50 rounded-2xl p-4 space-y-3">
            
              <div className="flex gap-2 mb-2">
                <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authMode === "login" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`
                }>
                
                  Login
                </button>
                <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authMode === "signup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`
                }>
                
                  Criar conta
                </button>
              </div>
              <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full py-3 px-4 rounded-xl bg-background border border-border text-foreground text-sm"
              required />
            
              <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (min. 6 caracteres)"
              className="w-full py-3 px-4 rounded-xl bg-background border border-border text-foreground text-sm"
              required
              minLength={6} />
            
              <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
              
                {authLoading ? "Carregando..." : authMode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </motion.form>
          }

          {user &&
          <div className="bg-kid-green/10 border border-kid-green/30 rounded-2xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Logado como</p>
              <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
            </div>
          }

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
                    setShowAuth(true);
                    return;
                  }
                  onClose();
                  navigate("/?paywall=1");
                }}
                className="w-full py-3 rounded-2xl kid-gradient-premium text-white font-extrabold text-sm shadow-lg active:scale-[0.98] transition-transform"
              >
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
              {AGE_RANGES.map(({ range, emoji, label, description }) =>
              <button
                key={range}
                onClick={() => handleAgeChange(range)}
                className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                currentAge === range ?
                "bg-primary text-primary-foreground shadow-md" :
                "bg-muted text-muted-foreground hover:bg-primary/10"}`
                }>
                
                  <span className="text-lg block">{emoji}</span>
                  {label}
                  <span className="block text-[9px] mt-0.5 opacity-70">{description}</span>
                </button>
              )}
            </div>
          </div>

          {/* Content safety */}
          <div className="bg-kid-green/10 border border-kid-green/30 rounded-2xl p-3">
            <p className="font-extrabold text-sm text-foreground">🔒 Segurança de conteúdo</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Todas as respostas são filtradas automaticamente. Conteúdos impróprios como violência, linguagem adulta ou temas inadequados são bloqueados em tempo real. O nível de linguagem se adapta à faixa etária selecionada.

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
              <p className="text-xs text-primary font-bold">Faça login acima para criar seu link de afiliado.</p>
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
                    className="p-2 rounded-xl bg-primary text-primary-foreground">
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
                  className="py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
                  Criar
                </button>
              </div>
            )}
          </div>

          {/* Manage subscription */}
          {user && isPremium && (
            <button
              onClick={() => openCustomerPortal()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-kid-purple/10 text-kid-purple font-bold text-sm hover:bg-kid-purple/20 transition-all border border-kid-purple/30">
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
          {user &&
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-all">
            
              Sair da conta
            </button>
          }
        </div>
      </motion.div>
    </motion.div>);

};

export default ParentalSettings;