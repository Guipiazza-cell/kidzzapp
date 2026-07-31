/**
 * AvatarCustomization - passo 1 da Fábrica de Histórias.
 * Liquid glass do dock + fundo premium (padrão Resposta / dock).
 */
import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { ChildAvatar } from "@/types/story";
import { haptic } from "@/lib/haptics";
import { FONT, SERIF, R } from "@/lib/premiumUi";

interface AvatarCustomizationProps {
  childName: string;
  onComplete: (avatar: ChildAvatar) => void;
}

const BG = "/exemplos/assets/cena-historias.png";

const dockGlass: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.48) 0%, rgba(255,255,255,.26) 50%, rgba(255,255,255,.18) 100%)",
  border: "0.5px solid rgba(255,255,255,.62)",
  boxShadow:
    "0 14px 40px rgba(20,16,30,.14), 0 2px 8px rgba(20,16,30,.05), inset 0 1px 0 rgba(255,255,255,.78), inset 0 -1px 0 rgba(255,255,255,.1)",
  backdropFilter: "blur(36px) saturate(200%)",
  WebkitBackdropFilter: "blur(36px) saturate(200%)",
};

const dockCard: CSSProperties = {
  ...dockGlass,
  borderRadius: 28,
};

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
  { id: "casual", label: "Casual", desc: "Confortável", tint: "#F0A24C" },
  { id: "esportivo", label: "Esportivo", desc: "Ativo", tint: "#5CB57A" },
  { id: "princesa", label: "Princesa", desc: "Mágico", tint: "#C07AD8" },
  { id: "super-heroi", label: "Herói", desc: "Coragem", tint: "#E85A4A" },
  { id: "aventureiro", label: "Aventureiro", desc: "Explorar", tint: "#5A8FBF" },
];

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
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 900, color: "#1A2818", letterSpacing: "0.01em" }}>
          {label}
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(26,40,24,.55)",
          }}
        >
          {active?.label}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
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
                width: 42,
                height: 42,
                borderRadius: 999,
                padding: 0,
                cursor: "pointer",
                background: opt.color,
                border: isOn ? "2.5px solid #E8821A" : "2px solid rgba(255,255,255,.95)",
                boxShadow: isOn
                  ? "0 0 0 3px rgba(232,130,26,.25), 0 6px 14px rgba(80,50,20,.18)"
                  : "0 3px 8px rgba(40,30,20,.12), inset 0 1px 0 rgba(255,255,255,.4)",
                position: "relative",
                transition: "transform .15s, box-shadow .2s",
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
                    background: "rgba(0,0,0,.16)",
                  }}
                >
                  <Check size={15} color="#fff" strokeWidth={3} />
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

  const summary = useMemo(() => {
    const skin = skinTones.find((s) => s.id === skinTone);
    const hair = hairColors.find((h) => h.id === hairColor);
    const eye = eyeColors.find((e) => e.id === eyeColor);
    const cloth = clothingStyles.find((c) => c.id === clothingStyle);
    return { skin, hair, eye, cloth };
  }, [skinTone, hairColor, eyeColor, clothingStyle]);

  const handleSubmit = () => {
    haptic("medium");
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily: FONT,
        position: "relative",
        margin: "0 -16px -8px",
        padding: "0 16px 100px",
      }}
    >
      {/* Fundo full-bleed atrás do conteúdo (não fixed: respeita o shell da factory) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -80,
          bottom: -40,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <img
          src={BG}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "40% 38%",
            filter: "saturate(1.05) brightness(1.06)",
            transform: "scale(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255,240,200,.45) 0%, transparent 58%)," +
              "linear-gradient(180deg, rgba(255,252,248,.42) 0%, rgba(250,245,232,.68) 40%, rgba(248,244,230,.9) 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Progresso 1/2 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, paddingTop: 4 }}>
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: "linear-gradient(90deg, #F0A24C, #E8821A)",
              boxShadow: "0 1px 6px rgba(232,130,26,.35)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,.45)",
              border: "0.5px solid rgba(255,255,255,.55)",
            }}
          />
        </div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 14 }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 10.5,
              fontWeight: 900,
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "#D97A1E",
            }}
          >
            Passo 1 de 2
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 26,
              lineHeight: 1.15,
              color: "#1A2818",
              letterSpacing: "-0.35px",
              textShadow: "0 1px 14px rgba(255,255,255,.5)",
            }}
          >
            Como é o {childName}?
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(40,55,35,.58)",
              lineHeight: 1.4,
              maxWidth: 320,
            }}
          >
            Escolha as cores. A história usa isso no personagem.
          </p>
        </motion.div>

        {/* Preview live da paleta escolhida */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            ...dockCard,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", marginLeft: 2 }}>
            {[summary.skin?.color, summary.hair?.color, summary.eye?.color, summary.cloth?.tint].map(
              (c, i) => (
                <span
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: c,
                    border: "2px solid rgba(255,255,255,.9)",
                    marginLeft: i === 0 ? 0 : -8,
                    boxShadow: "0 3px 8px rgba(40,30,20,.15)",
                    zIndex: 4 - i,
                  }}
                />
              ),
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "rgba(40,55,35,.5)" }}>
              Paleta do herói
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12.5,
                fontWeight: 800,
                color: "#1A2818",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {summary.cloth?.label} · {summary.hair?.label} · {summary.eye?.label}
            </p>
          </div>
        </motion.div>

        {/* Cores */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            ...dockCard,
            padding: "16px 14px",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <ColorRow label="Tom de pele" options={skinTones} selected={skinTone} onChange={setSkinTone} />
          <div style={{ height: 1, background: "rgba(60,50,30,.08)" }} />
          <ColorRow label="Cor do cabelo" options={hairColors} selected={hairColor} onChange={setHairColor} />
          <div style={{ height: 1, background: "rgba(60,50,30,.08)" }} />
          <ColorRow label="Cor dos olhos" options={eyeColors} selected={eyeColor} onChange={setEyeColor} />
        </motion.div>

        {/* Roupa */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{ ...dockCard, padding: "14px 12px 12px", marginBottom: 8 }}
        >
          <p style={{ margin: "0 0 12px 4px", fontSize: 12.5, fontWeight: 900, color: "#1A2818" }}>
            Estilo de roupa
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
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
                  className="active:scale-[0.97]"
                  style={{
                    flex: "none",
                    width: 108,
                    textAlign: "left",
                    padding: "12px 11px",
                    borderRadius: 18,
                    cursor: "pointer",
                    background: isOn
                      ? `linear-gradient(160deg, ${style.tint}38 0%, ${style.tint}14 100%)`
                      : "rgba(255,255,255,.32)",
                    border: isOn ? `1.5px solid ${style.tint}` : "0.5px solid rgba(255,255,255,.55)",
                    boxShadow: isOn
                      ? `0 8px 18px ${style.tint}35, inset 0 1px 0 rgba(255,255,255,.45)`
                      : "inset 0 1px 0 rgba(255,255,255,.35)",
                    transition: "all .18s",
                  }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 999,
                      background: style.tint,
                      marginBottom: 8,
                      boxShadow: isOn ? `0 0 0 3px ${style.tint}40` : "none",
                    }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1A2818", lineHeight: 1.15 }}>
                    {style.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "rgba(40,55,35,.52)",
                      marginTop: 3,
                    }}
                  >
                    {style.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* CTA sticky inferior */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 88px)",
          background: "linear-gradient(180deg, transparent 0%, rgba(248,244,230,.75) 28%, rgba(248,244,230,.95) 100%)",
          pointerEvents: "none",
        }}
      >
        <motion.button
          type="button"
          onClick={handleSubmit}
          whileTap={{ scale: 0.97 }}
          className="active:scale-[0.98]"
          style={{
            pointerEvents: "auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 52,
            borderRadius: R.btn,
            cursor: "pointer",
            border: "0.5px solid rgba(255,235,190,.7)",
            background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
            boxShadow:
              "0 10px 28px rgba(180,100,20,.38), 0 1px 0 rgba(255,250,230,.9) inset, 0 -3px 8px rgba(100,50,0,.16) inset",
            fontFamily: FONT,
            fontSize: 15.5,
            fontWeight: 900,
            color: "#2A1608",
          }}
        >
          Continuar
          <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AvatarCustomization;
