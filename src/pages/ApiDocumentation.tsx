import { useState } from "react";
import { 
  ArrowLeft, 
  Copy, 
  Code, 
  Key, 
  Zap, 
  CheckCircle, 
  ExternalLink,
  Book,
  AlertCircle,
  Terminal,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { BoostBadge } from "@/components/ui/boost-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const ApiDocumentation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
    toast({
      title: "✅ Copiado!",
      description: "Código copiado para a área de transferência"
    });
  };

  const endpoints = [
    {
      method: "POST",
      path: "/v1/charges",
      description: "Criar nova cobrança",
      params: ["amount", "currency", "customer_id", "description"]
    },
    {
      method: "GET",
      path: "/v1/charges/{charge_id}",
      description: "Buscar cobrança por ID",
      params: ["charge_id"]
    },
    {
      method: "POST",
      path: "/v1/charges/{charge_id}/cancel",
      description: "Cancelar cobrança",
      params: ["charge_id", "reason"]
    },
    {
      method: "GET",
      path: "/v1/charges",
      description: "Listar cobranças",
      params: ["limit", "offset", "status", "customer_id"]
    }
  ];

  const webhookEvents = [
    {
      event: "charge.paid",
      description: "Disparado quando um pagamento é aprovado",
      payload: {
        id: "ch_1234567890",
        status: "paid",
        amount: 10000,
        currency: "BRL",
        customer_id: "cus_1234567890"
      }
    },
    {
      event: "charge.failed",
      description: "Disparado quando um pagamento falha",
      payload: {
        id: "ch_1234567890",
        status: "failed",
        failure_reason: "insufficient_funds"
      }
    },
    {
      event: "charge.refunded",
      description: "Disparado quando um pagamento é estornado",
      payload: {
        id: "ch_1234567890",
        status: "refunded",
        refund_amount: 10000
      }
    }
  ];

  return (
    <div className="min-h-screen bg-boost-bg-primary">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <BoostButton 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </BoostButton>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold text-boost-text-primary flex items-center space-x-3">
              <Book className="h-8 w-8 text-boost-primary" />
              <span>Documentação da API</span>
            </h1>
            <p className="text-boost-text-secondary mt-2">
              Guia completo para integrar o Boost Pay ao seu sistema
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <BoostCard className="bg-gradient-to-r from-boost-primary/5 to-boost-accent/5 border-boost-primary/20">
          <BoostCardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-boost-primary/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-boost-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-boost-text-primary mb-2">
                  Início Rápido
                </h2>
                <p className="text-boost-text-secondary mb-4">
                  Configure sua integração em 3 passos simples
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center space-x-2 p-3 bg-boost-bg-tertiary/30 rounded-lg">
                    <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-sm font-medium text-boost-text-primary">Obtenha suas chaves de API</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-boost-bg-tertiary/30 rounded-lg">
                    <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-sm font-medium text-boost-text-primary">Faça sua primeira requisição</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-boost-bg-tertiary/30 rounded-lg">
                    <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-sm font-medium text-boost-text-primary">Configure os webhooks</span>
                  </div>
                </div>
              </div>
            </div>
          </BoostCardContent>
        </BoostCard>

        {/* API Documentation Tabs */}
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-boost-bg-secondary">
            <TabsTrigger value="authentication" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <Key className="h-4 w-4 mr-2" />
              Autenticação
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <Globe className="h-4 w-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <Zap className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <Code className="h-4 w-4 mr-2" />
              Exemplos
            </TabsTrigger>
          </TabsList>

          {/* Authentication */}
          <TabsContent value="authentication">
            <BoostCard>
              <BoostCardHeader>
                <BoostCardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-boost-primary" />
                  <span>Autenticação</span>
                </BoostCardTitle>
                <BoostCardDescription>
                  Como autenticar suas requisições na API do Boost Pay
                </BoostCardDescription>
              </BoostCardHeader>
              <BoostCardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-boost-text-primary">Chaves de API</h3>
                  <p className="text-boost-text-secondary">
                    A API do Boost Pay usa chaves de API para autenticar requisições. Você possui duas chaves:
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-boost-primary" />
                        <h4 className="font-semibold text-boost-text-primary">Chave Pública</h4>
                      </div>
                      <p className="text-sm text-boost-text-secondary mb-3">
                        Use no frontend para criar tokens de pagamento
                      </p>
                      <code className="text-xs bg-boost-bg-secondary p-2 rounded block">
                        pk_live_51H123abc...
                      </code>
                    </div>
                    <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Key className="h-4 w-4 text-status-error" />
                        <h4 className="font-semibold text-boost-text-primary">Chave Secreta</h4>
                      </div>
                      <p className="text-sm text-boost-text-secondary mb-3">
                        Use apenas no backend para operações críticas
                      </p>
                      <code className="text-xs bg-boost-bg-secondary p-2 rounded block">
                        sk_live_51H123abc...
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-boost-text-primary">Como Autenticar</h3>
                  <p className="text-boost-text-secondary">
                    Inclua sua chave secreta no header <code className="bg-boost-bg-secondary px-2 py-1 rounded">Authorization</code>:
                  </p>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard("Authorization: Bearer sk_live_51H123abc...", "auth")}
                    >
                      {copiedEndpoint === "auth" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary">
{`curl -X POST https://api.boostpay.com/v1/charges \\
  -H "Authorization: Bearer sk_live_51H123abc..." \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
              </BoostCardContent>
            </BoostCard>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints">
            <div className="space-y-6">
              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-boost-primary" />
                    <span>Endpoints da API</span>
                  </BoostCardTitle>
                  <BoostCardDescription>
                    URL base: <code className="bg-boost-bg-secondary px-2 py-1 rounded">https://api.boostpay.com</code>
                  </BoostCardDescription>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="space-y-4">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="p-4 bg-boost-bg-tertiary/20 rounded-lg border border-boost-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <BoostBadge 
                              variant={endpoint.method === "POST" ? "success" : "outline"}
                              className="font-mono"
                            >
                              {endpoint.method}
                            </BoostBadge>
                            <code className="text-boost-text-primary font-medium">
                              {endpoint.path}
                            </code>
                          </div>
                          <BoostButton 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.path}`, `endpoint-${index}`)}
                          >
                            {copiedEndpoint === `endpoint-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </BoostButton>
                        </div>
                        <p className="text-boost-text-secondary mb-3">{endpoint.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {endpoint.params.map((param) => (
                            <code key={param} className="text-xs bg-boost-bg-secondary px-2 py-1 rounded text-boost-text-primary">
                              {param}
                            </code>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </BoostCardContent>
              </BoostCard>
            </div>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks">
            <BoostCard>
              <BoostCardHeader>
                <BoostCardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-boost-primary" />
                  <span>Eventos de Webhook</span>
                </BoostCardTitle>
                <BoostCardDescription>
                  Receba notificações automáticas quando eventos importantes ocorrerem
                </BoostCardDescription>
              </BoostCardHeader>
              <BoostCardContent>
                <div className="space-y-6">
                  {webhookEvents.map((webhook, index) => (
                    <div key={index} className="p-4 bg-boost-bg-tertiary/20 rounded-lg border border-boost-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <BoostBadge variant="success" className="font-mono">
                            {webhook.event}
                          </BoostBadge>
                        </div>
                        <BoostButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(webhook.payload, null, 2), `webhook-${index}`)}
                        >
                          {copiedEndpoint === `webhook-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </BoostButton>
                      </div>
                      <p className="text-boost-text-secondary mb-4">{webhook.description}</p>
                      <div className="bg-boost-bg-secondary p-3 rounded">
                        <h4 className="text-sm font-semibold text-boost-text-primary mb-2">Payload de exemplo:</h4>
                        <pre className="text-xs text-boost-text-secondary">
                          {JSON.stringify(webhook.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </BoostCardContent>
            </BoostCard>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples">
            <BoostCard>
              <BoostCardHeader>
                <BoostCardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-boost-primary" />
                  <span>Exemplos de Código</span>
                </BoostCardTitle>
                <BoostCardDescription>
                  Exemplos práticos de como usar a API
                </BoostCardDescription>
              </BoostCardHeader>
              <BoostCardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-boost-text-primary">Criar uma Cobrança</h3>
                    <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                      <BoostButton 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(`curl -X POST https://api.boostpay.com/v1/charges \\
  -H "Authorization: Bearer sk_live_51H123abc..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10000,
    "currency": "BRL",
    "customer_id": "cus_1234567890",
    "description": "Cobrança de teste"
  }'`, "create-charge")}
                      >
                        {copiedEndpoint === "create-charge" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </BoostButton>
                      <pre className="text-sm text-boost-text-primary">
{`curl -X POST https://api.boostpay.com/v1/charges \\
  -H "Authorization: Bearer sk_live_51H123abc..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10000,
    "currency": "BRL",
    "customer_id": "cus_1234567890",
    "description": "Cobrança de teste"
  }'`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-boost-text-primary">Resposta de Sucesso</h3>
                    <div className="bg-boost-bg-secondary p-4 rounded-lg">
                      <pre className="text-sm text-boost-text-primary">
{`{
  "id": "ch_1234567890",
  "status": "pending",
  "amount": 10000,
  "currency": "BRL",
  "customer_id": "cus_1234567890",
  "description": "Cobrança de teste",
  "payment_url": "https://pay.boostpay.com/ch_1234567890",
  "created_at": "2024-01-15T10:30:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </BoostCardContent>
            </BoostCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiDocumentation;