import { memo } from "react";

interface Props {
  onBack?: () => void;
}

/**
 * BORA! — aba que tira a criança do app.
 * Fase 1: placeholder. Fase 5 implementa o layout completo.
 */
const BoraScreen = ({ onBack }: Props) => {
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{
        background: "#FBF7EF",
        fontFamily: "'Nunito', system-ui, sans-serif",
        color: "#2C2A26",
        paddingBottom: 140,
      }}
    >
      <div className="px-5 pt-8 pb-6">
        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: 44,
            lineHeight: 1,
            color: "#2F5E45",
            letterSpacing: "-0.02em",
          }}
        >
          Bora!
        </h1>
        <p className="mt-2 text-[15px] text-[#5a544a]">
          Em construção — em breve aqui dentro só tem ideia. A brincadeira de verdade é longe da tela.
        </p>
      </div>

      <div className="px-5">
        <div
          className="rounded-3xl p-6 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E9F4E1 0%, #d9ecc8 100%)",
            border: "1px solid #cfe3b8",
          }}
        >
          <div className="text-3xl">🌿</div>
          <p
            className="mt-2 text-[16px] font-bold"
            style={{ color: "#2F5E45", fontFamily: "'Fredoka', sans-serif" }}
          >
            A aba “Bora!” está chegando
          </p>
          <p className="mt-1 text-[14px] text-[#3b5a4a]">
            Atividades pra fazer longe do celular, surpresas da IA, e um contador de tempo sem tela.
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(BoraScreen);
