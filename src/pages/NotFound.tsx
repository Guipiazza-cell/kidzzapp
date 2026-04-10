import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MagicalBackground from "@/components/MagicalBackground";
import pixelImg from "@/assets/pixel-chameleon.png";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />
      <div className="text-center relative z-10">
        <motion.img
          src={pixelImg}
          alt="Pixel"
          className="w-20 h-20 object-contain drop-shadow-xl mx-auto mb-4"
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
        <p className="mb-4 text-xl text-gray-500">Oops! Página não encontrada</p>
        <a href="/" className="text-kid-orange underline hover:text-kid-orange/80 font-bold">
          Voltar para o início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
