import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

/**
 * Lightweight offline indicator. Shows a friendly KIDZZ banner when the
 * device loses connection. Doesn't block the UI — the cached SW shell
 * keeps working, and offline-capable games (Memória, Forca, Desafio)
 * remain accessible from the existing Brincar tab.
 */
const OfflineIndicator = () => {
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-0 inset-x-0 z-[100] pointer-events-none"
        >
          <div className="mx-auto mt-2 max-w-md px-4">
            <div
              role="status"
              className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-amber-100 border border-amber-300 px-4 py-2.5 shadow-lg"
            >
              <WifiOff className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-amber-900 leading-tight">
                  Sem internet
                </p>
                <p className="text-amber-800 text-xs leading-tight">
                  Vamos brincar offline? 🎮 Memória, Forca e Desafio funcionam
                  sem conexão.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
