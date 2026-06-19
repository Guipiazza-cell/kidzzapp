import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PaywallScreen, { type PaywallContextKind } from "./PaywallScreen";
import { useAuth } from "@/contexts/AuthContext";

interface PaywallContextType {
  open: (context?: PaywallContextKind) => void;
  close: () => void;
}

const PaywallContext = createContext<PaywallContextType | null>(null);

export const usePaywall = () => {
  const ctx = useContext(PaywallContext);
  if (!ctx) throw new Error("usePaywall must be inside PaywallProvider");
  return ctx;
};

/** Provider único do paywall — todo upgrade do app chama isso. */
export const PaywallProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ctx, setCtx] = useState<PaywallContextKind>("default");
  const { profile } = useAuth();

  const open = useCallback((context?: PaywallContextKind) => {
    setCtx(context ?? "default");
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  // Suporte a ?paywall=1 — qualquer link/CTA legado abre o paywall canônico
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paywall") === "1") {
      setCtx("default");
      setIsOpen(true);
      params.delete("paywall");
      const q = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (q ? `?${q}` : ""));
    }
  }, []);

  return (
    <PaywallContext.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-[#fef9f3] to-[#f1ead8]"
              onClick={(e) => e.stopPropagation()}
            >
              <PaywallScreen childName={profile?.child_name} onClose={close} context={ctx} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PaywallContext.Provider>
  );
};
