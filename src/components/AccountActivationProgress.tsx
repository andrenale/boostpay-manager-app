import { useState, useEffect } from "react";
import { Check, Circle, ChevronDown, ChevronUp, Play, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BoostButton } from "@/components/ui/boost-button";
import { useNavigate } from "react-router-dom";

interface Step {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "pending" | "in-review";
  action?: () => void;
  actionLabel?: string;
  reviewTime?: string;
}

export function AccountActivationProgress() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Verificar se os documentos foram enviados
  useEffect(() => {
    const checkDocuments = () => {
      const allDocumentsCompleted = localStorage.getItem('allDocumentsCompleted') === 'true';
      setDocumentsSubmitted(allDocumentsCompleted);
    };

    checkDocuments();
    // Verificar periodicamente para mudanças
    const interval = setInterval(checkDocuments, 1000);
    return () => clearInterval(interval);
  }, []);

  const steps: Step[] = [
    {
      id: 1,
      title: "Conta criada",
      description: "Sua conta BoostPay foi criada com sucesso e está pronta para configuração.",
      status: "completed",
    },
    {
      id: 2,
      title: "Faça sua primeira transação teste",
      description: "Crie uma cobrança e teste como funciona o processo de pagamento em ambiente seguro.",
      status: "completed",
    },
    {
      id: 3,
      title: "Complete seus dados",
      description: "Preencha as informações da sua empresa (CNPJ) e confirme seu número de celular para prosseguir.",
      status: "completed",
    },
    {
      id: 4,
      title: "Registre seu KYC",
      description: "Envie seus documentos pessoais e da empresa para verificação de identidade e conformidade.",
      status: documentsSubmitted ? "in-review" : "current",
      action: documentsSubmitted ? undefined : () => navigate('/onboarding?step=4'),
      actionLabel: documentsSubmitted ? "Em Análise" : "Fazer verificação",
      reviewTime: documentsSubmitted ? "Em até 3 dias úteis" : undefined,
    },
    {
      id: 5,
      title: "Modo produção disponível",
      description: "Parabéns! Sua conta foi aprovada e você já pode receber pagamentos reais dos seus clientes.",
      status: "pending",
    },
    {
      id: 6,
      title: "Faça sua primeira venda",
      description: "Ative o modo produção e comece a receber pagamentos reais dos seus clientes imediatamente.",
      status: "pending",
    },
  ];

  const completedSteps = steps.filter(s => s.status === "completed").length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 rounded-full bg-status-success flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        );
      case "current":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <Play className="h-4 w-4 text-white" />
          </div>
        );
      case "in-review":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
        );
      case "pending":
        return (
          <div className="w-8 h-8 rounded-full bg-boost-bg-tertiary border-2 border-boost-border flex items-center justify-center">
            <Circle className="h-4 w-4 text-boost-text-secondary" />
          </div>
        );
    }
  };

  return (
    <Card className="border border-boost-border bg-boost-bg-primary overflow-hidden">
      {/* Header - sempre visível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-boost-bg-secondary transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-status-success/20 flex items-center justify-center">
            <Play className="h-5 w-5 text-status-success" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-boost-text-primary">
              Configure sua conta
            </h3>
            <p className="text-xs text-boost-text-secondary">
              {completedSteps} de {totalSteps} passos completos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-boost-text-secondary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-boost-text-secondary" />
          )}
        </div>
      </button>

      {/* Progress Bar - sempre visível */}
      <div className="px-4 pb-3">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Steps Details - colapsável */}
      {isExpanded && (
        <div className="border-t border-boost-border bg-boost-bg-secondary">
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium ${
                      step.status === "pending"
                        ? "text-boost-text-secondary"
                        : "text-boost-text-primary"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-boost-text-secondary mt-1 leading-relaxed">
                    {step.description}
                  </p>
                  {step.status === "in-review" ? (
                    <div className="mt-2">
                      <BoostButton
                        size="sm"
                        disabled
                        className="bg-amber-500 hover:bg-amber-500 text-white cursor-not-allowed opacity-90"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {step.actionLabel}
                      </BoostButton>
                      {step.reviewTime && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          {step.reviewTime}
                        </p>
                      )}
                    </div>
                  ) : step.action && step.actionLabel && (
                    <BoostButton
                      size="sm"
                      onClick={step.action}
                      className="mt-2"
                    >
                      {step.actionLabel}
                    </BoostButton>
                  )}
                </div>

                {/* Connector line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[2.5rem] w-0.5 h-12 bg-boost-border mt-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
