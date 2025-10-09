import { useState } from "react";
import { 
  ArrowLeft, 
  Copy, 
  Code, 
  CheckCircle, 
  Download,
  ExternalLink,
  Terminal,
  FileText,
  Zap,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostBadge } from "@/components/ui/boost-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const CodeExamples = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "✅ Copiado!",
      description: "Código copiado para a área de transferência"
    });
  };

  const sdks = [
    {
      name: "JavaScript/Node.js",
      icon: "🟨",
      description: "SDK oficial para JavaScript e Node.js",
      install: "npm install @boostpay/node",
      version: "v2.1.0"
    },
    {
      name: "Python",
      icon: "🐍",
      description: "SDK oficial para Python",
      install: "pip install boostpay",
      version: "v1.8.0"
    },
    {
      name: "PHP",
      icon: "🐘",
      description: "SDK oficial para PHP",
      install: "composer require boostpay/boostpay-php",
      version: "v1.5.0"
    },
    {
      name: "Ruby",
      icon: "💎",
      description: "SDK oficial para Ruby",
      install: "gem install boostpay",
      version: "v1.3.0"
    }
  ];

  const examples = {
    javascript: {
      createCharge: `const BoostPay = require('@boostpay/node');
const boostpay = new BoostPay('sk_live_51H123abc...');

async function createCharge() {
  try {
    const charge = await boostpay.charges.create({
      amount: 10000, // R$ 100.00 em centavos
      currency: 'BRL',
      customer_id: 'cus_1234567890',
      description: 'Cobrança de teste',
      payment_methods: ['pix', 'credit_card', 'boleto']
    });
    
    console.log('Cobrança criada:', charge.id);
    console.log('URL de pagamento:', charge.payment_url);
    return charge;
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
  }
}`,
      webhook: `const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Middleware para verificar assinatura do webhook
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-boostpay-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'whsec_1234567890'; // Seu webhook secret
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  next();
}

// Endpoint para receber webhooks
app.post('/webhooks/boostpay', verifyWebhookSignature, (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'charge.paid':
      console.log('Pagamento aprovado:', data.charge.id);
      // Atualizar status do pedido no seu sistema
      break;
      
    case 'charge.failed':
      console.log('Pagamento falhou:', data.charge.id);
      // Notificar o cliente sobre a falha
      break;
      
    case 'charge.refunded':
      console.log('Pagamento estornado:', data.charge.id);
      // Processar estorno no seu sistema
      break;
      
    default:
      console.log('Evento não reconhecido:', event);
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});`
    },
    python: {
      createCharge: `import boostpay

# Configurar a chave da API
boostpay.api_key = "sk_live_51H123abc..."

def create_charge():
    try:
        charge = boostpay.Charge.create(
            amount=10000,  # R$ 100.00 em centavos
            currency='BRL',
            customer_id='cus_1234567890',
            description='Cobrança de teste',
            payment_methods=['pix', 'credit_card', 'boleto']
        )
        
        print(f"Cobrança criada: {charge.id}")
        print(f"URL de pagamento: {charge.payment_url}")
        return charge
        
    except boostpay.error.BoostPayError as e:
        print(f"Erro ao criar cobrança: {e}")
        return None

# Criar a cobrança
charge = create_charge()`,
      webhook: `from flask import Flask, request, jsonify
import hashlib
import hmac
import json

app = Flask(__name__)

def verify_webhook_signature(payload, signature, secret):
    """Verificar a assinatura do webhook"""
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

@app.route('/webhooks/boostpay', methods=['POST'])
def handle_webhook():
    # Verificar assinatura
    signature = request.headers.get('X-BoostPay-Signature')
    payload = request.get_data(as_text=True)
    secret = 'whsec_1234567890'  # Seu webhook secret
    
    if not verify_webhook_signature(payload, signature, secret):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Processar evento
    data = request.get_json()
    event = data.get('event')
    charge_data = data.get('data', {}).get('charge', {})
    
    if event == 'charge.paid':
        print(f"Pagamento aprovado: {charge_data.get('id')}")
        # Atualizar status do pedido no seu sistema
        
    elif event == 'charge.failed':
        print(f"Pagamento falhou: {charge_data.get('id')}")
        # Notificar o cliente sobre a falha
        
    elif event == 'charge.refunded':
        print(f"Pagamento estornado: {charge_data.get('id')}")
        # Processar estorno no seu sistema
        
    else:
        print(f"Evento não reconhecido: {event}")
    
    return jsonify({'status': 'success'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)`
    },
    php: {
      createCharge: `<?php
require_once 'vendor/autoload.php';

use BoostPay\\BoostPay;
use BoostPay\\Exception\\BoostPayException;

// Configurar a chave da API
BoostPay::setApiKey('sk_live_51H123abc...');

function createCharge() {
    try {
        $charge = \\BoostPay\\Charge::create([
            'amount' => 10000, // R$ 100.00 em centavos
            'currency' => 'BRL',
            'customer_id' => 'cus_1234567890',
            'description' => 'Cobrança de teste',
            'payment_methods' => ['pix', 'credit_card', 'boleto']
        ]);
        
        echo "Cobrança criada: " . $charge->id . "\\n";
        echo "URL de pagamento: " . $charge->payment_url . "\\n";
        
        return $charge;
        
    } catch (BoostPayException $e) {
        echo "Erro ao criar cobrança: " . $e->getMessage() . "\\n";
        return null;
    }
}

// Criar a cobrança
$charge = createCharge();
?>`,
      webhook: `<?php
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $expectedSignature);
}

// Obter dados do webhook
$payload = file_get_contents('php://input');
$headers = getallheaders();
$signature = $headers['X-BoostPay-Signature'] ?? '';
$secret = 'whsec_1234567890'; // Seu webhook secret

// Verificar assinatura
if (!verifyWebhookSignature($payload, $signature, $secret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Processar evento
$data = json_decode($payload, true);
$event = $data['event'] ?? '';
$charge = $data['data']['charge'] ?? [];

switch ($event) {
    case 'charge.paid':
        error_log("Pagamento aprovado: " . $charge['id']);
        // Atualizar status do pedido no seu sistema
        break;
        
    case 'charge.failed':
        error_log("Pagamento falhou: " . $charge['id']);
        // Notificar o cliente sobre a falha
        break;
        
    case 'charge.refunded':
        error_log("Pagamento estornado: " . $charge['id']);
        // Processar estorno no seu sistema
        break;
        
    default:
        error_log("Evento não reconhecido: " . $event);
}

// Responder com sucesso
http_response_code(200);
echo json_encode(['status' => 'success']);
?>`
    }
  };

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
              <Terminal className="h-8 w-8 text-boost-primary" />
              <span>Exemplos de Código</span>
            </h1>
            <p className="text-boost-text-secondary mt-2">
              Códigos prontos para acelerar sua integração
            </p>
          </div>
        </div>

        {/* SDK Downloads */}
        <BoostCard className="bg-gradient-to-r from-boost-primary/5 to-boost-accent/5 border-boost-primary/20">
          <BoostCardHeader>
            <BoostCardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-boost-primary" />
              <span>SDKs Oficiais</span>
            </BoostCardTitle>
            <BoostCardDescription>
              Bibliotecas oficiais para acelerar o desenvolvimento
            </BoostCardDescription>
          </BoostCardHeader>
          <BoostCardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sdks.map((sdk, index) => (
                <div key={index} className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border hover:bg-boost-bg-tertiary/50 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{sdk.icon}</span>
                    <div>
                      <h3 className="font-semibold text-boost-text-primary">{sdk.name}</h3>
                      <BoostBadge variant="outline" className="text-xs">{sdk.version}</BoostBadge>
                    </div>
                  </div>
                  <p className="text-sm text-boost-text-secondary mb-4">{sdk.description}</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-boost-bg-secondary px-2 py-1 rounded flex-1 mr-2">
                      {sdk.install}
                    </code>
                    <BoostButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(sdk.install, `sdk-${index}`)}
                    >
                      {copiedCode === `sdk-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                  </div>
                </div>
              ))}
            </div>
          </BoostCardContent>
        </BoostCard>

        {/* Code Examples Tabs */}
        <Tabs defaultValue="javascript" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-boost-bg-secondary">
            <TabsTrigger value="javascript" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <span className="mr-2">🟨</span>
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="python" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <span className="mr-2">🐍</span>
              Python
            </TabsTrigger>
            <TabsTrigger value="php" className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary">
              <span className="mr-2">🐘</span>
              PHP
            </TabsTrigger>
          </TabsList>

          {/* JavaScript Examples */}
          <TabsContent value="javascript">
            <div className="space-y-6">
              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-boost-primary" />
                    <span>Criar Cobrança - JavaScript</span>
                  </BoostCardTitle>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(examples.javascript.createCharge, "js-charge")}
                    >
                      {copiedCode === "js-charge" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary pr-10">
                      {examples.javascript.createCharge}
                    </pre>
                  </div>
                </BoostCardContent>
              </BoostCard>

              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-boost-primary" />
                    <span>Webhook Handler - JavaScript</span>
                  </BoostCardTitle>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(examples.javascript.webhook, "js-webhook")}
                    >
                      {copiedCode === "js-webhook" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary pr-10 max-h-96 overflow-y-auto">
                      {examples.javascript.webhook}
                    </pre>
                  </div>
                </BoostCardContent>
              </BoostCard>
            </div>
          </TabsContent>

          {/* Python Examples */}
          <TabsContent value="python">
            <div className="space-y-6">
              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-boost-primary" />
                    <span>Criar Cobrança - Python</span>
                  </BoostCardTitle>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(examples.python.createCharge, "py-charge")}
                    >
                      {copiedCode === "py-charge" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary pr-10">
                      {examples.python.createCharge}
                    </pre>
                  </div>
                </BoostCardContent>
              </BoostCard>

              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-boost-primary" />
                    <span>Webhook Handler - Python</span>
                  </BoostCardTitle>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(examples.python.webhook, "py-webhook")}
                    >
                      {copiedCode === "py-webhook" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary pr-10 max-h-96 overflow-y-auto">
                      {examples.python.webhook}
                    </pre>
                  </div>
                </BoostCardContent>
              </BoostCard>
            </div>
          </TabsContent>

          {/* PHP Examples */}
          <TabsContent value="php">
            <div className="space-y-6">
              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-boost-primary" />
                    <span>Criar Cobrança - PHP</span>
                  </BoostCardTitle>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(examples.php.createCharge, "php-charge")}
                    >
                      {copiedCode === "php-charge" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary pr-10">
                      {examples.php.createCharge}
                    </pre>
                  </div>
                </BoostCardContent>
              </BoostCard>

              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-boost-primary" />
                    <span>Webhook Handler - PHP</span>
                  </BoostCardTitle>
                </BoostCardHeader>
                <BoostCardContent>
                  <div className="bg-boost-bg-secondary p-4 rounded-lg relative">
                    <BoostButton 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(examples.php.webhook, "php-webhook")}
                    >
                      {copiedCode === "php-webhook" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </BoostButton>
                    <pre className="text-sm text-boost-text-primary pr-10 max-h-96 overflow-y-auto">
                      {examples.php.webhook}
                    </pre>
                  </div>
                </BoostCardContent>
              </BoostCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Resources */}
        <BoostCard>
          <BoostCardHeader>
            <BoostCardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-boost-primary" />
              <span>Recursos Adicionais</span>
            </BoostCardTitle>
          </BoostCardHeader>
          <BoostCardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <BoostButton 
                variant="outline" 
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => navigate("/api-documentation")}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-boost-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Documentação</div>
                    <div className="text-sm text-boost-text-secondary">Referência completa da API</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </BoostButton>
              <BoostButton 
                variant="outline" 
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => navigate("/settings")}
              >
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-boost-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Configurar Webhooks</div>
                    <div className="text-sm text-boost-text-secondary">Receba notificações automáticas</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </BoostButton>
              <BoostButton 
                variant="outline" 
                className="flex items-center justify-between p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-boost-primary" />
                  <div className="text-left">
                    <div className="font-semibold">GitHub</div>
                    <div className="text-sm text-boost-text-secondary">Exemplos no repositório oficial</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </BoostButton>
            </div>
          </BoostCardContent>
        </BoostCard>
      </div>
    </div>
  );
};

export default CodeExamples;