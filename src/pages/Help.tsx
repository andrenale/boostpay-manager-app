import { Book, MessageCircle, Mail, FileText, ExternalLink } from "lucide-react";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";

const Help = () => {
  const helpTopics = [
    {
      title: "Primeiros Passos",
      description: "Aprenda a configurar sua conta e realizar suas primeiras transações",
      icon: Book,
      articles: [
        "Como criar sua primeira transação",
        "Configurando webhooks",
        "Testando pagamentos no ambiente sandbox"
      ]
    },
    {
      title: "Split de Pagamentos",
      description: "Entenda como dividir pagamentos entre múltiplos recebedores",
      icon: FileText,
      articles: [
        "Criando regras de split",
        "Cadastrando recebedores", 
        "Gerenciando taxas de transação"
      ]
    },
    {
      title: "Segurança",
      description: "Mantenha sua conta e integrações seguras",
      icon: MessageCircle,
      articles: [
        "Boas práticas com chaves de API",
        "Configurando 2FA",
        "Validando webhooks"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-boost-text-primary mb-2">
          Central de Ajuda
        </h1>
        <p className="text-boost-text-secondary">
          Encontre respostas para suas dúvidas e aprenda a usar a plataforma.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <BoostCard className="text-center p-6 hover:boost-glow transition-all duration-300 cursor-pointer">
          <div className="w-12 h-12 bg-boost-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-boost-accent" />
          </div>
          <h3 className="text-lg font-semibold text-boost-text-primary mb-2">Chat ao Vivo</h3>
          <p className="text-boost-text-secondary mb-4">
            Fale com nosso suporte em tempo real
          </p>
          <BoostButton variant="outline" className="w-full">
            Iniciar Chat
          </BoostButton>
        </BoostCard>

        <BoostCard className="text-center p-6 hover:boost-glow transition-all duration-300 cursor-pointer">
          <div className="w-12 h-12 bg-boost-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-boost-accent" />
          </div>
          <h3 className="text-lg font-semibold text-boost-text-primary mb-2">Suporte por E-mail</h3>
          <p className="text-boost-text-secondary mb-4">
            Envie sua dúvida detalhada
          </p>
          <BoostButton variant="outline" className="w-full">
            Enviar E-mail
          </BoostButton>
        </BoostCard>

        <BoostCard className="text-center p-6 hover:boost-glow transition-all duration-300 cursor-pointer">
          <div className="w-12 h-12 bg-boost-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="h-6 w-6 text-boost-accent" />
          </div>
          <h3 className="text-lg font-semibold text-boost-text-primary mb-2">Documentação</h3>
          <p className="text-boost-text-secondary mb-4">
            Guias completos para desenvolvedores
          </p>
          <BoostButton variant="outline" className="w-full">
            Ver Docs
            <ExternalLink className="h-4 w-4 ml-2" />
          </BoostButton>
        </BoostCard>
      </div>

      {/* Help Topics */}
      <div className="space-y-6 animate-slide-up">
        <h2 className="text-2xl font-bold text-boost-text-primary">Tópicos de Ajuda</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {helpTopics.map((topic, index) => (
            <BoostCard key={index}>
              <BoostCardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-boost-accent/10 rounded-full flex items-center justify-center">
                    <topic.icon className="h-4 w-4 text-boost-accent" />
                  </div>
                  <BoostCardTitle className="text-lg">{topic.title}</BoostCardTitle>
                </div>
                <BoostCardDescription>{topic.description}</BoostCardDescription>
              </BoostCardHeader>
              <BoostCardContent>
                <div className="space-y-2">
                  {topic.articles.map((article, articleIndex) => (
                    <div 
                      key={articleIndex}
                      className="p-2 hover:bg-boost-bg-tertiary rounded cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-boost-text-secondary hover:text-boost-accent">
                        {article}
                      </p>
                    </div>
                  ))}
                </div>
              </BoostCardContent>
            </BoostCard>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <BoostCard className="animate-slide-up">
        <BoostCardHeader>
          <BoostCardTitle>Perguntas Frequentes</BoostCardTitle>
          <BoostCardDescription>
            Respostas para as dúvidas mais comuns
          </BoostCardDescription>
        </BoostCardHeader>
        <BoostCardContent>
          <div className="space-y-4">
            <div className="border-b border-boost-border pb-4">
              <h3 className="font-semibold text-boost-text-primary mb-2">
                Como funciona o split de pagamentos?
              </h3>
              <p className="text-boost-text-secondary">
                O split de pagamentos permite dividir automaticamente o valor de uma transação 
                entre múltiplos recebedores de acordo com regras predefinidas. Você pode configurar 
                percentuais ou valores fixos para cada participante.
              </p>
            </div>
            
            <div className="border-b border-boost-border pb-4">
              <h3 className="font-semibold text-boost-text-primary mb-2">
                Qual a diferença entre ambiente de teste e produção?
              </h3>
              <p className="text-boost-text-secondary">
                No ambiente de teste você pode simular transações sem movimentar dinheiro real. 
                Use para testar suas integrações. O ambiente de produção processa pagamentos reais.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-boost-text-primary mb-2">
                Como funciona a taxa de aprovação?
              </h3>
              <p className="text-boost-text-secondary">
                A taxa de aprovação é o percentual de transações aprovadas em relação ao total de tentativas. 
                Uma taxa alta indica boa qualidade das transações e menor risco de fraude.
              </p>
            </div>
          </div>
        </BoostCardContent>
      </BoostCard>
    </div>
  );
};

export default Help;