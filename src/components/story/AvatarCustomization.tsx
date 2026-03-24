import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ChildAvatar } from "@/types/story";

interface AvatarCustomizationProps {
  childName: string;
  onComplete: (avatar: ChildAvatar) => void;
}

const skinTones = [
  { id: "clara", label: "Clara", color: "hsl(30 50% 90%)" },
  { id: "media-clara", label: "Média Clara", color: "hsl(30 45% 75%)" },
  { id: "media", label: "Média", color: "hsl(30 40% 60%)" },
  { id: "media-escura", label: "Média Escura", color: "hsl(30 35% 45%)" },
  { id: "escura", label: "Escura", color: "hsl(30 30% 30%)" },
];

const hairColors = [
  { id: "loiro-claro", label: "Loiro Claro", color: "hsl(50 70% 80%)" },
  { id: "loiro", label: "Loiro", color: "hsl(45 60% 60%)" },
  { id: "castanho-claro", label: "Castanho Claro", color: "hsl(30 40% 50%)" },
  { id: "castanho", label: "Castanho", color: "hsl(25 35% 35%)" },
  { id: "preto", label: "Preto", color: "hsl(0 0% 15%)" },
  { id: "ruivo", label: "Ruivo", color: "hsl(15 70% 45%)" },
];

const eyeColors = [
  { id: "castanho", label: "Castanho", color: "hsl(25 50% 30%)" },
  { id: "azul", label: "Azul", color: "hsl(210 70% 50%)" },
  { id: "verde", label: "Verde", color: "hsl(140 60% 40%)" },
  { id: "mel", label: "Mel", color: "hsl(35 60% 45%)" },
];

const clothingStyles = [
  { id: "casual", label: "Casual Colorido", desc: "Roupas vibrantes e confortáveis", emoji: "👕" },
  { id: "esportivo", label: "Esportivo", desc: "Roupa esportiva e ativa", emoji: "⚽" },
  { id: "princesa", label: "Princesa/Príncipe", desc: "Roupas elegantes e mágicas", emoji: "👑" },
  { id: "super-heroi", label: "Super-herói", desc: "Com capa e máscara", emoji: "🦸" },
  { id: "aventureiro", label: "Aventureiro", desc: "Roupa de explorador", emoji: "🧭" },
];

const ColorPicker = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; color: string }[];
  selected: string;
  onChange: (id: string) => void;
}) => (
  <div>
    <p className="text-sm font-extrabold text-white mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            selected === opt.id
              ? "ring-2 ring-kid-orange scale-105 bg-white/10"
              : "hover:bg-white/5"
          }`}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-white/20 shadow-inner"
            style={{ background: opt.color }}
          />
          <span className="text-[10px] text-white/70 font-bold">{opt.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const AvatarCustomization = ({ childName, onComplete }: AvatarCustomizationProps) => {
  const [skinTone, setSkinTone] = useState(skinTones[0].id);
  const [hairColor, setHairColor] = useState(hairColors[0].id);
  const [eyeColor, setEyeColor] = useState(eyeColors[0].id);
  const [clothingStyle, setClothingStyle] = useState(clothingStyles[0].id);

  const handleSubmit = () => {
    onComplete({
      skinTone: skinTones.find((s) => s.id === skinTone)?.label || "",
      hairColor: hairColors.find((h) => h.id === hairColor)?.label || "",
      eyeColor: eyeColors.find((e) => e.id === eyeColor)?.label || "",
      clothingStyle: clothingStyles.find((c) => c.id === clothingStyle)?.desc || "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-white drop-shadow-lg">
          Vamos criar o {childName}! 🎨
        </h2>
        <p className="text-white/60 text-xs mt-1">
          Personalize o avatar para as histórias
        </p>
      </div>

      <div className="bg-black/30 backdrop-blur-md rounded-3xl p-4 border border-white/10 space-y-4">
        <ColorPicker label="Tom de Pele" options={skinTones} selected={skinTone} onChange={setSkinTone} />
        <ColorPicker label="Cor do Cabelo" options={hairColors} selected={hairColor} onChange={setHairColor} />
        <ColorPicker label="Cor dos Olhos" options={eyeColors} selected={eyeColor} onChange={setEyeColor} />

        <div>
          <p className="text-sm font-extrabold text-white mb-2">Estilo de Roupa</p>
          <div className="grid grid-cols-2 gap-2">
            {clothingStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setClothingStyle(style.id)}
                className={`p-3 rounded-2xl text-left transition-all ${
                  clothingStyle === style.id
                    ? "bg-kid-orange/20 border-2 border-kid-orange"
                    : "bg-white/5 border-2 border-transparent hover:border-white/20"
                }`}
              >
                <span className="text-lg">{style.emoji}</span>
                <p className="text-xs font-bold text-white mt-1">{style.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleSubmit}
        className="w-full py-4 rounded-2xl kid-gradient-orange text-white font-extrabold text-base shadow-2xl flex items-center justify-center gap-2 active:scale-95"
        whileTap={{ scale: 0.97 }}
      >
        Continuar para a História
        <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
};

export default AvatarCustomization;
