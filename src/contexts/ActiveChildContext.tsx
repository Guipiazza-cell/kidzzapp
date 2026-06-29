import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type Crianca, useCriancas } from "@/hooks/useCriancas";

type ActiveChildContextValue = {
  criancas: Crianca[];
  loading: boolean;
  activeChild: Crianca | null;
  activeChildId: string | null;
  setActiveChildId: (id: string) => void;
  refreshChildren: () => Promise<void>;
};

const ActiveChildContext = createContext<ActiveChildContextValue | undefined>(undefined);

const storageKey = (userId: string) => `kidzz_active_child_${userId}`;

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { criancas, loading, refresh } = useCriancas();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSelectedId(null);
      return;
    }
    try {
      setSelectedId(window.localStorage.getItem(storageKey(user.id)));
    } catch {
      setSelectedId(null);
    }
  }, [user?.id]);

  const activeChild = useMemo(() => {
    if (criancas.length === 0) return null;
    return criancas.find((crianca) => crianca.id === selectedId) ?? criancas[0];
  }, [criancas, selectedId]);

  useEffect(() => {
    if (!user || !activeChild) return;
    if (selectedId === activeChild.id) return;
    setSelectedId(activeChild.id);
    try {
      window.localStorage.setItem(storageKey(user.id), activeChild.id);
    } catch {
      /* noop */
    }
  }, [activeChild, selectedId, user]);

  const setActiveChildId = useCallback(
    (id: string) => {
      const exists = criancas.some((crianca) => crianca.id === id);
      if (!user || !exists) return;
      setSelectedId(id);
      try {
        window.localStorage.setItem(storageKey(user.id), id);
      } catch {
        /* noop */
      }
    },
    [criancas, user],
  );

  const value = useMemo(
    () => ({
      criancas,
      loading,
      activeChild,
      activeChildId: activeChild?.id ?? null,
      setActiveChildId,
      refreshChildren: refresh,
    }),
    [activeChild, criancas, loading, refresh, setActiveChildId],
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild() {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error("useActiveChild must be used within ActiveChildProvider");
  }
  return context;
}

export function useActiveChildId() {
  return useActiveChild().activeChildId;
}
