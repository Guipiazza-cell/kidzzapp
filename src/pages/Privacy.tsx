import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jungleBg from "@/assets/jungle-bg.jpg";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <header className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2">
        <motion.button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/20"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-kid-green" />
          <h1 className="text-lg font-extrabold text-white drop-shadow-lg">Política de Privacidade</h1>
        </div>
      </header>

      <div className="flex-1 relative z-10 overflow-y-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-5 text-white/90 text-sm leading-relaxed"
        >
          <p className="text-xs text-white/50">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">1. Informações que coletamos</h2>
            <p>O Kidzz coleta apenas as informações necessárias para oferecer uma experiência personalizada e segura:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nome da criança (para personalização das respostas)</li>
              <li>Faixa etária selecionada (para adequação do conteúdo)</li>
              <li>E-mail do responsável (para login e comunicação)</li>
              <li>Histórico de perguntas da sessão atual</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">2. Como usamos suas informações</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Personalizar respostas com base na idade e nome da criança</li>
              <li>Gerenciar sua assinatura e pagamentos via Stripe</li>
              <li>Melhorar a experiência do aplicativo</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">3. Segurança infantil</h2>
            <p>O Kidzz foi desenvolvido com foco na segurança das crianças:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Todas as respostas passam por filtros de conteúdo em tempo real</li>
              <li>Conteúdos violentos, sexuais ou inadequados são automaticamente bloqueados</li>
              <li>A linguagem é adaptada à faixa etária selecionada</li>
              <li>Não coletamos dados pessoais sensíveis de crianças</li>
              <li>Controle parental com porta de segurança (conta matemática)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">4. Compartilhamento de dados</h2>
            <p>Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros, exceto:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Stripe: para processamento seguro de pagamentos</li>
              <li>Provedores de IA: para gerar respostas (dados anonimizados)</li>
              <li>Quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">5. Armazenamento e retenção</h2>
            <p>Os dados são armazenados de forma segura em servidores protegidos. Você pode solicitar a exclusão de seus dados a qualquer momento entrando em contato conosco.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">6. Direitos do usuário</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acessar, corrigir ou excluir seus dados pessoais</li>
              <li>Cancelar sua assinatura a qualquer momento</li>
              <li>Solicitar uma cópia dos dados armazenados</li>
              <li>Revogar o consentimento para uso de dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">7. Pagamentos</h2>
            <p>Os pagamentos são processados pela Stripe, uma plataforma segura e certificada PCI DSS. Não armazenamos dados de cartão de crédito em nossos servidores.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">8. Contato</h2>
            <p>Para dúvidas, solicitações ou reclamações sobre privacidade:</p>
            <p className="mt-2 font-bold">📧 <a href="mailto:kidzz.ia@icloud.com" className="text-kid-green underline">kidzz.ia@icloud.com</a></p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">9. Termos de uso</h2>
            <p>Ao utilizar o Kidzz, você concorda que:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>O uso deve ser supervisionado por um adulto responsável</li>
              <li>As respostas são geradas por inteligência artificial e podem conter imprecisões</li>
              <li>O serviço é fornecido "como está", sem garantias de disponibilidade contínua</li>
              <li>O Kidzz reserva-se o direito de alterar preços e funcionalidades com aviso prévio</li>
              <li>É proibido usar o serviço para fins ilícitos ou inadequados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-white mb-2">10. Alterações nesta política</h2>
            <p>Reservamo-nos o direito de atualizar esta política. Notificaremos sobre alterações significativas por e-mail ou dentro do aplicativo.</p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
