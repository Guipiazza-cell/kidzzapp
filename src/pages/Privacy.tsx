import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MagicalBackground from "@/components/MagicalBackground";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />

      <header className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2">
        <motion.button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl glass-card text-gray-600"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-kid-green" />
          <h1 className="text-lg font-extrabold text-gray-800 drop-shadow-sm">Política de Privacidade</h1>
        </div>
      </header>

      <div className="flex-1 relative z-10 overflow-y-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 space-y-5 text-gray-700 text-sm leading-relaxed"
        >
          <p className="text-xs text-gray-400">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          {[
            { title: "1. Informações que coletamos", content: "O Kidzz coleta apenas as informações necessárias para oferecer uma experiência personalizada e segura:", list: ["Nome da criança (para personalização das respostas)", "Faixa etária selecionada (para adequação do conteúdo)", "E-mail do responsável (para login e comunicação)", "Histórico de perguntas da sessão atual"] },
            { title: "2. Como usamos suas informações", list: ["Personalizar respostas com base na idade e nome da criança", "Gerenciar sua assinatura e pagamentos via Stripe", "Melhorar a experiência do aplicativo", "Enviar comunicações importantes sobre o serviço"] },
            { title: "3. Segurança infantil", content: "O Kidzz foi desenvolvido com foco na segurança das crianças:", list: ["Todas as respostas passam por filtros de conteúdo em tempo real", "Conteúdos violentos, sexuais ou inadequados são automaticamente bloqueados", "A linguagem é adaptada à faixa etária selecionada", "Não coletamos dados pessoais sensíveis de crianças", "Controle parental com porta de segurança (conta matemática)"] },
            { title: "4. Compartilhamento de dados", content: "Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros, exceto:", list: ["Stripe: para processamento seguro de pagamentos", "Provedores de IA: para gerar respostas (dados anonimizados)", "Quando exigido por lei"] },
            { title: "5. Armazenamento e retenção", content: "Os dados são armazenados de forma segura em servidores protegidos. Você pode solicitar a exclusão de seus dados a qualquer momento entrando em contato conosco." },
            { title: "6. Direitos do usuário", list: ["Acessar, corrigir ou excluir seus dados pessoais", "Cancelar sua assinatura a qualquer momento", "Solicitar uma cópia dos dados armazenados", "Revogar o consentimento para uso de dados"] },
            { title: "7. Pagamentos", content: "Os pagamentos são processados pela Stripe, uma plataforma segura e certificada PCI DSS. Não armazenamos dados de cartão de crédito em nossos servidores." },
            { title: "8. Contato", content: "Para dúvidas, solicitações ou reclamações sobre privacidade:", extra: <p className="mt-2 font-bold">📧 <a href="mailto:kidzz.ia@icloud.com" className="text-kid-green underline">kidzz.ia@icloud.com</a></p> },
            { title: "9. Termos de uso", content: "Ao utilizar o Kidzz, você concorda que:", list: ["O uso deve ser supervisionado por um adulto responsável", "As respostas são geradas por inteligência artificial e podem conter imprecisões", "O serviço é fornecido \"como está\", sem garantias de disponibilidade contínua", "O Kidzz reserva-se o direito de alterar preços e funcionalidades com aviso prévio", "É proibido usar o serviço para fins ilícitos ou inadequados"] },
            { title: "10. Alterações nesta política", content: "Reservamo-nos o direito de atualizar esta política. Notificaremos sobre alterações significativas por e-mail ou dentro do aplicativo." },
          ].map((section, i) => (
            <section key={i}>
              <h2 className="text-base font-extrabold text-gray-800 mb-2">{section.title}</h2>
              {section.content && <p>{section.content}</p>}
              {section.list && (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {section.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
              {section.extra}
            </section>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
