import { memo } from "react";

interface Props {
  onBack?: () => void;
}

/**
 * BORA! — aba que tira a criança do app.
 * Fase 2: tokens de design + tipografia aplicados.
 * Fase 5 implementa o layout completo (hero por horário, Surpresa da IA, Finder, coleções).
 */
const BoraScreen = ({ onBack }: Props) => {
  return (
    <div
      data-tab="bora"
      className="bora-screen flex-1 overflow-y-auto"
      style={{ paddingBottom: 140 }}
    >
      {/* Hero */}
      <header className="px-5 pt-8 pb-5">
        <span className="bora-screenfree-badge">
          🌿 Sem tela
        </span>
        <h1
          className="font-bora-display mt-3"
          style={{
            fontSize: 44,
            lineHeight: 1.02,
            color: "var(--bora-green-deep)",
          }}
        >
          Bora!
        </h1>
        <p
          className="font-bora-body mt-2"
          style={{ fontSize: 15.5, color: "var(--bora-ink-soft)", lineHeight: 1.45 }}
        >
          Aqui dentro só tem ideia. A brincadeira de verdade acontece longe da tela.
        </p>
      </header>

      {/* Surpresa da IA — preview */}
      <section className="px-5">
        <div className="bora-card">
          <div className="flex items-center justify-between">
            <span
              className="font-bora-body"
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--bora-orange)",
              }}
            >
              ✨ Surpresa da IA
            </span>
            <span className="bora-screenfree-badge">🌿 15 min</span>
          </div>
          <h2
            className="font-bora-display mt-2"
            style={{ fontSize: 22, color: "var(--bora-green-deep)" }}
          >
            Caça ao tesouro das cores
          </h2>
          <p
            className="font-bora-body mt-1"
            style={{ fontSize: 14.5, color: "var(--bora-ink-soft)", lineHeight: 1.5 }}
          >
            Escolham uma cor e saiam pela casa caçando 5 objetos dessa cor. Quem achar primeiro conta uma história sobre o item.
          </p>
          <button className="bora-cta-primary mt-4 w-full">
            Bora fazer! 🌿
          </button>
        </div>
      </section>

      {/* Categorias — preview chips */}
      <section className="px-5 mt-6">
        <h3
          className="font-bora-display mb-3"
          style={{ fontSize: 18, color: "var(--bora-green-deep)" }}
        >
          Por humor
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "ciencia", emoji: "🔬", label: "Ciência" },
            { key: "sensorial", emoji: "🌸", label: "Sensorial" },
            { key: "natureza", emoji: "🌳", label: "Natureza" },
            { key: "arte", emoji: "🎨", label: "Arte" },
            { key: "movimento", emoji: "🤸", label: "Movimento" },
            { key: "conversa", emoji: "💬", label: "Conversa" },
            { key: "cozinha", emoji: "🥄", label: "Cozinha" },
          ].map((c) => (
            <div
              key={c.key}
              className={`bora-cat-${c.key} rounded-2xl p-4`}
              style={{
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 6px 18px -10px rgba(47, 94, 69, 0.22)",
              }}
            >
              <div style={{ fontSize: 24 }}>{c.emoji}</div>
              <div
                className="font-bora-display mt-1"
                style={{ fontSize: 15, color: "var(--bora-green-deep)" }}
              >
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-5 mt-8">
        <div className="bora-card bora-card-cream text-center">
          <div style={{ fontSize: 28 }}>🌿</div>
          <p
            className="font-bora-display mt-2"
            style={{ fontSize: 16, color: "var(--bora-green-deep)" }}
          >
            Menos tela. Mais memória.
          </p>
          <p
            className="font-bora-body mt-1"
            style={{ fontSize: 13.5, color: "var(--bora-ink-soft)" }}
          >
            O Kidzz dá a ideia — vocês fazem o resto.
          </p>
        </div>
      </section>
    </div>
  );
};

export default memo(BoraScreen);
