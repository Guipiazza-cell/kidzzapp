import { memo } from "react";
import {
  FlaskConical, Sparkles, TreePine, Palette, Dumbbell,
  MessageCircle, CookingPot, Wand2, Leaf, ChevronRight,
} from "lucide-react";

interface Props {
  onBack?: () => void;
}

type Cat = {
  key: string;
  icon: typeof FlaskConical;
  label: string;
  from: string;
  to: string;
  ring: string;
  ink: string;
};

const CATS: Cat[] = [
  { key: "ciencia",   icon: FlaskConical, label: "Ciência",   from: "#DCEEFB", to: "#7FB9EC", ring: "#4F94D4", ink: "#1E4972" },
  { key: "sensorial", icon: Sparkles,     label: "Sensorial", from: "#FDE7F0", to: "#F49CC2", ring: "#D86AA0", ink: "#7A2A4F" },
  { key: "natureza",  icon: TreePine,     label: "Natureza",  from: "#E4F3D6", to: "#9FD37A", ring: "#6FB04A", ink: "#2F5E1F" },
  { key: "arte",      icon: Palette,      label: "Arte",      from: "#FFF1D6", to: "#FFC472", ring: "#E8A044", ink: "#7A4A12" },
  { key: "movimento", icon: Dumbbell,     label: "Movimento", from: "#FFE0D2", to: "#FF9A78", ring: "#E87456", ink: "#7A2F1C" },
  { key: "conversa",  icon: MessageCircle,label: "Conversa",  from: "#EFE6FB", to: "#B89BF0", ring: "#8E6FD8", ink: "#3F2A78" },
  { key: "cozinha",   icon: CookingPot,   label: "Cozinha",   from: "#FCEBE0", to: "#F0A878", ring: "#D88052", ink: "#6E3A18" },
];

/** Premium icon orb — identical to the dock's featured button. */
const IconOrb = ({
  Icon,
  size = 24,
  colorFrom,
  colorTo,
  shadowColor,
  iconSize = 22,
}: {
  Icon: typeof FlaskConical;
  size?: number;
  colorFrom: string;
  colorTo: string;
  shadowColor: string;
  iconSize?: number;
}) => (
  <span
    style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: 999,
      background: `linear-gradient(155deg, ${colorFrom}, ${colorTo})`,
      boxShadow: `0 10px 22px -4px ${shadowColor}99, inset 0 1.5px 2px rgba(255,255,255,.7), inset 0 -4px 9px rgba(0,0,0,.14), 0 0 0 3px #ffffff`,
      flexShrink: 0,
    }}
  >
    <Icon
      size={iconSize}
      strokeWidth={2.2}
      style={{
        color: "#ffffff",
        filter: "drop-shadow(0 1px 1px rgba(0,0,0,.25))",
      }}
    />
  </span>
);

/** Bezel premium wrapper (igual ao dock). */
const Bezel = ({ children, tint = "#E8821A" }: { children: React.ReactNode; tint?: string }) => (
  <div
    style={{
      borderRadius: 30,
      padding: 2,
      background:
        "linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(232,236,240,.92) 14%, rgba(190,197,206,.82) 32%, rgba(150,158,168,.75) 48%, rgba(206,212,219,.78) 64%, rgba(124,132,142,.82) 84%, rgba(238,241,244,.95) 100%)",
      boxShadow:
        "0 22px 50px -14px rgba(60,40,15,.40), 0 8px 18px rgba(60,40,15,.20), 0 1px 0 rgba(255,255,255,.6), inset 0 1px 1px rgba(255,255,255,.9)",
    }}
  >
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(150deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.82) 48%, rgba(255,255,255,.92) 100%)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow:
          "inset 0 1.5px 1px rgba(255,255,255,.95), inset 0 -10px 22px rgba(255,255,255,.20), inset 0 0 0 1px rgba(255,255,255,.6)",
        padding: 20,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "42%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.15) 60%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: 14,
          background: `linear-gradient(0deg, ${tint}26 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  </div>
);

const CategoryCard = ({ c }: { c: Cat }) => {
  const Icon = c.icon;
  return (
    <div
      style={{
        borderRadius: 24,
        padding: 1.5,
        background: `linear-gradient(160deg, #ffffff 0%, ${c.ring}55 40%, ${c.ring}aa 70%, #ffffff 100%)`,
        boxShadow: `0 14px 28px -12px ${c.ring}66, 0 4px 10px rgba(60,40,15,.10)`,
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 22,
          overflow: "hidden",
          background: `linear-gradient(155deg, ${c.from} 0%, ${c.to} 100%)`,
          padding: "16px 14px 14px",
          boxShadow:
            "inset 0 1.5px 1px rgba(255,255,255,.85), inset 0 -10px 20px rgba(0,0,0,.06)",
          minHeight: 116,
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: "55%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.10) 60%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <IconOrb
          Icon={Icon}
          size={44}
          iconSize={22}
          colorFrom={c.ring}
          colorTo={c.ink}
          shadowColor={c.ring}
        />
        <div
          className="font-bora-display"
          style={{ fontSize: 16, color: c.ink, marginTop: 14, letterSpacing: "-0.01em" }}
        >
          {c.label}
        </div>
      </div>
    </div>
  );
};

const BoraScreen = ({ onBack }: Props) => {
  return (
    <div
      data-tab="bora"
      className="bora-screen flex-1 overflow-y-auto"
      style={{ paddingBottom: 180 }}
    >
      {/* Hero */}
      <header className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <IconOrb
            Icon={Leaf}
            size={28}
            iconSize={14}
            colorFrom="#6FB04A"
            colorTo="#2F5E1F"
            shadowColor="#6FB04A"
          />
          <span className="bora-screenfree-badge">Sem tela</span>
        </div>
        <h1
          className="font-bora-display mt-3"
          style={{
            fontSize: 46,
            lineHeight: 1.02,
            color: "var(--bora-green-deep)",
            letterSpacing: "-0.02em",
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

      {/* Surpresa da IA — card premium com bezel */}
      <section className="px-5">
        <Bezel tint="#E8821A">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconOrb
                Icon={Wand2}
                size={26}
                iconSize={13}
                colorFrom="#F4A659"
                colorTo="#E8821A"
                shadowColor="#E8821A"
              />
              <span
                className="font-bora-body"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--bora-orange)",
                }}
              >
                Surpresa da IA
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconOrb
                Icon={Leaf}
                size={22}
                iconSize={11}
                colorFrom="#6FB04A"
                colorTo="#2F5E1F"
                shadowColor="#6FB04A"
              />
              <span className="bora-screenfree-badge">15 min</span>
            </div>
          </div>
          <h2
            className="font-bora-display mt-3"
            style={{ fontSize: 24, color: "var(--bora-green-deep)", letterSpacing: "-0.01em" }}
          >
            Caça ao tesouro das cores
          </h2>
          <p
            className="font-bora-body mt-2"
            style={{ fontSize: 14.5, color: "var(--bora-ink-soft)", lineHeight: 1.5 }}
          >
            Escolham uma cor e saiam pela casa caçando 5 objetos dessa cor. Quem achar primeiro conta uma história sobre o item.
          </p>

          {/* CTA premium 3D */}
          <div
            style={{
              marginTop: 18,
              borderRadius: 999,
              padding: 1.5,
              background:
                "linear-gradient(160deg, #ffffff 0%, #F4A659 30%, #E8821A 60%, #B85F0E 100%)",
              boxShadow:
                "0 16px 32px -10px rgba(232,130,26,.55), 0 4px 10px rgba(60,40,15,.18)",
            }}
          >
            <button
              type="button"
              className="w-full active:scale-[0.98]"
              style={{
                position: "relative",
                borderRadius: 999,
                padding: "14px 22px",
                background:
                  "linear-gradient(155deg, #FFB877 0%, #F4A659 35%, #E8821A 70%, #C56C12 100%)",
                color: "#fff",
                fontFamily: "'Fredoka', 'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: "0.01em",
                overflow: "hidden",
                boxShadow:
                  "inset 0 1.5px 1px rgba(255,255,255,.7), inset 0 -6px 12px rgba(120,50,0,.25)",
                transition: "transform 180ms cubic-bezier(.22,1,.36,1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, height: "55%",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.05) 100%)",
                  borderTopLeftRadius: 999,
                  borderTopRightRadius: 999,
                  pointerEvents: "none",
                }}
              />
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <IconOrb
                  Icon={Leaf}
                  size={20}
                  iconSize={10}
                  colorFrom="#6FB04A"
                  colorTo="#2F5E1F"
                  shadowColor="#6FB04A"
                />
                Bora fazer!
                <ChevronRight size={18} strokeWidth={2.5} style={{ opacity: 0.9 }} />
              </span>
            </button>
          </div>
        </Bezel>
      </section>

      {/* Categorias */}
      <section className="px-5 mt-7">
        <h3
          className="font-bora-display mb-3"
          style={{ fontSize: 19, color: "var(--bora-green-deep)", letterSpacing: "-0.01em" }}
        >
          Por humor
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {CATS.map((c) => (
            <CategoryCard key={c.key} c={c} />
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-5 mt-8">
        <Bezel tint="#4F8B66">
          <div className="text-center">
            <IconOrb
              Icon={Leaf}
              size={56}
              iconSize={28}
              colorFrom="#6FB04A"
              colorTo="#2F5E1F"
              shadowColor="#6FB04A"
            />
            <p
              className="font-bora-display mt-3"
              style={{ fontSize: 17, color: "var(--bora-green-deep)" }}
            >
              Menos tela. Mais memória.
            </p>
            <p
              className="font-bora-body mt-1"
              style={{ fontSize: 13.5, color: "var(--bora-ink-soft)" }}
            >
              O Kidzz dá a ideia. Vocês fazem o resto.
            </p>
          </div>
        </Bezel>
      </section>
    </div>
  );
};

export default memo(BoraScreen);
