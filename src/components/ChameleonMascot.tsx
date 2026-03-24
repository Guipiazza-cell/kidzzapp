import { motion } from "framer-motion";
import chameleonMain from "@/assets/chameleon-main.jpeg";

interface ChameleonMascotProps {
  isTalking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-14 h-14",
  md: "w-28 h-28",
  lg: "w-44 h-44",
  xl: "w-56 h-56"
};

const ChameleonMascot = ({ isTalking = false, size = "lg", className = "" }: ChameleonMascotProps) => {
  return (
    <motion.div
      className={`relative ${sizeMap[size]} ${className}`}
      animate={
      isTalking ?
      { y: [0, -12, 0], rotate: [0, -5, 5, -3, 0] } :
      { y: [0, -8, 0] }
      }
      transition={
      isTalking ?
      { duration: 0.5, repeat: Infinity, ease: "easeInOut" } :
      { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }>
      
      <motion.img

        alt="Kidzz - camaleão mascote"
        className="w-full h-full object-contain drop-shadow-2xl"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }} src="/lovable-uploads/28aadb76-b87d-4bb5-b230-759168d38c42.png" />
      
      {isTalking &&
      <>
          <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kid-yellow"
          animate={{ scale: [1, 1.8, 0], opacity: [1, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
        
          <motion.div
          className="absolute -top-3 right-6 w-4 h-4 rounded-full bg-kid-pink"
          animate={{ scale: [1, 1.8, 0], opacity: [1, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} />
        
          <motion.div
          className="absolute top-0 -left-2 w-4 h-4 rounded-full bg-kid-blue"
          animate={{ scale: [1, 1.8, 0], opacity: [1, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.6 }} />
        
        </>
      }
    </motion.div>);

};

export default ChameleonMascot;