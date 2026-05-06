import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import aneImg from "@/assets/ane-chameleon.webp";

const AGE_OPTIONS = [
  { range: "0-3", emoji: "🧸", label: "3 – 5 anos", desc: "Respostas simples e carinhosas", accent: "from-emerald-400 to-teal-400" },
  { range: "3-7", emoji: "🎒", label: "6 – 8 anos", desc: "Histórias e exemplos do dia a dia", accent: "from-sky-400 to-blue-500" },
  { range: "7-10", emoji: "🧠", label: "9 – 12 anos", desc: "Curiosidades e desafios científicos", accent: "from-violet-400 to-purple-500" },
];

interface Props {
  question: string;
  onSelect: (range: string) => void;
  onBack: () => void;
}

const AgePickerScreen = ({ question, onSelect, onBack }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (range: string) => {
    setSelected(range);
    setTimeout(() => onSelect(range), 400);
  };

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 rounded-xl glass-card text-gray-500"
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft size={20} />
      </motion.button>

      <motion.img
        src={aneImg}
        alt="Ane"
        className="w-20 h-20 object-contain drop-shadow-xl"
        animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.h2
        className="text-xl font-black text-gray-800 text-center mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Qual a idade do seu filho?
      </motion.h2>

      <motion.p
        className="text-gray-500 text-center text-sm mt-1 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Adaptamos a resposta perfeitamente
      </motion.p>

      <motion.div
        className="w-full max-w-sm mt-6 space-y-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {AGE_OPTIONS.map((opt, i) => {
          const isSelected = selected === opt.range;
          return (
            <motion.button
              key={opt.range}
              onClick={() => handleSelect(opt.range)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden ${
                isSelected ? "glass-card-light ring-2 ring-gray-400" : "glass-card"
              }`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${opt.accent} rounded-l-2xl`} />
              <span className="text-4xl">{opt.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-extrabold text-gray-800 text-lg">{opt.label}</p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </div>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 rounded-full bg-kid-green flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default AgePickerScreen;
