import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { isSfxMuted, setSfxMuted, sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

interface Props {
  size?: number;
  className?: string;
}

/** Tiny round toggle for the global sound — persists in localStorage. */
const SoundToggle = ({ size = 16, className = "" }: Props) => {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isSfxMuted());
  }, []);

  const onClick = () => {
    const next = !muted;
    setSfxMuted(next);
    setMuted(next);
    haptic("light");
    if (!next) sfx("click");
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className={`p-2 rounded-xl glass-card text-gray-700 ${className}`}
      aria-label={muted ? "Ativar sons" : "Silenciar sons"}
      title={muted ? "Ativar sons" : "Silenciar sons"}
    >
      {muted ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </motion.button>
  );
};

export default SoundToggle;
