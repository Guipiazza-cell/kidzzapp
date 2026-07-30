/**
 * AvatarCustomization - passo 1 da Fábrica de Histórias.
 * Visual cream/gold premium (mesmo mundo da StoryFactory).
 */
import { useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { ChildAvatar } from "@/types/story";
import { haptic } from "@/lib/haptics";

interface AvatarCustomizationProps {
  childName: string;
  onComplete: (avatar: ChildAvatar) => void;
}

const FONT = "'Nunito', system-ui, sans-serif";
const SERIF = "'Lora', Georgia, serif";

const skinTones = [
  { id: "clara", label: "Clara", color: "#F5E0C8" },
  { id: "media-clara", label: "Média clara", color: "#E8C4A0" },
  { id: "media", label: "Média", color: "#C9966A" },
  { id: "media-escura", label: "Média escura", color: "#8B5E3C" },
  { id: "escura", label: "Escura", color: "#5C3A24" },
];

const hairColors = [
  { id: "loiro-claro", label: "Loiro claro", color: "#F5E6A8" },
  { id: "loiro", label: "Loiro", color: "#D4B05A" },
  { id: "castanho-claro", label: "Castanho claro", color: "#A67C52" },
  { id: "castanho", label: "Castanho", color: "#6B4423" },
  { id: "preto", label: "Preto", color: "#1F1A17" },
  { id: "ruivo", label: "Ruivo", color: "#C45A28" },
];

const eyeColors = [
  { id: "castanho", label: "Castanho", color: "#5C3A1E" },
  { id: "azul", label: "Azul", color: "#4A8FD4" },
  { id: "verde", label: "Verde", color: "#3D9B6A" },
  { id: "mel", label: "Mel", color: "#C9923A" },
];

const clothingStyles = [
  { id: "casual", label: "Casual", desc: "Confortável e colorido", tint: "#F0A24C" },
  { id: "esportivo", label: "Esportivo", desc: "Ativo e leve", tint: "#5CB57A" },
  { id: "princesa", label: "Princesa", desc: "Elegante e mágico", tint: "#C07AD8" },
  { id: "super-heroi", label: "Herói", desc: "Capa e coragem", tint: "#E85A4A" },
  { id: "aventureiro", label: "Aventureiro", desc: "Explorador", tint: "#5A8FBF" },
];

const sectionCard: CSSProperties = {
  borderRadius: 22,
  padding: "16px 14px",
  background: "linear-gradient(160deg, rgba(255,253,247,.95) 0%, rgba(250,240,222,.78) 100%)",
  border: "1px solid rgba(255,255,255,1)",
  boxShadow: "0 10px 28px rgba(150,95,20,.10), inset 0 1.5px 0 rgba(255,255,255,1)",
};

const ColorRow = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; color: string }[];
  selected: string;
  onChange: (id: string) => void;
}) => {
  const active = options.find((o) => o.id === selected);
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#3A2410", fontFamily: FONT }}>
          {label}
        </p>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#A88E5E" }}>{active?.label}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => {
          const isOn = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                haptic("light");
                onChange(opt.id);
              }}
              aria-label={opt.label}
              aria-pressed={isOn}
              className="active:scale-95"
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                padding: 0,
                cursor: "pointer",
                background: opt.color,
                border: isOn ? "2.5px solid #E8821A" : "2px solid rgba(255,255,255,.95)",
                boxShadow: isOn
                  ? "0 0 0 3px rgba(232,130,26,.28), 0 6px 14px rgba(120,70,20,.22)"
                  : "0 4px 10px rgba(80,50,20,.12), inset 0 1px 0 rgba(255,255,255,.35)",
                position: "relative",
                transition: "transform .15s, box-shadow .2s, border-color .2s",
              }}
            >
              {isOn && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    background: "rgba(0,0,0,.12)",
                  }}
                >
                  <Check size={16} color="#fff" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AvatarCustomization = ({ childName, onComplete }: AvatarCustomizationProps) => {
  const [skinTone, setSkinTone] = useState(skinTones[1].id);
  const [hairColor, setHairColor] = useState(hairColors[3].id);
  const [eyeColor, setEyeColor] = useState(eyeColors[0].id);
  const [clothingStyle, setClothingStyle] = useState(clothingStyles[0].id);

  const handleSubmit = () => {
    haptic("medium");
    // Valores compatíveis com o allowlist do generate-story (PT + id)
    const skinMap: Record<string, string> = {
      clara: "claro",
      "media-clara": "claro",
      media: "moreno",
      "media-escura": "pardo",
      escura: "negro",
    };
    const hairMap: Record<string, string> = {
      "loiro-claro": "loiro",
      loiro: "loiro",
      "castanho-claro": "castanho",
      castanho: "castanho",
      preto: "preto",
      ruivo: "ruivo",
    };
    const eyeMap: Record<string, string> = {
      castanho: "castanho",
      azul: "azul",
      verde: "verde",
      mel: "mel",
    };
    const clothMap: Record<string, string> = {
      casual: "casual",
      esportivo: "esportivo",
      princesa: "princesa",
      "super-heroi": "fantasia",
      aventureiro: "aventura",
    };
    onComplete({
      skinTone: skinMap[skinTone] || "moreno",
      hairColor: hairMap[hairColor] || "castanho",
      eyeColor: eyeMap[eyeColor] || "castanho",
      clothingStyle: clothMap[clothingStyle] || "casual",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ fontFamily: FONT, paddingBottom: 8 }}
    >
      {/* Título */}
      <div style={{ textAlign: "center", marginBottom: 18, paddingTop: 4 }}>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            color: "#D97A1E",
          }}
        >
          Passo 1 · Avatar
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 24,
            lineHeight: 1.2,
            color: "#3A2410",
            letterSpacing: "-0.3px",
          }}
        >
          Como é o {childName}?
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 700, color: "#8A6E42", lineHeight: 1.4 }}>
          Escolha as cores — a história usa isso no personagem (sem desenho de preview).
        </p>
      </div>

      {/* Cores */}
      <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 18, marginBottom: 14 }}>
        <ColorRow label="Tom de pele" options={skinTones} selected={skinTone} onChange={setSkinTone} />
        <div style={{ height: 1, background: "rgba(120,90,40,.1)" }} />
        <ColorRow label="Cor do cabelo" options={hairColors} selected={hairColor} onChange={setHairColor} />
        <div style={{ height: 1, background: "rgba(120,90,40,.1)" }} />
        <ColorRow label="Cor dos olhos" options={eyeColors} selected={eyeColor} onChange={setEyeColor} />
      </div>

      {/* Roupa */}
      <div style={{ ...sectionCard, marginBottom: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 900, color: "#3A2410" }}>
          Estilo de roupa
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {clothingStyles.map((style) => {
            const isOn = clothingStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  haptic("light");
                  setClothingStyle(style.id);
                }}
                className="active:scale-[0.98]"
                style={{
                  textAlign: "left",
                  padding: "12px 12px 11px",
                  borderRadius: 16,
                  cursor: "pointer",
                  background: isOn
                    ? `linear-gradient(160deg, ${style.tint}22 0%, ${style.tint}12 100%)`
                    : "rgba(255,255,255,.55)",
                  border: isOn ? `1.5px solid ${style.tint}` : "1px solid rgba(120,90,40,.12)",
                  boxShadow: isOn ? `0 6px 16px ${style.tint}33` : "none",
                  transition: "all .2s",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: style.tint,
                    marginBottom: 8,
                    boxShadow: `0 0 0 3px ${style.tint}33`,
                  }}
                />
                <div style={{ fontSize: 13, fontWeight: 900, color: "#3A2410", lineHeight: 1.15 }}>
                  {style.label}
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A6E42", marginTop: 3, lineHeight: 1.25 }}>
                  {style.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={handleSubmit}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 15,
          borderRadius: 999,
          cursor: "pointer",
          border: "1px solid rgba(255,255,255,.7)",
          background: "radial-gradient(130% 130% at 30% 22%,#FFD98A 0%,#F2A62B 52%,#D97A1E 100%)",
          boxShadow:
            "0 10px 24px rgba(180,110,20,.4), inset 0 1.5px 1px rgba(255,255,255,.7), inset 0 -5px 10px rgba(150,80,0,.28)",
          fontFamily: FONT,
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: "0.3px",
          color: "#FFF6E6",
        }}
      >
        Continuar
        <ArrowRight size={18} strokeWidth={2.4} />
      </motion.button>
    </motion.div>
  );
};

export default AvatarCustomization;
