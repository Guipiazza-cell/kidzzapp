import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Share2, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { captureAndShare } from "@/lib/viralShare";
import { ShareMomentCard } from "./ShareMomentCard";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  activity: {
    id?: string | null;
    titulo: string;
    emoji: string;
    tela_min: number;
  } | null;
  criancaId?: string | null;
  childName?: string;
};

export const ComoFoiModal = ({ open, onClose, onSaved, activity, criancaId, childName = "" }: Props) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [photoData, setPhotoData] = useState<string | null>(null); // dataURL
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!activity) return null;

  const onPickPhoto = (f: File) => {
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = () => setPhotoData(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!user || saving || saved) return;
    setSaving(true);
    try {
      let foto_url: string | null = null;
      if (photoFile) {
        const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const up = await supabase.storage.from("momentos").upload(path, photoFile, { contentType: photoFile.type, upsert: false });
        if (!up.error) foto_url = path;
      }
      await supabase.from("conclusoes").insert({
        user_id: user.id,
        crianca_id: criancaId || null,
        activity_id: activity.id || null,
        titulo_snapshot: activity.titulo,
        tela_min: activity.tela_min,
        foto_url,
      });
      setSaved(true);
      onSaved?.();
    } catch (e) {
      console.error("[ComoFoiModal] save error", e);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      // garante que salvou antes
      if (!saved) await handleSave();
      await captureAndShare(cardRef.current, {
        title: "Momento Sem Tela 🌿",
        text: `Hoje a gente brincou de verdade. ${activity.tela_min} min sem tela. #MovimentoMenosTela`,
        filename: `kidzz-momento-${Date.now()}.png`,
      });
    } finally {
      setSharing(false);
    }
  };

  const closeAndReset = () => {
    setPhotoData(null);
    setPhotoFile(null);
    setSaved(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{
            background: "rgba(20, 35, 18, 0.6)",
            backdropFilter: "blur(8px)",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 140px)",
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto overflow-x-hidden"
            style={{
              background: "linear-gradient(180deg, #FFFDF6 0%, #FFF3D9 100%)",
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 30px 80px -20px rgba(40,70,30,0.45)",
            }}
          >
            <button
              type="button"
              onClick={closeAndReset}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(47,94,31,0.08)", color: "#2F5E1F" }}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#E8772A" }}>
              Como foi?
            </div>
            <h2
              className="mt-1 font-bora-display"
              style={{ fontSize: 22, color: "#2F5E1F", letterSpacing: "-0.01em", lineHeight: 1.15 }}
            >
              {activity.emoji} {activity.titulo}
            </h2>
            <p className="mt-1 font-bora-body" style={{ fontSize: 13.5, color: "#7a6a52" }}>
              {childName ? `${childName} e você ` : "Vocês "} acabaram de criar <b>{activity.tela_min} min sem tela</b>. 🌿
            </p>

            {/* Photo picker */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-2xl py-4 px-4 flex items-center gap-3 active:scale-[.98] transition-transform"
                style={{
                  background: photoData ? "rgba(47,94,31,.08)" : "#fff",
                  border: "2px dashed rgba(47,94,31,.25)",
                  color: "#2F5E1F",
                }}
              >
                {photoData ? (
                  <img src={photoData} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <span
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(47,94,31,.08)" }}
                  >
                    <Camera size={22} />
                  </span>
                )}
                <span className="text-left flex-1">
                  <span className="block font-semibold" style={{ fontSize: 14 }}>
                    {photoData ? "Foto adicionada" : "Adicionar foto (opcional)"}
                  </span>
                  <span className="block" style={{ fontSize: 11.5, color: "#7a6a52" }}>
                    Foque na criação. Foto do rosto é sempre escolha do pai.
                  </span>
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickPhoto(f); }}
              />
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="w-full rounded-full py-3.5 font-bold text-white flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg, #F4A659, #E8821A)",
                  boxShadow: "0 10px 22px -4px rgba(232,130,26,.55)",
                  fontSize: 15,
                }}
              >
                {sharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                {sharing ? "Gerando cartão..." : "Compartilhar momento"}
              </button>
              <button
                type="button"
                onClick={async () => { await handleSave(); closeAndReset(); }}
                disabled={saving}
                className="w-full rounded-full py-3 font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
                style={{
                  background: "rgba(47,94,31,.08)",
                  color: "#2F5E1F",
                  fontSize: 14,
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                {saved ? "Guardado 🌿" : "Só guardar pra mim"}
              </button>
            </div>

            <p className="mt-3 text-center font-bora-body" style={{ fontSize: 11.5, color: "#9a8c72" }}>
              Nada é compartilhado automaticamente. Só quando você toca em compartilhar.
            </p>

            {/* Off-screen share card */}
            <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
              <ShareMomentCard
                ref={cardRef}
                childName={childName}
                titulo={activity.titulo}
                emoji={activity.emoji}
                telaMin={activity.tela_min}
                photoDataUrl={photoData}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
