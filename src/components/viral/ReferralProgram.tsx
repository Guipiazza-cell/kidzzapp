import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, Copy, Check, MessageCircle, Share2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAffiliate } from "@/hooks/useAffiliate";
import { supabase } from "@/integrations/supabase/client";
import pixelImg from "@/assets/pixel-chameleon.png";

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

  const shareText = `Encontrei o app que mudou nossas conversas em família 💛 O KIDZZ ajuda a responder todas as perguntas do seu filho de forma mágica. Experimente!\n\n${link}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (navigator.share) {
      navigator.share({ text: shareText, url: link });
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
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[hsl(270,30%,95%)] to-white"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
    >
      <header
        className="flex items-center gap-3 px-5 pb-3"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button onClick={onBack} className="p-2 rounded-xl bg-white/80 text-gray-600 shadow-sm" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Gift size={20} className="text-purple-500" /> Indique & Ganhe
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Hero */}
        <div className="text-center mt-2 mb-5">
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-20 h-20 mx-auto object-contain mb-3"
            style={{ filter: "brightness(1.15) drop-shadow(0 0 12px rgba(100,160,255,0.5))" }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <h2 className="text-base font-black text-gray-800 mb-1">
            Compartilhe o KIDZZ e ganhe tempo grátis 🎁
          </h2>
          <p className="text-xs text-gray-500 font-semibold">
            A cada amigo que assinar: +30 dias grátis pra você!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <span className="text-2xl font-black text-purple-600">{referredCount}</span>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Famílias indicadas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <span className="text-2xl font-black text-green-600">{monthsEarned}</span>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Meses ganhos</p>
          </div>
        </div>

        {/* Code section */}
        {!affiliateCode ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <p className="text-xs font-bold text-gray-600 mb-3">Crie seu código personalizado:</p>
            <div className="flex gap-2">
              <input
                value={customCode}
                onChange={e => { setCustomCode(e.target.value); setCodeError(""); }}
                placeholder="ex: maria-kidzz"
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-sm font-bold text-gray-700 placeholder:text-gray-400"
              />
              <motion.button
                onClick={handleGenerateCode}
                disabled={!customCode.trim()}
                className="px-5 py-3 rounded-xl bg-purple-600 text-white text-xs font-bold disabled:opacity-30"
                whileTap={{ scale: 0.95 }}
              >
                Criar
              </motion.button>
            </div>
            {codeError && <p className="text-xs text-red-500 mt-2 font-semibold">{codeError}</p>}
          </div>
        ) : (
          <>
            {/* Link display */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Seu link</p>
              <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 truncate mr-2">{link}</span>
                <motion.button
                  onClick={copyLink}
                  className="flex-shrink-0 p-2 rounded-lg bg-gray-200"
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
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
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                <Copy size={20} /> {copied ? "Link copiado! ✅" : "Copiar link"}
              </motion.button>

              <motion.button
                onClick={shareEmail}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                <Mail size={20} /> Enviar por email
              </motion.button>
            </div>
          </>
        )}

        {/* Max info */}
        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-bold text-purple-600">
            Máximo acumulável: 12 meses grátis (1 ano) 🎁
          </p>
          <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (monthsEarned / 12) * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-purple-400 font-semibold mt-1">
            {monthsEarned}/12 meses conquistados
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralProgram;
