/* ── ReferralProgram (redesign Fase B) ──
   Substitui o fundo branco genérico por uma "floresta creme" com KIDZZ
   acenando (estado explorer). Mantém toda a lógica de afiliados existente.
*/

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, Copy, Check, MessageCircle, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAffiliate } from "@/hooks/useAffiliate";
import { supabase } from "@/integrations/supabase/client";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";

interface Props {
  onBack: () => void;
}

const ReferralProgram = ({ onBack }: Props) => {
  const { user, profile } = useAuth();
  const { affiliateCode, generateCode } = useAffiliate();
  const childName = profile?.child_name || "amigo";
  const [copied, setCopied] = useState(false);
  const [monthsEarned, setMonthsEarned] = useState(0);
  const [referredCount, setReferredCount] = useState(0);
  const [customCode, setCustomCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("referral_rewards")
      .select("months_earned, referred_count")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMonthsEarned(data.months_earned);
          setReferredCount(data.referred_count);
        }
      });
  }, [user]);

  const link = affiliateCode
    ? `https://kidzzapp.lovable.app/?ref=${affiliateCode}`
    : "";

  const shareText = `Encontrei o app que mudou nossas conversas em família 💛\n\nO KIDZZ ajuda a responder TODAS as perguntas dos filhos de forma mágica e segura. ${childName !== "amigo" ? `Aqui em casa o(a) ${childName} adora! ` : ""}Experimenta:\n\n${link}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (navigator.share) {
      navigator.share({ text: shareText, url: link }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    }
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Conheça o KIDZZ — o app que mudou nossas conversas em família 💛");
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleGenerateCode = async () => {
    if (!customCode.trim()) return;
    const result = await generateCode(customCode);
    if (result.error) setCodeError(result.error);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      style={{
        // Cream forest gradient — quente, acolhedor, anti-fundo-branco
        background: "linear-gradient(170deg, #FBF6EC 0%, #F5E9D6 35%, #E8D9BC 70%, #D9C29A 100%)",
      }}
    >
      {/* Decorative organic shapes — leaves & glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,168,71,0.25), transparent 65%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(155,194,142,0.3), transparent 65%)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Floating leaves */}
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            className="absolute text-2xl"
            style={{
              top: `${10 + i * 12}%`,
              left: `${5 + (i * 17) % 90}%`,
              opacity: 0.18,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [-8, 8, -8],
            }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            {i % 3 === 0 ? "🍃" : i % 3 === 1 ? "🌿" : "✨"}
          </motion.div>
        ))}
      </div>

      <header
        className="relative z-10 flex items-center gap-3 px-5 pb-3"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/70 text-gray-700 shadow-sm backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Gift size={20} className="text-amber-600" /> Indique & Ganhe
        </h1>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-8">
        {/* Hero — KIDZZ explorer waving */}
        <div className="text-center mt-2 mb-5">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="flex justify-center"
          >
            <KidzzChameleon
              state="explorer"
              mood="guide"
              size="lg"
              interactive
              showParticles
            />
          </motion.div>
          <motion.div
            className="inline-block mt-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-300/40 shadow-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs font-bold text-amber-700">
              👋 Espalha a magia comigo!
            </p>
          </motion.div>
          <h2 className="text-base font-black text-gray-800 mt-3 mb-1">
            Compartilhe o KIDZZ e ganhe tempo grátis 🎁
          </h2>
          <p className="text-xs text-gray-600 font-semibold">
            A cada amigo que assinar: <span className="text-amber-700 font-black">+30 dias grátis</span> pra você!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm text-center border border-amber-200/40">
            <span className="text-2xl font-black text-amber-600">{referredCount}</span>
            <p className="text-[10px] font-bold text-gray-500 mt-1">Famílias indicadas</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm text-center border border-emerald-200/40">
            <span className="text-2xl font-black text-emerald-600">{monthsEarned}</span>
            <p className="text-[10px] font-bold text-gray-500 mt-1">Meses ganhos</p>
          </div>
        </div>

        {/* Code section */}
        {!affiliateCode ? (
          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 shadow-sm mb-5 border border-amber-200/40">
            <p className="text-xs font-bold text-gray-700 mb-3">
              Crie seu código personalizado:
            </p>
            <div className="flex gap-2">
              <input
                value={customCode}
                onChange={e => { setCustomCode(e.target.value); setCodeError(""); }}
                placeholder="ex: maria-kidzz"
                className="flex-1 px-4 py-3 rounded-xl bg-amber-50 text-sm font-bold text-gray-700 placeholder:text-gray-400 border border-amber-200"
              />
              <motion.button
                onClick={handleGenerateCode}
                disabled={!customCode.trim()}
                className="px-5 py-3 rounded-xl bg-amber-600 text-white text-xs font-bold disabled:opacity-30 shadow-md"
                whileTap={{ scale: 0.95 }}
              >
                Criar
              </motion.button>
            </div>
            {codeError && <p className="text-xs text-red-500 mt-2 font-semibold">{codeError}</p>}
          </div>
        ) : (
          <>
            {/* Pre-built WhatsApp message preview */}
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 shadow-sm mb-3 border border-emerald-200/40">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">
                Mensagem pronta pro WhatsApp ✨
              </p>
              <p className="text-xs text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                {shareText}
              </p>
            </div>

            {/* Link display */}
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 shadow-sm mb-5 border border-amber-200/40">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Seu link</p>
              <div className="bg-amber-50 rounded-xl px-3 py-2.5 flex items-center justify-between border border-amber-200/40">
                <span className="text-xs font-bold text-gray-700 truncate mr-2">{link}</span>
                <motion.button
                  onClick={copyLink}
                  className="flex-shrink-0 p-2 rounded-lg bg-amber-200/60"
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-amber-700" />}
                </motion.button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="space-y-2.5 mb-5">
              <motion.button
                onClick={shareWhatsApp}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500 text-white font-bold text-sm shadow-lg"
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle size={20} /> Compartilhar no WhatsApp
              </motion.button>

              <motion.button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/85 backdrop-blur-sm text-gray-700 font-bold text-sm border border-amber-200/40"
                whileTap={{ scale: 0.97 }}
              >
                <Copy size={20} /> {copied ? "Link copiado! ✅" : "Copiar link"}
              </motion.button>

              <motion.button
                onClick={shareEmail}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/85 backdrop-blur-sm text-gray-700 font-bold text-sm border border-amber-200/40"
                whileTap={{ scale: 0.97 }}
              >
                <Mail size={20} /> Enviar por email
              </motion.button>
            </div>
          </>
        )}

        {/* Max info */}
        <div className="bg-amber-100/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-amber-300/40">
          <p className="text-[10px] font-bold text-amber-800">
            Máximo acumulável: 12 meses grátis (1 ano) 🎁
          </p>
          <div className="mt-2 h-2 bg-amber-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (monthsEarned / 12) * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-amber-700 font-semibold mt-1">
            {monthsEarned}/12 meses conquistados
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralProgram;
