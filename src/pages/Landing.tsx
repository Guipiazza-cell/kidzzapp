import { motion } from "framer-motion";
import { ArrowRight, Music, BookOpen, MessageCircle, Moon, CheckCircle, Shield, Sparkles, Heart, X, Check, Star, Clock, Zap } from "lucide-react";
import chameleonHero from "@/assets/kidzz/landing-hero.webp";
import MagicalBackground from "@/components/MagicalBackground";

const CTA_URL = "https://kidzzapp.lovable.app";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d * 0.12, duration: 0.6 } }),
};

const CtaButton = ({ text, className = "", subtitle }: { text: string; className?: string; subtitle?: string }) => (
  <div className="w-full flex flex-col items-center gap-2">
    <motion.a
      href={CTA_URL}
      className={`inline-flex items-center justify-center gap-3 w-full max-w-md px-8 py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-lg md:text-xl shadow-2xl active:scale-95 transition-transform ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      animate={{ boxShadow: ["0 10px 30px hsl(var(--kid-orange)/0.3)", "0 10px 50px hsl(var(--kid-yellow)/0.5)", "0 10px 30px hsl(var(--kid-orange)/0.3)"] }}
      transition={{ boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
    >
      {text} <ArrowRight size={22} />
    </motion.a>
    {subtitle && (
      <p className="text-xs text-foreground/70 font-bold">{subtitle}</p>
    )}
  </div>
);

const Landing = () => {
  return (
    <div className="relative min-h-screen text-foreground font-kids overflow-x-hidden">
      {/* Same background as Home */}
      <MagicalBackground />

      <div className="relative z-10">

      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 py-16 text-center">
        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          {/* Trust pill on top */}
          <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <Star size={14} className="text-kid-yellow fill-kid-yellow" />
            <span className="text-xs font-extrabold text-foreground">+5.000 famílias usando hoje</span>
          </motion.div>

          {/* KIDZZ Hero character — full body, no crop */}
          <motion.div custom={1} variants={fadeUp} className="mb-6 relative">
            <div className="absolute inset-0 bg-kid-yellow/30 blur-3xl rounded-full" />
            <motion.img
              src={chameleonHero}
              alt="KIDZZ - personagem amigo do seu filho"
              className="relative w-64 h-80 md:w-80 md:h-96 mx-auto object-contain drop-shadow-2xl"
              loading="eager"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-4 right-2 md:top-8 md:right-8"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Sparkles size={32} className="text-kid-yellow drop-shadow-lg" />
            </motion.div>
          </motion.div>

          <motion.h1 custom={2} variants={fadeUp} className="text-3xl md:text-5xl font-extrabold leading-tight mb-5 text-foreground drop-shadow-md">
            Menos tela vazia.<br />
            <span className="text-kid-orange">Mais conexão</span> com seu filho.
          </motion.h1>

          <motion.p custom={3} variants={fadeUp} className="text-base md:text-lg text-foreground/80 mb-8 max-w-lg mx-auto leading-relaxed font-semibold">
            O <span className="font-extrabold text-kid-orange">KIDZZ</span> transforma o tempo de tela em música, histórias e aprendizado — leve, divertido e seguro.
          </motion.p>

          <motion.div custom={4} variants={fadeUp}>
            <CtaButton text="ASSINAR AGORA" subtitle="✓ 7 dias grátis  •  ✓ Cancele quando quiser" />
          </motion.div>

          {/* Mini trust line */}
          <motion.div custom={5} variants={fadeUp} className="mt-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="text-kid-yellow fill-kid-yellow" />
            ))}
            <span className="text-xs font-bold text-foreground/70 ml-2">4,9/5 — pais reais</span>
          </motion.div>
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
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold leading-tight text-foreground">
            Você sente que seu filho passa<br />
            <span className="text-kid-orange">tempo demais na tela…</span>
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="text-lg md:text-xl text-foreground/70 font-bold">
            mas sem aprender nada de verdade?
          </motion.p>

          <motion.div custom={2} variants={fadeUp} className="pt-4 space-y-2">
            <p className="text-base text-foreground/70 italic font-medium">
              Vídeos soltos. Estímulos vazios.<br />
              Excesso de conteúdo sem propósito.
            </p>
          </motion.div>

          <motion.p custom={3} variants={fadeUp} className="text-lg md:text-xl text-kid-orange font-extrabold pt-4">
            Não é culpa sua.<br />
            <span className="text-foreground/80 font-bold text-base md:text-lg block mt-2">É o que existe hoje. E dá pra mudar.</span>
          </motion.p>

          <motion.div custom={4} variants={fadeUp} className="pt-6">
            <CtaButton text="QUERO MUDAR ISSO" subtitle="Comece em menos de 1 minuto" />
          </motion.div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="flex justify-center py-2">
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-kid-orange to-kid-yellow" />
      </div>

      {/* ===== 3. SOLUÇÃO ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-lg mx-auto text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp}>
            <p className="text-sm font-bold text-kid-orange uppercase tracking-widest mb-3">A solução</p>
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-foreground">
              O <span className="text-kid-orange">KIDZZ</span> foi criado<br />
              para mudar isso.
            </h2>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} className="space-y-3 text-left max-w-sm mx-auto">
            {[
              "🎵 Música interativa que envolve",
              "📖 Histórias que prendem a atenção",
              "🧠 Atividades que estimulam de verdade",
              "💬 Perguntas que desenvolvem o pensar",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 glass-card rounded-2xl px-5 py-4">
                <Check size={20} className="text-kid-green flex-shrink-0" />
                <p className="font-bold text-base text-foreground">{item}</p>
              </div>
            ))}
          </motion.div>

          <motion.p custom={2} variants={fadeUp} className="text-base md:text-lg text-foreground/80 leading-relaxed pt-2 font-medium">
            Tudo guiado por um <span className="text-kid-orange font-extrabold">personagem</span> que a criança<br />
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
            <p className="text-sm font-bold text-kid-orange uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              4 mundos. 1 experiência.
            </h2>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
            {[
              { emoji: "🌿", title: "Música", desc: "Canta, cria, interage", color: "from-kid-green/20 to-kid-blue/10" },
              { emoji: "📖", title: "Histórias", desc: "Aprende brincando", color: "from-kid-orange/20 to-kid-yellow/10" },
              { emoji: "💬", title: "Perguntas", desc: "Desenvolve o pensar", color: "from-kid-blue/20 to-kid-purple/10" },
              { emoji: "🌙", title: "Sonhos", desc: "Desacelera e relaxa", color: "from-kid-purple/20 to-kid-blue/10" },
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
                <h3 className="font-extrabold text-base md:text-lg mb-1 text-foreground">{p.title}</h3>
                <p className="text-xs md:text-sm text-foreground/70 font-medium">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <CtaButton text="EXPERIMENTAR OS 4 MUNDOS" subtitle="Acesso imediato" />
        </motion.div>
      </section>

      {/* ===== 5. TRANSFORMAÇÃO ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-foreground">
            A transformação que você procura
          </motion.h2>

          <motion.div custom={1} variants={fadeUp} className="grid md:grid-cols-2 gap-4">
            {/* ANTES */}
            <div className="glass-card rounded-2xl p-6 border border-destructive/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X size={18} className="text-destructive" />
                </div>
                <p className="text-sm font-extrabold uppercase tracking-wider text-destructive">Antes</p>
              </div>
              <ul className="space-y-3 text-sm text-foreground/70 font-medium">
                <li className="flex items-start gap-2"><span>•</span> Tela passiva o dia inteiro</li>
                <li className="flex items-start gap-2"><span>•</span> Excesso de estímulo sem propósito</li>
                <li className="flex items-start gap-2"><span>•</span> Pouco aprendizado real</li>
                <li className="flex items-start gap-2"><span>•</span> Culpa toda vez que entrega o celular</li>
              </ul>
            </div>

            {/* DEPOIS */}
            <div className="glass-card rounded-2xl p-6 border-2 border-kid-green/40 bg-gradient-to-br from-kid-green/15 to-transparent">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-kid-green/20 flex items-center justify-center">
                  <Check size={18} className="text-kid-green" />
                </div>
                <p className="text-sm font-extrabold uppercase tracking-wider text-kid-green">Depois</p>
              </div>
              <ul className="space-y-3 text-sm text-foreground font-bold">
                <li className="flex items-start gap-2"><span className="text-kid-orange">✦</span> Participação ativa</li>
                <li className="flex items-start gap-2"><span className="text-kid-orange">✦</span> Desenvolvimento leve</li>
                <li className="flex items-start gap-2"><span className="text-kid-orange">✦</span> Conexão emocional real</li>
                <li className="flex items-start gap-2"><span className="text-kid-orange">✦</span> Tranquilidade pra você</li>
              </ul>
            </div>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} className="mt-10">
            <CtaButton text="ASSINAR AGORA" subtitle="Veja a mudança em 7 dias" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 6. PROVA EMOCIONAL + DEPOIMENTOS ===== */}
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
                className="relative w-40 h-48 object-contain drop-shadow-2xl"
                loading="lazy"
              />
              <motion.div
                className="absolute -bottom-2 right-2 bg-gradient-to-r from-kid-orange to-kid-yellow rounded-full p-2 shadow-lg"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <Heart size={18} className="text-primary-foreground fill-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="text-xl md:text-2xl font-extrabold leading-tight text-foreground">
            Seu filho não só usa o app…<br />
            <span className="text-kid-orange">ele cria uma relação com o KIDZZ.</span>
          </motion.h2>

          <motion.div custom={2} variants={fadeUp} className="grid grid-cols-3 gap-3 pt-2">
            {[
              { emoji: "💛", label: "Volta sozinho" },
              { emoji: "🤩", label: "Se envolve" },
              { emoji: "🧠", label: "Aprende sem perceber" },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-4">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-xs font-bold text-foreground leading-tight">{item.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div custom={3} variants={fadeUp} className="space-y-3 pt-4">
            {[
              { name: "Ana, mãe do Pedro (5)", quote: "Salvou minhas noites antes de dormir. Ele pede o KIDZZ todo dia." },
              { name: "Carla, mãe da Lila (4)", quote: "Primeira vez que vejo minha filha aprender brincando, sem briga." },
              { name: "João, pai do Theo (6)", quote: "Em 1 semana virou rotina. Substituiu vídeo solto." },
            ].map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 text-left">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={12} className="text-kid-yellow fill-kid-yellow" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 font-medium italic mb-2">"{t.quote}"</p>
                <p className="text-xs text-foreground/60 font-bold">— {t.name}</p>
              </div>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fadeUp}>
            <CtaButton text="QUERO PRA MEU FILHO" subtitle="Mais de 5.000 famílias confiam" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 7. OFERTA ===== */}
      <section className="px-5 py-20">
        <motion.div
          className="max-w-md mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="text-center mb-8">
            <p className="text-sm font-bold text-kid-orange uppercase tracking-widest mb-3">A oferta</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Plano simples. Tudo incluído.</h2>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUp}
            className="relative glass-card rounded-3xl p-8 border-2 border-kid-yellow/50 shadow-2xl bg-gradient-to-br from-kid-orange/15 via-transparent to-kid-yellow/15"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg">
              MAIS POPULAR
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-extrabold mb-1 text-foreground">KIDZZ Premium</h3>
              <p className="text-sm text-foreground/70 font-bold">Acesso completo, sem limites</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Acesso completo aos 4 mundos",
                "Novas músicas toda semana",
                "Histórias exclusivas ilimitadas",
                "Criação de músicas personalizadas",
                "Personagem evolui com a criança",
                "Sem anúncios. Ambiente seguro.",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-kid-green flex-shrink-0" />
                  <span className="text-sm font-bold text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <CtaButton text="DESBLOQUEAR TUDO AGORA" subtitle="✓ 7 dias grátis  •  ✓ Cancele quando quiser" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 8. URGÊNCIA + REDUÇÃO DE RISCO ===== */}
      <section className="px-5 py-16">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: <Clock size={20} />, label: "Cancele quando quiser" },
              { icon: <Shield size={20} />, label: "Ambiente 100% seguro" },
              { icon: <Zap size={20} />, label: "Acesso imediato" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl glass-card mx-auto flex items-center justify-center text-kid-green mb-2">
                  {item.icon}
                </div>
                <p className="text-xs font-bold text-foreground leading-tight">{item.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div custom={1} variants={fadeUp} className="glass-card rounded-2xl p-5 text-center">
            <p className="text-sm font-bold text-foreground mb-1">
              ⏳ Cada dia é uma oportunidade perdida de conexão.
            </p>
            <p className="text-xs text-foreground/70 font-medium">
              Comece hoje. Os primeiros 7 dias são por nossa conta.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 9. CTA FINAL ===== */}
      <section className="px-5 py-24 text-center">
        <motion.div
          className="max-w-lg mx-auto space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fadeUp} className="relative inline-block">
            <div className="absolute inset-0 bg-kid-yellow/30 blur-2xl rounded-full" />
            <img
              src={chameleonHero}
              alt="KIDZZ"
              className="relative w-32 h-40 mx-auto object-contain drop-shadow-2xl mb-2"
              loading="lazy"
            />
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold leading-tight text-foreground">
            Comece hoje e transforme<br />
            o tempo de tela do seu filho.
          </motion.h2>

          <motion.p custom={2} variants={fadeUp} className="text-base text-foreground/80 font-medium max-w-md mx-auto">
            Em 7 dias, seu filho vai pedir o KIDZZ sozinho.<br />
            E você vai dormir tranquilo.
          </motion.p>

          <motion.div custom={3} variants={fadeUp}>
            <CtaButton text="ASSINAR AGORA" subtitle="✓ 7 dias grátis  •  ✓ Sem cartão  •  ✓ Cancele quando quiser" className="shadow-[0_0_60px_hsl(var(--kid-orange)/0.4)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-5 py-10 text-center border-t border-foreground/10">
        <div className="flex items-center justify-center gap-2 text-foreground/50 text-xs">
          <Shield size={12} />
          <span>Seguro e feito para crianças • Sem anúncios • © {new Date().getFullYear()} Kidzz</span>
        </div>
      </footer>

      </div>
    </div>
  );
};

export default Landing;
