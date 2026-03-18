import { motion } from "framer-motion";
import dogMascotImg from "@/assets/dog-mascot.png";

interface DogMascotProps {
  isTalking?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-32 h-32",
  lg: "w-48 h-48",
};

const DogMascot = ({ isTalking = false, size = "lg", className = "" }: DogMascotProps) => {
  return (
    <motion.div
      className={`relative ${sizeMap[size]} ${className}`}
      animate={
        isTalking
          ? { y: [0, -10, 0], rotate: [0, -4, 4, -2, 0] }
          : { y: [0, -6, 0] }
      }
      transition={
        isTalking
          ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
          : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <motion.img
        src={dogMascotImg}
        alt="Kidzz - mascote cachorrinho"
        className="w-full h-full object-contain drop-shadow-2xl"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      {isTalking && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-kid-yellow"
            animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute -top-2 right-4 w-3 h-3 rounded-full bg-kid-pink"
            animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="absolute top-0 -left-1 w-3 h-3 rounded-full bg-kid-blue"
            animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </motion.div>
  );
};

export default DogMascot;
