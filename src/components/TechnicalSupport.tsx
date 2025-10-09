import { useState } from "react";
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  X,
  HelpCircle,
  ExternalLink,
  Book,
  Zap
} from "lucide-react";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { BoostBadge } from "@/components/ui/boost-badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface TechnicalSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechnicalSupport = ({ isOpen, onClose }: TechnicalSupportProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "",
    email: "",
    name: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Ticket Criado!",
        description: "Sua solicitação foi enviada. Retornaremos em até 2 horas úteis.",
      });
      
      // Reset form
      setFormData({
        category: "",
        subject: "",
        description: "",
        priority: "",
        email: "",
        name: ""
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "❌ Erro ao Enviar",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Chat ao Vivo",
      description: "Suporte em tempo real",
      availability: "Seg-Sex: 8h às 18h",
      status: "online",
      action: "Iniciar Chat"
    },
    {
      icon: Mail,
      title: "Email",
      description: "suporte-tecnico@boostpay.com.br",
      availability: "Resposta em até 24h",
      status: "available",
      action: "Enviar Email"
    },
    {
      icon: Phone,
      title: "Telefone",
      description: "0800 123 4567",
      availability: "Seg-Sex: 8h às 18h",
      status: "available",
      action: "Ligar Agora"
    }
  ];

  const faqItems = [
    {
      question: "Como configurar minha primeira cobrança?",
      answer: "Acesse a seção Integrações, copie suas chaves de API e siga nossa documentação."
    },
    {
      question: "Por que meu webhook não está funcionando?",
      answer: "Verifique se a URL está acessível e retorna status 200. Consulte os logs de eventos."
    },
    {
      question: "Como cancelar uma cobrança?",
      answer: "Use o endpoint POST /v1/charges/{id}/cancel ou cancele pelo painel administrativo."
    },
    {
      question: "Qual o prazo para receber os pagamentos?",
      answer: "PIX: imediato. Cartão: D+1. Boleto: D+1 após compensação."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-boost-bg-secondary border-boost-border max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-boost-text-primary flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-boost-primary" />
            <span>Suporte Técnico</span>
          </DialogTitle>
          <DialogDescription className="text-boost-text-secondary">
            Estamos aqui para ajudar você com qualquer dúvida técnica ou problema de integração
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Support Channels */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-boost-text-primary mb-4">
                Canais de Atendimento
              </h3>
              <div className="space-y-4">
                {supportChannels.map((channel, index) => (
                  <div key={index} className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-boost-primary/10 rounded-lg">
                          <channel.icon className="h-5 w-5 text-boost-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-boost-text-primary">{channel.title}</h4>
                            <BoostBadge 
                              variant={channel.status === "online" ? "success" : "outline"}
                              className="text-xs"
                            >
                              {channel.status === "online" ? "Online" : "Disponível"}
                            </BoostBadge>
                          </div>
                          <p className="text-sm text-boost-text-secondary mb-1">{channel.description}</p>
                          <div className="flex items-center space-x-1 text-xs text-boost-text-muted">
                            <Clock className="h-3 w-3" />
                            <span>{channel.availability}</span>
                          </div>
                        </div>
                      </div>
                      <BoostButton variant="outline" size="sm">
                        {channel.action}
                      </BoostButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-boost-text-primary mb-4">
                Links Úteis
              </h3>
              <div className="space-y-2">
                <BoostButton 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/api-documentation");
                    onClose();
                  }}
                >
                  <Book className="h-4 w-4 mr-2" />
                  Documentação da API
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </BoostButton>
                <BoostButton 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/code-examples");
                    onClose();
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Exemplos de Código
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </BoostButton>
              <BoostButton variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Suporte Técnico
                <ExternalLink className="h-3 w-3 ml-auto" />
              </BoostButton>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-lg font-semibold text-boost-text-primary mb-4">
                Perguntas Frequentes
              </h3>
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between p-3 bg-boost-bg-tertiary/20 rounded-lg cursor-pointer hover:bg-boost-bg-tertiary/40 transition-colors">
                      <span className="text-sm font-medium text-boost-text-primary pr-4">
                        {item.question}
                      </span>
                      <HelpCircle className="h-4 w-4 text-boost-text-muted group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-3 text-sm text-boost-text-secondary bg-boost-bg-tertiary/10 rounded-b-lg -mt-1">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div>
            <h3 className="text-lg font-semibold text-boost-text-primary mb-4">
              Abrir Ticket de Suporte
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-boost-text-secondary">
                    Nome Completo
                  </label>
                  <BoostInput 
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-boost-text-secondary">
                    Email
                  </label>
                  <BoostInput 
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-boost-text-secondary">
                    Categoria
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="integration">Integração da API</SelectItem>
                      <SelectItem value="webhook">Problemas com Webhook</SelectItem>
                      <SelectItem value="payment">Questões de Pagamento</SelectItem>
                      <SelectItem value="technical">Erro Técnico</SelectItem>
                      <SelectItem value="documentation">Documentação</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-boost-text-secondary">
                    Prioridade
                  </label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-boost-text-secondary">
                  Assunto
                </label>
                <BoostInput 
                  placeholder="Descreva brevemente o problema"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-boost-text-secondary">
                  Descrição Detalhada
                </label>
                <Textarea 
                  placeholder="Descreva o problema em detalhes, incluindo mensagens de erro, códigos utilizados e passos para reproduzir..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <BoostButton 
                  type="button" 
                  variant="secondary" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </BoostButton>
                <BoostButton 
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Ticket
                    </>
                  )}
                </BoostButton>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicalSupport;