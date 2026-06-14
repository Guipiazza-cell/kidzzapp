// Wrapper legado — toda lógica/visual vive em PaywallScreen.
// Mantém a assinatura antiga (open/context/meta/onClose/onLogin) para compatibilidade.
import { AnimatePresence, motion } from "framer-motion";
import PaywallScreen from "@/components/paywall/PaywallScreen";
import { useAuth } from "@/contexts/AuthContext";
import type { PaywallContext } from "@/lib/contextualPaywall";

interface Props {
  open: boolean;
  context?: PaywallContext;
  meta?: Record<string, string | number>;
  onClose: () => void;
  onLogin?: () => void;
}

const ContextualPaywallModal = ({ open, onClose }: Props) => {
  const { profile } = useAuth();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md overflow-y-auto"
        >
          <PaywallScreen childName={profile?.child_name || undefined} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualPaywallModal;
