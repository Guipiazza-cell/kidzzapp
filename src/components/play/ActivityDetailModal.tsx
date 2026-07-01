/**
 * Modal de detalhe de uma atividade.
 *
 * Mostra:
 *  - emoji grande + título + categoria + XP
 *  - descrição curta (vinda do pool / IA)
 *  - "Como fazer" — passo a passo prático (3 passos)
 *  - "Exemplo" — exemplo concreto baseado na categoria
 *  - botão "Concluir + XP" (ou "Já concluída" se done)
 *
 * Os passos e exemplos são gerados a partir da categoria + título,
 * para garantir conteúdo útil mesmo quando a atividade vem do pool curto.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import {
  Activity,
  ActivityCategory,
  getCategoryMeta,
} from "@/lib/weeklyActivities";

interface Props {
  activity: Activity | null;
  childName: string;
  done: boolean;
  onComplete: (a: Activity) => void;
  onClose: () => void;
}

/* Passo a passo genérico por categoria (3 passos curtos e claros) */
const HOW_TO_BY_CATEGORY: Record<ActivityCategory, string[]> = {
  movimento: [
    "Reserve um espaço livre de móveis para se mexer com segurança.",
    "Faça a atividade por 1 a 3 minutos, no ritmo que conseguir.",
    "Termine respirando fundo 3 vezes para o corpo se acalmar.",
  ],
  criatividade: [
    "Junte os materiais simples que você tem em casa (papel, lápis, caixas).",
    "Comece sem se preocupar em ficar perfeito — o legal é inventar.",
    "Mostre o resultado pra alguém da família e conte como criou.",
  ],
  familia: [
    "Chame alguém da família e explique a ideia da atividade.",
    "Façam juntos, sem pressa, prestando atenção um no outro.",
    "No fim, digam uma coisa que cada um curtiu de fazer junto.",
  ],
  desafio: [
    "Decida quando vai fazer (agora ou em um momento do dia).",
    "Faça com calma e atenção — não precisa ter pressa.",
    "Conte pra alguém que conseguiu, pra comemorar a conquista.",
  ],
};

/* Exemplo concreto por categoria, personalizado com nome */
function getExample(activity: Activity, childName: string): string {
  const c = activity.category;
  const t = activity.title.toLowerCase();

  // Exemplos específicos para títulos comuns do pool
  if (t.includes("dance")) {
    return `Coloque uma música que ${childName} ama, comece dançando na sala, vá pro corredor e termine no quarto fazendo a pose mais maluca.`;
  }
  if (t.includes("cabana")) {
    return `Junte 2 cadeiras, jogue um lençol grande por cima e coloque almofadas dentro. Pronto: a cabana secreta de ${childName} ✨`;
  }
  if (t.includes("história") || t.includes("conte")) {
    return `Comece com "Era uma vez ${childName} e um(a)..." e use as 3 palavras dadas em qualquer ordem. Não precisa fazer sentido — quanto mais doido, mais divertido!`;
  }
  if (t.includes("respiração") || t.includes("silêncio")) {
    return `Sente no chão, feche os olhos e inspire contando "1-2-3-4". Segure 1 segundo. Solte o ar bem devagar contando "1-2-3-4-5". Repita.`;
  }
  if (t.includes("abrace") || t.includes("elogio")) {
    return `Vá até quem ${childName} ama, dê um abraço bem apertado e diga: "Te amo porque você é..." e complete com uma coisa boa.`;
  }
  if (t.includes("desenh")) {
    return `Pegue uma folha em branco, lápis coloridos e desenhe o que vier na cabeça — mesmo se for um monstro de 10 olhos!`;
  }
  if (t.includes("pul")) {
    return `Conte alto enquanto pula: "1, 2, 3..." Se cansar, descanse e continue. O importante é se mexer!`;
  }

  // Fallback por categoria
  const fallback: Record<ActivityCategory, string> = {
    movimento: `Comece devagar, se mexa do jeito que ${childName} curtir e finalize com uma respiração profunda.`,
    criatividade: `Use o que tem em casa, deixe a imaginação solta e mostre pra família depois.`,
    familia: `Convide alguém especial, façam juntos sem pressa e contem como foi.`,
    desafio: `Faça em um momento tranquilo do dia e celebre quando conseguir!`,
  };
  return fallback[c];
}

const ActivityDetailModal = ({ activity, childName, done, onComplete, onClose }: Props) => {
  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
          >
            {(() => {
              const meta = getCategoryMeta(activity.category);
              const steps = HOW_TO_BY_CATEGORY[activity.category];
              const example = getExample(activity, childName);
              return (
                <>
                  {/* Header com cor da categoria */}
                  <div
                    className="relative px-5 pt-6 pb-5"
                    style={{
                      background: `linear-gradient(135deg, ${meta.color.replace(")", " / 0.18)")}, ${meta.color.replace(")", " / 0.05)")})`,
                    }}
                  >
                    <button
                      onClick={onClose}
                      aria-label="Fechar"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-600 shadow"
                    >
                      <X size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-sm"
                        style={{ background: "white" }}
                      >
                        {activity.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[10px] font-black uppercase tracking-wider"
                          style={{ color: meta.color }}
                        >
                          {meta.emoji} {meta.label} · +{activity.xp} XP
                        </p>
                        <h2 className="text-lg font-extrabold text-gray-800 leading-tight mt-0.5">
                          {activity.title}
                        </h2>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-700 leading-snug">
                      {activity.description}
                    </p>
                  </div>

                  {/* Conteúdo: como fazer + exemplo */}
                  <div className="px-5 py-4 max-h-[50vh] overflow-y-auto overflow-x-hidden">
                    <section>
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-500" />
                        Como fazer
                      </h3>
                      <ol className="space-y-2.5">
                        {steps.map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                              style={{ background: meta.color }}
                            >
                              {i + 1}
                            </span>
                            <p className="text-sm text-gray-700 leading-snug">{s}</p>
                          </li>
                        ))}
                      </ol>
                    </section>

                    <section className="mt-5">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                        💡 Exemplo prático
                      </h3>
                      <div
                        className="rounded-2xl p-3.5 border"
                        style={{
                          background: `${meta.color.replace(")", " / 0.08)")}`,
                          borderColor: `${meta.color.replace(")", " / 0.25)")}`,
                        }}
                      >
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">
                          {example}
                        </p>
                      </div>
                    </section>
                  </div>

                  {/* Botão de ação */}
                  <div className="px-5 pt-2 pb-5 border-t border-gray-100">
                    {done ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        <Check size={18} /> Já concluída ✨
                      </button>
                    ) : (
                      <motion.button
                        onClick={() => {
                          onComplete(activity);
                          onClose();
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-md"
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(140 70% 50%), hsl(140 75% 40%))",
                        }}
                      >
                        <Check size={18} /> Concluir +{activity.xp} XP
                      </motion.button>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActivityDetailModal;
