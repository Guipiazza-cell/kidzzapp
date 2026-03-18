import { motion } from "framer-motion";
import chameleonImg from "@/assets/chameleon.png";

interface ChameleonMascotProps {
  isTalking?: boolean;
  className?: string;
}

const ChameleonMascot = ({ isTalking = false, className = "" }: ChameleonMascotProps) => {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        isTalking
          ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
          : { y: [0, -6, 0] }
      }
      transition={
        isTalking
          ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <motion.img
        src={chameleonImg}
        alt="Kiko, o camaleão"
        className="w-full h-full object-contain drop-shadow-xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      {isTalking && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export default ChameleonMascot;
