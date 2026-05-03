import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { APP_UPDATE_AVAILABLE_EVENT, forceAppUpdateReload } from "@/lib/appUpdate";

const AppUpdateBanner = () => {
  const [version, setVersion] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const nextVersion = (event as CustomEvent<{ version?: string }>).detail?.version;
      setVersion(nextVersion || `update-${Date.now()}`);
    };

    window.addEventListener(APP_UPDATE_AVAILABLE_EVENT, onUpdate);
    return () => window.removeEventListener(APP_UPDATE_AVAILABLE_EVENT, onUpdate);
  }, []);

  if (!version) return null;

  return (
    <div className="fixed left-3 right-3 top-[calc(max(env(safe-area-inset-top,12px),12px)+8px)] z-[80] rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <RefreshCw size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground">Nova versão disponível</p>
          <p className="text-xs font-bold text-muted-foreground">Atualize agora para ver o Kidzz mais recente.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            setUpdating(true);
            await forceAppUpdateReload(version);
          }}
          disabled={updating}
          className="min-h-[44px] rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-lg active:scale-95 disabled:opacity-70"
        >
          {updating ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
    </div>
  );
};

export default AppUpdateBanner;