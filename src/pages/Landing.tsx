import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Zap, Heart, Shield, Star, CheckCircle } from "lucide-react";
import heroImg from "@/assets/hero-parent-child.jpg";

const CTA_URL = "https://kidzzapp.lovable.app";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d * 0.15, duration: 0.6 } }),
};

const CtaButton = ({ text, className = "" }: { text: string; className?: string }) => (
  <motion.a
    href={CTA_URL}
    className={`inline-flex items-center justify-center gap-3 w-full max-w-md px-8 py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg md:text-xl shadow-2xl active:scale-95 transition-transform ${className}`}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    {text} <ArrowRight size={22} />
  </motion.a>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(210,40%,10%)] via-[hsl(215,35%,15%)] to-[hsl(210,40%,10%)] text-white font-kids overflow-x-hidden">
      
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-kid-blue/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          <motion.div custom={0} variants={fadeUp} className="mb-8">
            <img
              src={heroImg}
              alt="Pai e filho em momento de curiosidade"
              className="w-48 h-48 md:w-56 md:h-56 rounded-full mx-auto object-cover shadow-2xl border-4 border-kid-yellow/30"
              width={1024}
              height={768}
            />
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-2xl md:text-4xl font-extrabold leading-tight mb-6">
            Seu filho olha pra você esperando uma resposta…
            <span className="block mt-2 text-kid-yellow">e você simplesmente não sabe o que dizer.</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-base md:text-lg text-white/70 mb-10 max-w-lg mx-auto leading-relaxed">
            Não é falta de amor.{" "}
            <span className="text-white font-bold">É falta de ter a resposta na hora certa.</span>
          </motion.p>

          <motion.div custom={3} variants={fadeUp}>
            <CtaButton text="RESOLVER ISSO AGORA" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== QUEBRA EMOCIONAL ===== */}
      <section className="px-5 py-20 text-center">
        <motion.div
          className="max-w-lg mx-auto space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.p custom={0} variants={fadeUp} className="text-xl md:text-2xl font-bold text-kid-yellow">
            Isso acontece mais do que você imagina.
          </motion.p>
          <motion.div custom={1} variants={fadeUp} className="text-base md:text-lg text-white/70 leading-loose space-y-4">
            <p>A pergunta vem…</p>
            <p>você trava…</p>
            <p>e depois fica <span className="text-white font-bold">aquela sensação ruim.</span></p>
          </motion.div>
          <motion.p custom={2} variants={fadeUp} className="text-base md:text-lg text-white/60 italic">
            "Não é sobre saber tudo.<br />
            É sobre <span className="text-white font-bold not-italic">não falhar naquele momento.</span>"
          </motion.p>
        </motion.div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="flex justify-center py-4">
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-kid-orange to-kid-yellow" />
      </div>

      {/* ===== VIRADA / INSIGHT ===== */}
      <section className="px-5 py-20 text-center">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold leading-tight">
            Seu filho não precisa de um pai perfeito.
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-kid-yellow mt-4">
            Ele precisa de um pai preparado.
          </motion.p>
        </motion.div>
      </section>

      {/* ===== SOLUÇÃO ===== */}
      <section className="px-5 py-20 bg-white/[0.03] backdrop-blur-sm">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold">
            É aqui que entra o <span className="text-kid-yellow">Kidzz.</span>
          </motion.h2>
          <motion.div custom={1} variants={fadeUp} className="text-base md:text-lg text-white/70 leading-loose space-y-3">
            <p>Você digita a pergunta…</p>
            <p>e recebe uma resposta <span className="text-white font-bold">clara, simples e inteligente</span> na hora.</p>
          </motion.div>
          <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl font-bold text-kid-yellow">
            Como se você sempre soubesse o que dizer.
          </motion.p>
          <motion.div custom={3} variants={fadeUp}>
            <CtaButton text="TESTAR GRÁTIS AGORA" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== DEMONSTRAÇÃO / SIMULAÇÃO ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-sm mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h3 custom={0} variants={fadeUp} className="text-center text-lg font-bold text-white/50 uppercase tracking-wider mb-8">
            Veja como funciona
          </motion.h3>
          
          {/* Mock chat */}
          <motion.div custom={1} variants={fadeUp} className="bg-white/[0.06] rounded-3xl border border-white/10 p-5 space-y-4 shadow-2xl">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-kid-orange to-kid-yellow text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] text-sm font-bold shadow-lg">
                Por que o céu é azul? 🌤️
              </div>
            </div>
            {/* Bot response */}
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-kid-green/20 flex items-center justify-center text-lg flex-shrink-0">🦎</div>
              <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%] text-sm leading-relaxed">
                O céu parece azul porque a luz do sol é feita de todas as cores! 🌈 Quando ela chega na nossa atmosfera, a cor azul se espalha mais que as outras. É como se o ar pintasse o céu de azul pra gente! ✨
              </div>
            </div>
            {/* Typing indicator */}
            <div className="flex items-center gap-1 pl-10 pt-1">
              <span className="text-xs text-white/40">Resposta instantânea</span>
              <Zap size={12} className="text-kid-yellow" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== 3 PASSOS ===== */}
      <section className="px-5 py-20 bg-white/[0.03]">
        <motion.div
          className="max-w-lg mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-xl md:text-2xl font-extrabold mb-12">
            Simples assim:
          </motion.h2>
          
          <div className="space-y-8">
            {[
              { num: "1", icon: "🧒", text: "Seu filho pergunta" },
              { num: "2", icon: "📱", text: "Você digita" },
              { num: "3", icon: "💪", text: "Você responde com confiança" },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                custom={i + 1}
                variants={fadeUp}
                className="flex items-center gap-5 text-left"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kid-orange/20 to-kid-yellow/20 border border-kid-yellow/20 flex items-center justify-center text-3xl flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <span className="text-kid-yellow text-sm font-bold">Passo {step.num}</span>
                  <p className="text-lg font-bold">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== BENEFÍCIOS EMOCIONAIS ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-lg mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-xl md:text-2xl font-extrabold mb-10">
            O que muda na sua vida:
          </motion.h2>
          
          <div className="grid gap-4">
            {[
              { icon: <Shield size={20} />, text: "Nunca mais travar diante de uma pergunta" },
              { icon: <Heart size={20} />, text: "Mais segurança como pai ou mãe" },
              { icon: <MessageCircle size={20} />, text: "Mais conexão com seu filho" },
              { icon: <Zap size={20} />, text: "Respostas certas, na hora certa" },
            ].map((b, i) => (
              <motion.div
                key={i}
                custom={i + 1}
                variants={fadeUp}
                className="flex items-center gap-4 bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-left"
              >
                <div className="text-kid-yellow flex-shrink-0">{b.icon}</div>
                <p className="font-bold text-sm md:text-base">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== PROVA SOCIAL ===== */}
      <section className="px-5 py-20 bg-white/[0.03]">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} className="text-kid-yellow fill-kid-yellow" />
            ))}
          </motion.div>
          <motion.p custom={1} variants={fadeUp} className="text-xl font-extrabold">
            +5.000 perguntas respondidas
          </motion.p>
          <motion.p custom={2} variants={fadeUp} className="text-white/60 text-base">
            Pais já estão usando para nunca mais ficarem sem resposta.
          </motion.p>
          
          <motion.div custom={3} variants={fadeUp} className="space-y-4 pt-4">
            {[
              { name: "Ana, mãe do Pedro", text: "Salvou minhas noites antes de dormir. Meu filho ama!" },
              { name: "Carlos, pai da Sofia", text: "Agora eu me sinto preparado. É incrível como é simples." },
              { name: "Julia, mãe do Lucas", text: "Meu filho acha que eu sei tudo agora 😄" },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 text-left">
                <p className="text-sm text-white/80 italic mb-2">"{t.text}"</p>
                <p className="text-xs text-kid-yellow font-bold">{t.name}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== OFERTA ===== */}
      <section className="px-5 py-20 text-center">
        <motion.div
          className="max-w-lg mx-auto space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold">
            Você pode testar agora.
          </motion.h2>
          <motion.div custom={1} variants={fadeUp} className="text-white/60 text-base space-y-1">
            <p>Sem cadastro complicado.</p>
            <p>Sem enrolação.</p>
          </motion.div>
          <motion.div custom={2} variants={fadeUp} className="flex items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-kid-green" /> Grátis</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-kid-green" /> Sem cartão</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-kid-green" /> Seguro</span>
          </motion.div>
          <motion.div custom={3} variants={fadeUp}>
            <CtaButton text="TESTAR GRÁTIS AGORA" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== PRESSÃO FINAL ===== */}
      <section className="px-5 py-24 text-center bg-gradient-to-t from-kid-orange/10 via-transparent to-transparent">
        <motion.div
          className="max-w-lg mx-auto space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold">
            Seu filho vai continuar perguntando.
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="text-lg text-white/70">
            A diferença é se você vai <span className="text-white font-bold">travar…</span><br />
            ou <span className="text-kid-yellow font-bold">responder.</span>
          </motion.p>
          <motion.div custom={2} variants={fadeUp}>
            <CtaButton text="COMEÇAR AGORA" className="shadow-[0_0_40px_hsl(var(--kid-orange)/0.3)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-5 py-10 text-center border-t border-white/10">
        <p className="text-white/30 text-xs">
          🔒 Seguro e feito para crianças • Sem anúncios • © {new Date().getFullYear()} Kidzz
        </p>
      </footer>
    </div>
  );
};

export default Landing;
