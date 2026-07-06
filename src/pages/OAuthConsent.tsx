import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Typed wrapper around the beta supabase.auth.oauth namespace.
const oauth = (supabase.auth as unknown as {
  oauth: {
    getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
    approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
    denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  };
}).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#FFFCF8",
    color: "#2A2A2A",
  };
  const card: React.CSSProperties = {
    maxWidth: 440,
    width: "100%",
    background: "white",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 12px 40px rgba(0,0,0,.08)",
  };
  const btn = (bg: string, fg: string): React.CSSProperties => ({
    background: bg,
    color: fg,
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 44,
    minWidth: 120,
  });

  if (error)
    return (
      <main style={wrap}>
        <div style={card}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Não foi possível carregar</h1>
          <p style={{ color: "#5B5B5B" }}>{error}</p>
        </div>
      </main>
    );
  if (!details)
    return (
      <main style={wrap}>
        <div style={card}>Carregando…</div>
      </main>
    );

  const clientName = details.client?.name ?? "um aplicativo";
  return (
    <main style={wrap}>
      <div style={card}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Conectar {clientName} à sua conta Kidzz
        </h1>
        <p style={{ color: "#5B5B5B", marginBottom: 20 }}>
          Isso permite que {clientName} acesse os dados do Kidzz em seu nome (perfis das crianças,
          perguntas recentes e memórias).
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button disabled={busy} onClick={() => decide(true)} style={btn("#E8821A", "white")}>
            Aprovar
          </button>
          <button disabled={busy} onClick={() => decide(false)} style={btn("#F1F1F1", "#2A2A2A")}>
            Negar
          </button>
        </div>
      </div>
    </main>
  );
}
