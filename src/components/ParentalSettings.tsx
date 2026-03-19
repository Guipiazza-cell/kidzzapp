import { useState } from "react";
import { motion } from "framer-motion";
import { X, Clock, History, Volume2, VolumeX, Star, ShieldCheck, CreditCard } from "lucide-react";

interface ParentalSettingsProps {
  onClose: () => void;
}

const AGE_RANGES = [
  {
    range: "0-3",
    label: "0 a 3 anos",
    emoji: "👶",
    description: "Respostas ultrassimples, com sons, cores e palavras curtas. Sem texto complexo. Foco em estímulos sensoriais e vocabulário básico.",
    contentRules: [
      "Apenas palavras simples e repetitivas",
      "Respostas com emojis e sons",
      "Sem conceitos abstratos",
      "Estímulo sensorial e cores",
    ],
  },
  {
    range: "3-7",
    label: "3 a 7 anos",
    emoji: "🧒",
    description: "Explicações com historinhas curtas, exemplos do dia a dia e comparações divertidas. Linguagem simples e acolhedora.",
    contentRules: [
      "Histórias curtas e lúdicas",
      "Comparações com o dia a dia",
      "Vocabulário acessível",
      "Incentivo à curiosidade",
    ],
  },
  {
    range: "7-10",
    label: "7 a 10 anos",
    emoji: "🧑‍🎓",
    description: "Respostas mais detalhadas com curiosidades, dados interessantes e desafios. Incentiva o pensamento crítico e a pesquisa.",
    contentRules: [
      "Curiosidades e fatos científicos",
      "Desafios e perguntas de retorno",
      "Vocabulário mais rico",
      "Incentivo ao pensamento crítico",
    ],
  },
];

const ParentalSettings = ({ onClose }: ParentalSettingsProps) => {
  const [ageRange, setAgeRange] = useState("3-7");
  const [dailyLimit, setDailyLimit] = useState(10);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"settings" | "history" | "plans">("settings");

  const selectedAge = AGE_RANGES.find(a => a.range === ageRange)!;

  const mockHistory = [
    { q: "Por que o céu é azul?", time: "Hoje, 14:30" },
    { q: "Quantas patas tem uma aranha?", time: "Hoje, 13:15" },
    { q: "Como os peixes respiram?", time: "Ontem, 16:00" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="bg-card rounded-3xl p-5 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <h2 className="font-extrabold text-xl text-foreground text-center mb-1">⚙️ Controle Parental</h2>
        <p className="text-muted-foreground text-xs text-center mb-4">Gerencie a experiência da criança</p>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4">
          {[
            { id: "settings" as const, label: "Idade", icon: ShieldCheck },
            { id: "history" as const, label: "Histórico", icon: History },
            { id: "plans" as const, label: "Planos", icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "settings" ? (
          <div className="space-y-4">
            {/* Age Range */}
            <div>
              <label className="font-bold text-foreground text-sm block mb-2">🎂 Faixa etária da criança</label>
              <div className="grid grid-cols-3 gap-2">
                {AGE_RANGES.map(({ range, emoji, label }) => (
                  <button
                    key={range}
                    onClick={() => setAgeRange(range)}
                    className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                      ageRange === range
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-primary/10"
                    }`}
                  >
                    <span className="text-lg block">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected age detail */}
            <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-4">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                {selectedAge.emoji} Faixa {selectedAge.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {selectedAge.description}
              </p>
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-bold text-foreground">🛡️ Regras de conteúdo:</p>
                {selectedAge.contentRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Limit */}
            <div>
              <label className="font-bold text-foreground text-sm block mb-2">
                ⏱️ Limite diário: <span className="text-primary">{dailyLimit} perguntas</span>
              </label>
              <input
                type="range"
                min={3}
                max={30}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span><span>30</span>
              </div>
            </div>

            {/* Voice Toggle */}
            <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                {voiceEnabled ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-muted-foreground" />}
                <div>
                  <p className="font-bold text-sm text-foreground">Respostas por voz</p>
                  <p className="text-xs text-muted-foreground">O Kidzz fala a resposta em voz alta</p>
                </div>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-7 rounded-full transition-colors ${voiceEnabled ? "bg-primary" : "bg-border"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${voiceEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Content safety */}
            <div className="bg-kid-green/10 border border-kid-green/30 rounded-2xl p-3">
              <p className="font-extrabold text-sm text-foreground flex items-center gap-2">
                🔒 Segurança de conteúdo
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Todas as respostas são filtradas automaticamente pela IA. Conteúdos sobre <strong>violência, sexo, drogas ou linguagem imprópria</strong> são bloqueados em 100% dos casos. A linguagem é adaptada automaticamente conforme a faixa etária selecionada.
              </p>
            </div>
          </div>
        ) : activeTab === "plans" ? (
          <div className="space-y-4">
            {/* Free Plan */}
            <div className="border-2 border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🆓</span>
                <h3 className="font-extrabold text-foreground">Plano Grátis</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">✅ 5 perguntas por dia</li>
                <li className="flex items-center gap-2">✅ Respostas educativas por texto</li>
                <li className="flex items-center gap-2">✅ Controle parental básico</li>
                <li className="flex items-center gap-2">✅ 1 personagem (camaleão colorido)</li>
                <li className="flex items-center gap-2">❌ Sem resposta por voz</li>
                <li className="flex items-center gap-2">❌ Sem histórico completo</li>
              </ul>
              <p className="text-center font-extrabold text-lg text-foreground mt-3">R$ 0 / mês</p>
            </div>

            {/* Premium Plan */}
            <div className="kid-gradient-premium rounded-2xl p-4 text-primary-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-kid-yellow" size={20} />
                <h3 className="font-extrabold">Plano Premium ⭐</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-primary-foreground/90">
                <li className="flex items-center gap-2">✅ Perguntas ilimitadas</li>
                <li className="flex items-center gap-2">✅ Respostas por voz com tom infantil</li>
                <li className="flex items-center gap-2">✅ Controle parental avançado</li>
                <li className="flex items-center gap-2">✅ Histórico completo de perguntas</li>
                <li className="flex items-center gap-2">✅ 5 personagens exclusivos</li>
                <li className="flex items-center gap-2">✅ Modo noturno e temas especiais</li>
                <li className="flex items-center gap-2">✅ Sem anúncios</li>
              </ul>
              <p className="text-center font-extrabold text-2xl mt-3">R$ 14,90 <span className="text-sm font-bold opacity-80">/ mês</span></p>
              <button className="mt-3 w-full bg-card text-foreground font-bold py-3 px-6 rounded-full text-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
                ⭐ Assinar Premium
              </button>
              <p className="text-xs text-center mt-2 opacity-80">7 dias grátis para testar!</p>
            </div>

            {/* Family Plan */}
            <div className="border-2 border-kid-blue/30 bg-kid-blue/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👨‍👩‍👧‍👦</span>
                <h3 className="font-extrabold text-foreground">Plano Família</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">✅ Tudo do Premium</li>
                <li className="flex items-center gap-2">✅ Até 4 perfis de crianças</li>
                <li className="flex items-center gap-2">✅ Relatório semanal por e-mail</li>
                <li className="flex items-center gap-2">✅ Controle parental por perfil</li>
              </ul>
              <p className="text-center font-extrabold text-lg text-foreground mt-3">R$ 24,90 <span className="text-sm font-bold text-muted-foreground">/ mês</span></p>
              <button className="mt-3 w-full bg-secondary text-secondary-foreground font-bold py-3 px-6 rounded-full text-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
                👨‍👩‍👧‍👦 Assinar Família
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {mockHistory.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Nenhuma pergunta ainda</p>
            ) : (
              mockHistory.map((item, i) => (
                <div key={i} className="bg-muted/50 rounded-2xl p-3">
                  <p className="font-bold text-sm text-foreground">{item.q}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentalSettings;
