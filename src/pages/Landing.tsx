import { motion } from "framer-motion";
import { ArrowRight, Music, BookOpen, MessageCircle, Moon, CheckCircle, Shield, Sparkles, Heart, X, Check } from "lucide-react";
import chameleonHero from "@/assets/chameleon-main.jpeg";
import forestBg from "@/assets/forest-bg-light.jpg";

const CTA_URL = "https://kidzzapp.lovable.app";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d * 0.12, duration: 0.6 } }),
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

      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 py-16 text-center overflow-hidden">
        {/* Background forest with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${forestBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,40%,10%)]/70 via-[hsl(210,40%,10%)]/60 to-[hsl(210,40%,10%)]" />

        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          {/* KIDZZ Hero character */}
          <motion.div custom={0} variants={fadeUp} className="mb-8 relative">
            <div className="absolute inset-0 bg-kid-yellow/20 blur-3xl rounded-full" />
            <motion.img
              src={chameleonHero}
              alt="KIDZZ - personagem amigo do seu filho"
              className="relative w-56 h-56 md:w-72 md:h-72 rounded-full mx-auto object-cover shadow-2xl border-4 border-kid-yellow/40"
              loading="eager"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -top-2 -right-2 md:-top-4 md:-right-4"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Sparkles size={32} className="text-kid-yellow drop-shadow-lg" />
            </motion.div>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            Menos tela vazia.<br />
            <span className="text-kid-yellow">Mais conexão</span> com seu filho.
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-base md:text-lg text-primary-foreground/75 mb-10 max-w-lg mx-auto leading-relaxed font-medium">
            O KIDZZ transforma o tempo de tela em música, histórias e aprendizado — de forma leve, divertida e segura.
          </motion.p>

          <motion.div custom={3} variants={fadeUp}>
            <CtaButton text="COMEÇAR AGORA" />
          </motion.div>

          <motion.p custom={4} variants={fadeUp} className="text-xs text-primary-foreground/50 mt-4 font-bold">
            Grátis para começar • Sem cartão
          </motion.p>
        </motion.div>

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

      {/* ===== 2. DOR ===== */}
      <section className="px-5 py-20 text-center">
        <motion.div
          className="max-w-lg mx-auto space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold leading-tight">
            Você sente que seu filho passa<br />
            <span className="text-kid-orange">tempo demais na tela…</span>
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="text-lg md:text-xl text-primary-foreground/70 font-bold">
            mas sem aprender nada de verdade?
          </motion.p>

          <motion.div custom={2} variants={fadeUp} className="pt-4 space-y-2">
            <p className="text-base text-primary-foreground/60 italic">
              Vídeos soltos. Estímulos vazios.<br />
              Excesso de conteúdo sem propósito.
            </p>
          </motion.div>

          <motion.p custom={3} variants={fadeUp} className="text-lg md:text-xl text-kid-yellow font-extrabold pt-4">
            Não é culpa sua.<br />
            <span className="text-primary-foreground/80 font-bold text-base md:text-lg block mt-2">É o que existe hoje.</span>
          </motion.p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="flex justify-center py-2">
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-kid-orange to-kid-yellow" />
      </div>

      {/* ===== 3. SOLUÇÃO ===== */}
      <section className="px-5 py-20 bg-primary-foreground/[0.03] backdrop-blur-sm">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp}>
            <p className="text-sm font-bold text-kid-yellow uppercase tracking-widest mb-3">A solução</p>
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
              O <span className="text-kid-yellow">KIDZZ</span> foi criado<br />
              para mudar isso.
            </h2>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} className="space-y-3 text-left max-w-sm mx-auto">
            {[
              "🎵 Música interativa que envolve",
              "📖 Histórias que prendem a atenção",
              "🧠 Atividades que estimulam de verdade",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 glass-card rounded-2xl px-5 py-4">
                <Check size={20} className="text-kid-green flex-shrink-0" />
                <p className="font-bold text-base">{item}</p>
              </div>
            ))}
          </motion.div>

          <motion.p custom={2} variants={fadeUp} className="text-base md:text-lg text-primary-foreground/70 leading-relaxed pt-2">
            Tudo guiado por um <span className="text-kid-yellow font-extrabold">personagem</span> que a criança<br />
            cria vínculo de verdade.
          </motion.p>
        </motion.div>
      </section>

      {/* ===== 4. COMO FUNCIONA ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="text-center mb-10">
            <p className="text-sm font-bold text-kid-yellow uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              4 mundos. 1 experiência.
            </h2>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { icon: <Music size={24} />, emoji: "🌿", title: "Música", desc: "Canta, cria, interage", color: "from-kid-green/20 to-kid-blue/10" },
              { icon: <BookOpen size={24} />, emoji: "📖", title: "Histórias", desc: "Aprende brincando", color: "from-kid-orange/20 to-kid-yellow/10" },
              { icon: <MessageCircle size={24} />, emoji: "💬", title: "Perguntas", desc: "Desenvolve o pensar", color: "from-kid-blue/20 to-kid-purple/10" },
              { icon: <Moon size={24} />, emoji: "🌙", title: "Sonhos", desc: "Desacelera e relaxa", color: "from-kid-purple/20 to-kid-blue/10" },
            ].map((p, i) => (
              <motion.div
                key={i}
                className={`glass-card rounded-2xl p-5 text-center bg-gradient-to-br ${p.color}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring" }}
              >
                <div className="text-4xl mb-3">{p.emoji}</div>
                <h3 className="font-extrabold text-base md:text-lg mb-1">{p.title}</h3>
                <p className="text-xs md:text-sm text-primary-foreground/60 font-medium">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 5. TRANSFORMAÇÃO ===== */}
      <section className="px-5 py-20 bg-primary-foreground/[0.03]">
        <motion.div
          className="max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-center mb-10">
            A transformação que você procura
          </motion.h2>

          <motion.div custom={1} variants={fadeUp} className="grid md:grid-cols-2 gap-4">
            {/* ANTES */}
            <div className="glass-card rounded-2xl p-6 border border-destructive/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X size={18} className="text-destructive" />
                </div>
                <p className="text-sm font-extrabold uppercase tracking-wider text-destructive">Antes</p>
              </div>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li className="flex items-start gap-2"><span>•</span> Tela passiva</li>
                <li className="flex items-start gap-2"><span>•</span> Excesso de estímulo</li>
                <li className="flex items-start gap-2"><span>•</span> Pouco aprendizado</li>
              </ul>
            </div>

            {/* DEPOIS */}
            <div className="glass-card rounded-2xl p-6 border border-kid-green/30 bg-gradient-to-br from-kid-green/10 to-transparent">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-kid-green/20 flex items-center justify-center">
                  <Check size={18} className="text-kid-green" />
                </div>
                <p className="text-sm font-extrabold uppercase tracking-wider text-kid-green">Depois</p>
              </div>
              <ul className="space-y-3 text-sm text-primary-foreground/90 font-bold">
                <li className="flex items-start gap-2"><span className="text-kid-yellow">✦</span> Participação ativa</li>
                <li className="flex items-start gap-2"><span className="text-kid-yellow">✦</span> Desenvolvimento leve</li>
                <li className="flex items-start gap-2"><span className="text-kid-yellow">✦</span> Conexão emocional</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 6. PROVA EMOCIONAL ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-kid-yellow/30 blur-2xl rounded-full" />
              <img
                src={chameleonHero}
                alt="Vínculo com KIDZZ"
                className="relative w-32 h-32 rounded-full object-cover border-4 border-kid-yellow/40 shadow-2xl"
                loading="lazy"
              />
              <motion.div
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-kid-orange to-kid-yellow rounded-full p-2 shadow-lg"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <Heart size={18} className="text-primary-foreground fill-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="text-xl md:text-2xl font-extrabold leading-tight">
            Seu filho não só usa o app…<br />
            <span className="text-kid-yellow">ele cria uma relação com o KIDZZ.</span>
          </motion.h2>

          <motion.div custom={2} variants={fadeUp} className="grid grid-cols-3 gap-3 pt-4">
            {[
              { emoji: "💛", label: "Volta sozinho" },
              { emoji: "🤩", label: "Se envolve" },
              { emoji: "🧠", label: "Aprende sem perceber" },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-4">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-xs font-bold text-primary-foreground/80 leading-tight">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 7. OFERTA ===== */}
      <section className="px-5 py-20 bg-primary-foreground/[0.03]">
        <motion.div
          className="max-w-md mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="text-center mb-8">
            <p className="text-sm font-bold text-kid-yellow uppercase tracking-widest mb-3">A oferta</p>
            <h2 className="text-2xl md:text-3xl font-extrabold">Plano simples. Tudo incluído.</h2>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUp}
            className="relative glass-card rounded-3xl p-8 border-2 border-kid-yellow/40 shadow-2xl bg-gradient-to-br from-kid-orange/10 via-transparent to-kid-yellow/10"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg">
              MAIS POPULAR
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-extrabold mb-1">KIDZZ Premium</h3>
              <p className="text-sm text-primary-foreground/60 font-bold">Acesso completo</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Acesso completo ao app",
                "Novas músicas toda semana",
                "Histórias exclusivas",
                "Criação ilimitada",
                "Personagem evolui com a criança",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-kid-green flex-shrink-0" />
                  <span className="text-sm font-bold">{item}</span>
                </li>
              ))}
            </ul>

            <CtaButton text="DESBLOQUEAR TUDO" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 8. REDUÇÃO DE RISCO ===== */}
      <section className="px-5 py-16">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { icon: <CheckCircle size={20} />, label: "Cancele quando quiser" },
              { icon: <Shield size={20} />, label: "Ambiente seguro" },
              { icon: <Heart size={20} />, label: "Feito para crianças" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl glass-card mx-auto flex items-center justify-center text-kid-green mb-2">
                  {item.icon}
                </div>
                <p className="text-xs font-bold text-primary-foreground/70 leading-tight">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 9. CTA FINAL ===== */}
      <section className="px-5 py-24 text-center bg-gradient-to-t from-kid-orange/10 via-transparent to-transparent">
        <motion.div
          className="max-w-lg mx-auto space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp}>
            <img
              src={chameleonHero}
              alt="KIDZZ"
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-kid-yellow/40 shadow-xl mb-6"
              loading="lazy"
            />
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold leading-tight">
            Comece hoje e transforme<br />
            o tempo de tela do seu filho.
          </motion.h2>

          <motion.div custom={2} variants={fadeUp}>
            <CtaButton text="COMEÇAR AGORA" className="shadow-[0_0_40px_hsl(var(--kid-orange)/0.3)]" />
          </motion.div>

          <motion.p custom={3} variants={fadeUp} className="text-xs text-primary-foreground/50 font-bold">
            Grátis para começar • Sem cartão • Cancele quando quiser
          </motion.p>
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
