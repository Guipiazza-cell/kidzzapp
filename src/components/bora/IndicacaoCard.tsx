import { useState } from "react";
import { Gift, Copy, Check, Share2 } from "lucide-react";
import { useIndicacao } from "@/hooks/useIndicacao";

export const IndicacaoCard = () => {
  const { link, loading } = useIndicacao();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const share = async () => {
    if (!link) return;
    const text = "Você precisa conhecer o Kidzz. A gente tá num movimento de menos tela e mais brincadeira. Entra com meu link e ganhamos 1 mês de Premium juntos 🌿";
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: "Movimento Menos Tela", text, url: link }); return; } catch {}
    }
    copy();
  };

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: "linear-gradient(160deg, #FFFDF6 0%, #FFF3D9 100%)",
        border: "1.5px solid rgba(255,255,255,.85)",
        boxShadow: "0 20px 40px -16px rgba(60,40,15,.22)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(155deg, #F4A659, #E8821A)",
            boxShadow: "0 8px 18px -4px rgba(232,130,26,.45)",
            color: "#fff",
          }}
        >
          <Gift size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#E8772A" }}>
            Convide um pai ou mãe
          </div>
          <h3 className="font-bora-display mt-0.5" style={{ fontSize: 17, color: "#2F5E1F", letterSpacing: "-0.01em" }}>
            Vocês dois ganham 1 mês de Premium
          </h3>
          <p className="font-bora-body mt-1" style={{ fontSize: 12.5, color: "#7a6a52", lineHeight: 1.45 }}>
            Quanto mais família no Movimento Menos Tela, mais leve a rotina pra todo mundo.
          </p>
        </div>
      </div>

      <div
        className="mt-4 rounded-2xl px-3 py-2.5 flex items-center gap-2"
        style={{ background: "rgba(47,94,31,.06)", border: "1px solid rgba(47,94,31,.12)" }}
      >
        <span
          className="flex-1 truncate font-mono"
          style={{ fontSize: 12.5, color: "#3a2f23" }}
        >
          {loading ? "gerando seu link..." : link || "—"}
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!link}
          className="rounded-full px-3 py-1.5 font-semibold flex items-center gap-1 active:scale-95"
          style={{
            background: copied ? "#2F5E1F" : "rgba(255,255,255,.85)",
            color: copied ? "#fff" : "#2F5E1F",
            border: copied ? "none" : "1px solid rgba(47,94,31,.2)",
            fontSize: 11.5,
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "copiado" : "copiar"}
        </button>
      </div>

      <button
        type="button"
        onClick={share}
        disabled={!link}
        className="mt-3 w-full rounded-full py-3 font-bold text-white flex items-center justify-center gap-2 active:scale-[.98]"
        style={{
          background: "linear-gradient(135deg, #F4A659, #E8821A)",
          boxShadow: "0 10px 22px -4px rgba(232,130,26,.5)",
          fontSize: 14.5,
        }}
      >
        <Share2 size={16} />
        Convidar agora
      </button>
    </div>
  );
};
