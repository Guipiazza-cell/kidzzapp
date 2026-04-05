import { motion } from "framer-motion";
import { ArrowRight, Zap, Heart, Shield, Star, CheckCircle, Volume2, BookOpen, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-emotional.jpg";

const CTA_URL = "https://kidzzapp.lovable.app";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d * 0.15, duration: 0.6 } }),
};

const CtaButton = ({ text, className = "" }: { text: string; className?: string }) => (
  <motion.a
    href={CTA_URL}
    className={`inline-flex items-center justify-center gap-3 w-full max-w-md px-8 py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-lg md:text-xl shadow-2xl active:scale-95 transition-transform ${className}`}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    {text} <ArrowRight size={22} />
  </motion.a>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(210,40%,10%)] via-[hsl(215,35%,15%)] to-[hsl(210,40%,10%)] text-primary-foreground font-kids overflow-x-hidden">

      {/* ===== 1. HERO — IMPACTO MÁXIMO ===== */}
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
              alt="Pai e filho em momento de curiosidade e conexão"
              className="w-56 h-56 md:w-64 md:h-64 rounded-full mx-auto object-cover shadow-2xl border-4 border-kid-yellow/30"
              loading="eager"
              width={1024}
              height={768}
            />
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
            Seu filho vai te fazer uma pergunta difícil hoje.
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-lg mx-auto leading-relaxed font-bold">
            E você precisa saber responder.
          </motion.p>

          <motion.div custom={3} variants={fadeUp}>
            <CtaButton text="QUERO NUNCA MAIS TRAVAR" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== 2. SESSÃO DOR ===== */}
      <section className="px-5 py-20 text-center">
        <motion.div
          className="max-w-lg mx-auto space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-xl md:text-2xl font-extrabold">
            Se você é pai, isso já aconteceu com você:
          </motion.h2>

          <motion.div custom={1} variants={fadeUp} className="space-y-3">
            {[
              "\"Pai, o que é morrer?\"",
              "\"Por que vocês se separaram?\"",
              "\"De onde vêm os bebês?\"",
            ].map((q, i) => (
              <div key={i} className="glass-card rounded-2xl px-5 py-4 text-left">
                <p className="text-base md:text-lg font-bold text-primary-foreground/90">{q}</p>
              </div>
            ))}
          </motion.div>

          <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-primary-foreground/60 leading-relaxed">
            E naquele momento…{" "}
            <span className="text-primary-foreground font-extrabold">você trava.</span>
          </motion.p>
        </motion.div>
      </section>

      {/* ===== 3. QUEBRA DE PADRÃO ===== */}
      <section className="px-5 py-16 text-center">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold leading-tight">
            Não é falta de amor.
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-kid-yellow mt-4">
            É falta de preparo.
          </motion.p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="flex justify-center py-4">
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-kid-orange to-kid-yellow" />
      </div>

      {/* ===== 4. APRESENTAÇÃO DA SOLUÇÃO ===== */}
      <section className="px-5 py-20 bg-primary-foreground/[0.03] backdrop-blur-sm">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-xl md:text-2xl font-extrabold leading-tight">
            O <span className="text-kid-yellow">KIDZZ</span> te ajuda a responder na hora,{" "}
            <span className="text-kid-yellow">do jeito certo</span>, para a idade do seu filho.
          </motion.h2>

          <motion.div custom={1} variants={fadeUp} className="grid gap-3">
            {[
              { icon: <MessageCircle size={20} />, label: "Resposta pronta", desc: "Clara, simples e segura" },
              { icon: <BookOpen size={20} />, label: "História", desc: "Um conto leve e emocional" },
              { icon: <Volume2 size={20} />, label: "Narração", desc: "Voz natural e acolhedora" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 glass-card rounded-2xl px-5 py-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kid-orange/20 to-kid-yellow/20 flex items-center justify-center text-kid-yellow flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-extrabold text-sm">{item.label}</p>
                  <p className="text-xs text-primary-foreground/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div custom={2} variants={fadeUp}>
            <CtaButton text="TESTAR GRÁTIS AGORA" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 5. DEMONSTRAÇÃO VISUAL ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-sm mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h3 custom={0} variants={fadeUp} className="text-center text-sm font-bold text-primary-foreground/40 uppercase tracking-wider mb-8">
            Veja como funciona
          </motion.h3>

          <motion.div custom={1} variants={fadeUp} className="glass-card rounded-3xl p-5 space-y-4 shadow-2xl">
            {/* User question */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] text-sm font-bold shadow-lg">
                Pai, o que é morrer? 💭
              </div>
            </div>
            {/* Response */}
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-kid-green/20 flex items-center justify-center text-lg flex-shrink-0">🦎</div>
              <div className="bg-primary-foreground/10 text-primary-foreground px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%] text-sm leading-relaxed">
                Morrer é como quando uma vela termina de brilhar. A chama apaga, mas o calor que ela trouxe continua em quem estava perto. As pessoas que a gente ama deixam uma luz dentro da gente que nunca apaga. ✨
              </div>
            </div>
            <div className="flex items-center gap-1 pl-10 pt-1">
              <span className="text-xs text-primary-foreground/40">Resposta adaptada para 3–5 anos</span>
              <Zap size={12} className="text-kid-yellow" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 6. PROVA SOCIAL ===== */}
      <section className="px-5 py-20 bg-primary-foreground/[0.03]">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-xl md:text-2xl font-extrabold">
            Pais já estão usando todos os dias
          </motion.h2>

          <motion.div custom={1} variants={fadeUp} className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} className="text-kid-yellow fill-kid-yellow" />
            ))}
          </motion.div>

          <motion.p custom={2} variants={fadeUp} className="text-primary-foreground/50 text-sm font-bold">
            +5.000 perguntas respondidas
          </motion.p>

          {/* WhatsApp-style testimonials */}
          <motion.div custom={3} variants={fadeUp} className="space-y-3 pt-4">
            {[
              { name: "Ana, mãe do Pedro", text: "Meu filho perguntou sobre morte na hora de dormir. Abri o Kidzz e respondi com calma. Ele dormiu tranquilo. 🥹", time: "22:47" },
              { name: "Carlos, pai da Sofia", text: "Agora eu me sinto preparado pra qualquer pergunta. É como ter um superpoder de pai. 💪", time: "19:12" },
              { name: "Juliana, mãe do Lucas", text: "Meu filho acha que eu sei tudo agora 😄 O app salvou minhas noites!", time: "21:03" },
            ].map((t, i) => (
              <div key={i} className="bg-[hsl(145,60%,45%,0.08)] border border-kid-green/15 rounded-2xl p-4 text-left relative">
                <p className="text-sm text-primary-foreground/80 leading-relaxed">{t.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-kid-yellow font-bold">{t.name}</p>
                  <span className="text-[10px] text-primary-foreground/30">{t.time}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 7. CTA FORTE ===== */}
      <section className="px-5 py-20 text-center">
        <motion.div
          className="max-w-lg mx-auto space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold">
            Comece agora e nunca mais trave.
          </motion.h2>
          <motion.div custom={1} variants={fadeUp} className="flex items-center justify-center gap-6 text-sm text-primary-foreground/50">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-kid-green" /> Grátis</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-kid-green" /> Sem cartão</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-kid-green" /> Seguro</span>
          </motion.div>
          <motion.div custom={2} variants={fadeUp}>
            <CtaButton text="COMEÇAR AGORA — É GRÁTIS" />
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
          <motion.p custom={1} variants={fadeUp} className="text-lg text-primary-foreground/70">
            A diferença é se você vai <span className="text-primary-foreground font-bold">travar…</span><br />
            ou <span className="text-kid-yellow font-bold">responder.</span>
          </motion.p>
          <motion.div custom={2} variants={fadeUp}>
            <CtaButton text="QUERO NUNCA MAIS TRAVAR" className="shadow-[0_0_40px_hsl(var(--kid-orange)/0.3)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-5 py-10 text-center border-t border-primary-foreground/10">
        <div className="flex items-center justify-center gap-2 text-primary-foreground/30 text-xs">
          <Shield size={12} />
          <span>Seguro e feito para crianças • Sem anúncios • © {new Date().getFullYear()} Kidzz</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
