import { useEffect } from "react";

import { useRegisterSW } from "virtual:pwa-register/react";

export const usePWAUpdate = () => {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      if (!r) return;
      setInterval(() => r.update(), 30 * 1000);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);
};
