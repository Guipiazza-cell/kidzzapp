import { motion, AnimatePresence } from "framer-motion";
import ChameleonMascot from "../ChameleonMascot";

interface GeneratingOverlayProps {
  open: boolean;
  progress: number;
}

const MESSAGES = [
  "Imaginando a história... 🌈",
  "Pintando os cenários... 🎨",
  "Dando vida aos personagens... ✨",
  "Quase pronto... 🦎",
  "Finalizando detalhes mágicos... 💫",
];

const GeneratingOverlay = ({ open, progress }: GeneratingOverlayProps) => {
  const msgIndex = Math.min(
    Math.floor(progress / 20),
    MESSAGES.length - 1
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center space-y-4"
          >
            <ChameleonMascot size="lg" isTalking />
            <h2 className="text-xl font-extrabold text-white">
              Criando sua história mágica...
            </h2>
            <p className="text-white/60 text-sm">{MESSAGES[msgIndex]}</p>
            <div className="w-64 mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full kid-gradient-orange rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-white/40 text-xs">{Math.round(progress)}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GeneratingOverlay;
