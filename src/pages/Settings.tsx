import { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  Plug, 
  Shield, 
  Bell,
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  FileText,
  Globe,
  Mail,
  Smartphone,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Key,
  HelpCircle,
  Info,
  Lock,
  AlertTriangle,
  TestTube,
  Play,
  Terminal,
  Book,
  ExternalLink,
  MessageCircle,
  Code,
  Zap,
  Users,
  Edit,
  UserCheck,
  UserX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { BoostBadge } from "@/components/ui/boost-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Company form states
  const [companyName, setCompanyName] = useState("Boost Pay Brasil");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [tradingName, setTradingName] = useState("Boost Pay");
  const [address, setAddress] = useState("Rua das Flores, 123");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [zipCode, setZipCode] = useState("01234-567");
  const [phone, setPhone] = useState("(11) 9999-9999");
  const [email, setEmail] = useState("contato@boostpay.com.br");

  // Payment settings states
  const [pixEnabled, setPixEnabled] = useState(true);
  const [creditCardEnabled, setCreditCardEnabled] = useState(true);
  const [cardReceiptTerm, setCardReceiptTerm] = useState("30_days");

  // Integration states
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Loading states
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // User management states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState([
    {
      id: "1",
      name: "João Silva",
      email: "joao@boostpay.com.br",
      role: "master",
      status: "active",
      createdAt: "2024-01-15",
      permissions: ["dashboard", "transactions", "clients", "cobranca", "produtos", "split", "disputes", "financial", "settings"]
    },
    {
      id: "2", 
      name: "Maria Santos",
      email: "maria@boostpay.com.br",
      role: "admin",
      status: "active",
      createdAt: "2024-02-20",
      permissions: ["dashboard", "transactions", "clients", "cobranca", "produtos", "split", "disputes", "financial"]
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@boostpay.com.br", 
      role: "operator",
      status: "active",
      createdAt: "2024-03-10",
      permissions: ["dashboard", "transactions", "clients", "cobranca"]
    }
  ]);

  // Available screens for permission control
  const availableScreens = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "transactions", name: "Transações", icon: "💳" },
    { id: "clients", name: "Clientes", icon: "👥" },
    { id: "cobranca", name: "Cobranças", icon: "💰" },
    { id: "produtos", name: "Produtos", icon: "📦" },
    { id: "split", name: "Split", icon: "🔀" },
    { id: "disputes", name: "Disputas", icon: "⚠️" },
    { id: "financial", name: "Financeiro", icon: "📈" },
    { id: "settings", name: "Configurações", icon: "⚙️" }
  ];

  const roleLabels: Record<string, { label: string; color: string }> = {
    master: { label: "Master", color: "bg-purple-500" },
    admin: { label: "Administrador", color: "bg-blue-500" },
    operator: { label: "Operador", color: "bg-green-500" },
    viewer: { label: "Visualizador", color: "bg-gray-500" }
  };

  // Mock data
  const apiKeys = {
    publishable: "pk_live_51H123abc45def678ghi90jkl12mno34pqr567stu89vwx",
    secret: "sk_test_51H123abc45def678ghi90jkl12mno34pqr567stu89vwx"
  };

  // Account status data
  const accountStatus = {
    documentation: { status: 'approved', label: 'Documentação Aprovada' },
    bankAccount: { status: 'pending', label: 'Conta Bancária Pendente' },
    activation: { status: 'active', label: 'Conta Ativada' }
  };

  const getOverallStatus = () => {
    const statuses = Object.values(accountStatus);
    if (statuses.every(s => s.status === 'approved' || s.status === 'active')) {
      return { status: 'active', label: 'Totalmente Ativada', color: 'text-status-success' };
    } else if (statuses.some(s => s.status === 'rejected' || s.status === 'blocked')) {
      return { status: 'blocked', label: 'Bloqueada', color: 'text-status-error' };
    }
    return { status: 'pending', label: 'Ativação Pendente', color: 'text-status-warning' };
  };

  const webhooks = [
    {
      id: "wh_1234567890",
      url: "https://api.minhaloja.com/webhooks/payments",
      events: ["charge.paid", "charge.refunded"],
      status: "active"
    },
    {
      id: "wh_0987654321",
      url: "https://sistema.vendas.com/boost-webhook",
      events: ["charge.paid", "charge.refunded"],
      status: "inactive"
    }
  ];

  // Função para calcular a taxa do cartão de crédito baseada no prazo
  const getCreditCardFee = () => {
    return cardReceiptTerm === "antecipado" ? "4,99%" : "2,99%";
  };

  const paymentMethods = [
    { id: "pix", name: "PIX", enabled: pixEnabled, fee: "0,99%" },
    { id: "credit", name: "Cartão de Crédito", enabled: creditCardEnabled, fee: getCreditCardFee() },
    { id: "boleto", name: "Boleto Bancário", enabled: true, fee: "R$ 3,90" }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copiado!",
      description: "Texto copiado para a área de transferência"
    });
  };

  // Save handlers with loading states and feedback
  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "✅ Alterações Salvas!",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSavePayments = async () => {
    setIsSavingPayments(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "✅ Configurações Salvas!",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingPayments(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    
    try {
      // Simulate API call  
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "✅ Preferências Salvas!",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as preferências. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-boost-text-primary mb-2">
          Configurações da Plataforma
        </h1>
        <p className="text-boost-text-secondary">
          Configure sua conta empresarial, métodos de pagamento, integrações e segurança.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-boost-bg-secondary">
          <TabsTrigger 
            value="company"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="integrations"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Plug className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          {/* Info Alert */}
          <div className="bg-boost-bg-tertiary/30 border border-boost-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-boost-accent mt-0.5" />
              <div>
                <h4 className="font-semibold text-boost-text-primary mb-1">
                  Dados Bloqueados para Edição
                </h4>
                <p className="text-sm text-boost-text-secondary">
                  Estas informações foram preenchidas automaticamente durante o processo de ativação da conta. 
                  Para solicitar alterações, entre em contato através do botão abaixo.
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle className="flex items-center justify-between">
                Informações da Empresa
                <BoostBadge variant="success">Verificado</BoostBadge>
              </BoostCardTitle>
              <BoostCardDescription>
                Dados cadastrais da sua empresa registrados na plataforma.
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Razão Social</Label>
                  <BoostInput 
                    id="company-name"
                    value={companyName}
                    disabled
                    className="opacity-75 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <BoostInput 
                    id="cnpj"
                    value={cnpj}
                    disabled
                    className="opacity-75 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trading-name">Nome Fantasia</Label>
                  <BoostInput 
                    id="trading-name"
                    value={tradingName}
                    disabled
                    className="opacity-75 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <BoostInput 
                    id="phone"
                    value={phone}
                    disabled
                    className="opacity-75 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">E-mail Corporativo</Label>
                  <BoostInput 
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="opacity-75 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-t border-boost-border pt-6">
                <h3 className="text-lg font-semibold text-boost-text-primary mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <BoostInput 
                      id="address"
                      value={address}
                      disabled
                      className="opacity-75 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip-code">CEP</Label>
                    <BoostInput 
                      id="zip-code"
                      value={zipCode}
                      disabled
                      className="opacity-75 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <BoostInput 
                      id="city"
                      value={city}
                      disabled
                      className="opacity-75 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select value={state} disabled>
                      <SelectTrigger className="opacity-75 cursor-not-allowed">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <BoostButton 
                  onClick={() => window.open('mailto:suporte@boostpay.com.br?subject=Solicitação de Alteração de Dados Cadastrais&body=Olá,%0A%0AGostaria de solicitar a alteração dos seguintes dados cadastrais:%0A%0A- Campo a alterar:%0A- Valor atual:%0A- Novo valor:%0A- Justificativa:%0A%0AObrigado!')}
                  className="min-w-[200px]"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Solicitar Alteração
                </BoostButton>
              </div>
            </BoostCardContent>
          </BoostCard>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Settings */}
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle>Configurações de Recebimento</BoostCardTitle>
              <BoostCardDescription>
                Defina as configurações avançadas para recebimento de pagamentos.
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Prazo para Recebimento - Cartão de Crédito</Label>
                <Select value={cardReceiptTerm} onValueChange={setCardReceiptTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecipado">Antecipado (Taxa: 4,99%)</SelectItem>
                    <SelectItem value="30_days">30 dias (Taxa: 2,99%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-boost-text-muted">
                  {cardReceiptTerm === "antecipado" 
                    ? "Receba na hora com taxa maior" 
                    : "Receba em 30 dias com taxa menor"
                  }
                </p>
              </div>

              <div className="flex justify-end">
                <BoostButton 
                  onClick={handleSavePayments}
                  disabled={isSavingPayments}
                  className="min-w-[170px] transition-all duration-200"
                >
                  {isSavingPayments ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Configurações"
                  )}
                </BoostButton>
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* Payment Methods */}
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle>Métodos de recebimento</BoostCardTitle>
              <BoostCardDescription>
                Configure quais métodos de pagamento aceitar e suas taxas.
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent className="space-y-6">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-boost-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-boost-accent/10 rounded-full flex items-center justify-center">
                      {method.id === "pix" && <Zap className="h-5 w-5 text-boost-accent" />}
                      {method.id === "credit" && <CreditCard className="h-5 w-5 text-boost-accent" />}
                      {method.id === "boleto" && <FileText className="h-5 w-5 text-boost-accent" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-boost-text-primary">{method.name}</h3>
                      <p className="text-sm text-boost-text-secondary">Taxa: {method.fee}</p>
                    </div>
                  </div>
                </div>
              ))}
            </BoostCardContent>
          </BoostCard>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Integration Guide Header */}
          <BoostCard className="bg-gradient-to-r from-boost-primary/5 to-boost-accent/5 border-boost-primary/20">
            <BoostCardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-boost-primary/10 rounded-lg">
                    <Plug className="h-6 w-6 text-boost-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-boost-text-primary mb-2">
                      Central de Integrações
                    </h2>
                    <p className="text-boost-text-secondary mb-4 max-w-2xl">
                      Configure suas chaves de API e webhooks para integrar o Boost Pay ao seu sistema. 
                      Siga nosso guia passo a passo para uma integração rápida e segura.
                    </p>
                    <div className="flex items-center space-x-4">
                      <BoostButton 
                        variant="primary" 
                        className="flex items-center space-x-2"
                        onClick={() => navigate("/api-documentation")}
                      >
                        <Book className="h-4 w-4" />
                        <span>Documentação da API</span>
                        <ExternalLink className="h-3 w-3" />
                      </BoostButton>
                      <BoostButton 
                        variant="secondary" 
                        className="flex items-center space-x-2"
                        onClick={() => navigate("/code-examples")}
                      >
                        <Code className="h-4 w-4" />
                        <span>Exemplos de Código</span>
                        <ExternalLink className="h-3 w-3" />
                      </BoostButton>
                      <BoostButton 
                        variant="outline" 
                        className="flex items-center space-x-2"
                        onClick={() => window.open('mailto:suporte-tecnico@boostpay.com.br?subject=Suporte Técnico - Integração API')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Suporte Técnico</span>
                      </BoostButton>
                    </div>
                  </div>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* Integration Steps Guide */}
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-boost-primary" />
                <span>Guia de Integração Rápida</span>
              </BoostCardTitle>
              <BoostCardDescription>
                Siga estes 3 passos simples para integrar o Boost Pay ao seu sistema
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start space-x-3 p-4 bg-boost-bg-tertiary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-boost-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-boost-text-primary mb-1">Configure suas Chaves</h3>
                    <p className="text-sm text-boost-text-secondary">
                      Copie suas chaves de API abaixo e configure no seu sistema
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-boost-bg-tertiary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-boost-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-boost-text-primary mb-1">Configure Webhooks</h3>
                    <p className="text-sm text-boost-text-secondary">
                      Adicione endpoints para receber notificações em tempo real
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-boost-bg-tertiary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-boost-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-boost-text-primary mb-1">Teste a Integração</h3>
                    <p className="text-sm text-boost-text-secondary">
                      Use nosso ambiente de teste para validar a integração
                    </p>
                  </div>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* API Keys */}
          <BoostCard>
            <BoostCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-boost-primary" />
                    <span>Chaves de API</span>
                  </BoostCardTitle>
                  <BoostCardDescription>
                    Suas credenciais para autenticação na API do Boost Pay
                  </BoostCardDescription>
                </div>
                <BoostButton variant="outline" size="sm" className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Como usar?</span>
                </BoostButton>
              </div>
            </BoostCardHeader>
            <BoostCardContent className="space-y-6">
              {/* Publishable Key */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-boost-text-primary text-base font-semibold flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-boost-primary" />
                      <span>Chave Pública (Publishable Key)</span>
                    </Label>
                    <p className="text-sm text-boost-text-muted mt-1">
                      Para uso no frontend - é seguro expor publicamente
                    </p>
                  </div>
                  <BoostBadge variant="success" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Ativa</span>
                  </BoostBadge>
                </div>
                
                <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="h-4 w-4 text-boost-primary" />
                    <p className="text-sm font-medium text-boost-text-primary">Como usar esta chave:</p>
                  </div>
                  <ul className="text-sm text-boost-text-secondary space-y-1 mb-3">
                    <li>• Configure no seu frontend/aplicativo</li>
                    <li>• Use para criar tokens de pagamento</li>
                    <li>• Seguro para repositórios públicos</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <BoostInput 
                    value={apiKeys.publishable} 
                    readOnly 
                    className="font-mono text-sm bg-boost-bg-tertiary/50"
                  />
                  <BoostButton 
                    variant="secondary" 
                    size="icon"
                    onClick={() => copyToClipboard(apiKeys.publishable)}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </BoostButton>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-boost-text-primary text-base font-semibold flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-status-error" />
                      <span>Chave Secreta (Secret Key)</span>
                    </Label>
                    <p className="text-sm text-boost-text-muted mt-1">
                      Apenas para backend - mantenha em segredo absoluto
                    </p>
                  </div>
                  <BoostBadge variant="error" className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Confidencial</span>
                  </BoostBadge>
                </div>

                <div className="p-4 bg-status-warning/10 border border-status-warning/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-status-warning" />
                    <p className="text-sm font-semibold text-status-warning">Segurança Crítica</p>
                  </div>
                  <ul className="text-sm text-boost-text-muted space-y-1">
                    <li>• <strong>NUNCA</strong> exponha no frontend ou código público</li>
                    <li>• Use apenas em servidores backend seguros</li>
                    <li>• Permite criar e gerenciar pagamentos</li>
                    <li>• Renove imediatamente se comprometida</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <BoostInput 
                    value={showSecretKey ? apiKeys.secret : "sk_test_••••••••••••••••••••••••••••"}
                    readOnly 
                    className="font-mono text-sm bg-boost-bg-tertiary/50"
                  />
                  <BoostButton 
                    variant="secondary" 
                    size="icon"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="flex-shrink-0"
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </BoostButton>
                  <BoostButton 
                    variant="secondary" 
                    size="icon"
                    onClick={() => copyToClipboard(apiKeys.secret)}
                    disabled={!showSecretKey}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </BoostButton>
                </div>
              </div>

              {/* Key Management */}
              <div className="pt-6 border-t border-boost-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-boost-text-primary flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 text-boost-primary" />
                      <span>Gerenciar Chaves</span>
                    </h3>
                    <p className="text-sm text-boost-text-secondary mt-1">
                      Gere novas chaves ou revogue chaves antigas por segurança
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <BoostButton variant="destructive" className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4" />
                          <span>Renovar Chaves</span>
                        </BoostButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-boost-bg-secondary border-boost-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-boost-text-primary">
                            Renovar Chaves de API
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-boost-text-secondary">
                            Esta ação irá gerar novas chaves e revogar as antigas. 
                            Você precisará atualizar todas as suas integrações. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-boost-bg-tertiary border-boost-border text-boost-text-primary">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                            Renovar Chaves
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* Webhooks */}
          <BoostCard>
            <BoostCardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <BoostCardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-boost-primary" />
                    <span>Webhooks</span>
                  </BoostCardTitle>
                  <BoostCardDescription>
                    Receba notificações automáticas de eventos em tempo real
                  </BoostCardDescription>
                </div>
                <div className="flex space-x-2">
                  <BoostButton variant="outline" size="sm" className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Guia Webhooks</span>
                  </BoostButton>
                  <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
                    <DialogTrigger asChild>
                      <BoostButton className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Novo Webhook</span>
                      </BoostButton>
                    </DialogTrigger>
                    <DialogContent className="bg-boost-bg-secondary border-boost-border max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-boost-text-primary">Configurar Webhook</DialogTitle>
                        <DialogDescription className="text-boost-text-secondary">
                          Adicione um endpoint para receber notificações de eventos automaticamente
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-boost-text-secondary">URL do Endpoint</Label>
                          <BoostInput placeholder="https://sua-api.com/webhooks/boost-pay" />
                          <p className="text-xs text-boost-text-muted">
                            Esta URL receberá as notificações via POST
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-boost-text-secondary">Eventos para Notificar</Label>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-boost-bg-tertiary/30 rounded-lg">
                              <Checkbox id="charge-paid" className="mt-0.5" />
                              <div>
                                <Label htmlFor="charge-paid" className="text-boost-text-primary font-medium">
                                  charge.paid
                                </Label>
                                <p className="text-xs text-boost-text-muted">
                                  Pagamento aprovado com sucesso
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-boost-bg-tertiary/30 rounded-lg">
                              <Checkbox id="charge-failed" className="mt-0.5" />
                              <div>
                                <Label htmlFor="charge-failed" className="text-boost-text-primary font-medium">
                                  charge.failed
                                </Label>
                                <p className="text-xs text-boost-text-muted">
                                  Pagamento negado ou falhado
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-boost-bg-tertiary/30 rounded-lg">
                              <Checkbox id="charge-refunded" className="mt-0.5" />
                              <div>
                                <Label htmlFor="charge-refunded" className="text-boost-text-primary font-medium">
                                  charge.refunded
                                </Label>
                                <p className="text-xs text-boost-text-muted">
                                  Pagamento estornado/reembolsado
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <BoostButton variant="secondary" onClick={() => setShowWebhookDialog(false)}>
                          Cancelar
                        </BoostButton>
                        <BoostButton onClick={() => setShowWebhookDialog(false)}>
                          Criar Webhook
                        </BoostButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </BoostCardHeader>
            <BoostCardContent>
              {/* Webhook Info */}
              <div className="p-4 bg-boost-bg-tertiary/20 rounded-lg border border-boost-border mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-boost-primary" />
                  <p className="text-sm font-medium text-boost-text-primary">Como funcionam os Webhooks:</p>
                </div>
                <ul className="text-sm text-boost-text-secondary space-y-1">
                  <li>• Receba notificações imediatas quando eventos ocorrerem</li>
                  <li>• Mantenha seu sistema sincronizado automaticamente</li>
                  <li>• Ideal para atualizar status de pedidos e enviar confirmações</li>
                </ul>
              </div>

              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-boost-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-boost-text-primary mb-2">
                      Nenhum webhook configurado
                    </h3>
                    <p className="text-boost-text-secondary mb-4">
                      Configure seu primeiro webhook para receber notificações automáticas
                    </p>
                    <BoostButton onClick={() => setShowWebhookDialog(true)} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Criar Primeiro Webhook</span>
                    </BoostButton>
                  </div>
                ) : (
                  webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border hover:bg-boost-bg-tertiary/50 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-medium text-boost-text-primary">{webhook.url}</p>
                          <BoostBadge variant={webhook.status === "active" ? "success" : "outline"} className="flex items-center space-x-1">
                            {webhook.status === "active" ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            <span>{webhook.status === "active" ? "Ativo" : "Inativo"}</span>
                          </BoostBadge>
                        </div>
                        <p className="text-sm text-boost-text-secondary">
                          Eventos: {webhook.events.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BoostButton variant="ghost" size="sm" className="flex items-center space-x-1">
                          <SettingsIcon className="h-4 w-4" />
                          <span>Editar</span>
                        </BoostButton>
                        <BoostButton variant="ghost" size="icon" className="text-status-error hover:text-status-error">
                          <Trash2 className="h-4 w-4" />
                        </BoostButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* Integration Support & Testing */}
          <BoostCard className="bg-gradient-to-r from-boost-accent/5 to-boost-primary/5 border-boost-accent/20">
            <BoostCardHeader>
              <BoostCardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-boost-primary" />
                <span>Precisa de Ajuda com a Integração?</span>
              </BoostCardTitle>
              <BoostCardDescription>
                Nossa equipe técnica está pronta para ajudar você em cada passo da integração
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="space-y-6">
                {/* Help Options */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border text-center">
                    <div className="p-3 bg-boost-primary/10 rounded-lg w-fit mx-auto mb-3">
                      <Mail className="h-6 w-6 text-boost-primary" />
                    </div>
                    <h3 className="font-semibold text-boost-text-primary mb-2">Suporte Técnico</h3>
                    <p className="text-sm text-boost-text-secondary mb-4">
                      Entre em contato para ajuda personalizada com sua integração
                    </p>
                    <BoostButton 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open('mailto:suporte-tecnico@boostpay.com.br?subject=Ajuda com Integração - Testes e Validação&body=Olá, preciso de ajuda com:%0A%0A- Teste de webhooks%0A- Validação da integração%0A- Outros: ')}
                    >
                      Contatar Suporte
                    </BoostButton>
                  </div>

                  <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border text-center">
                    <div className="p-3 bg-boost-primary/10 rounded-lg w-fit mx-auto mb-3">
                      <Book className="h-6 w-6 text-boost-primary" />
                    </div>
                    <h3 className="font-semibold text-boost-text-primary mb-2">Documentação</h3>
                    <p className="text-sm text-boost-text-secondary mb-4">
                      Consulte nossa documentação completa com exemplos práticos
                    </p>
                    <BoostButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate("/api-documentation")}
                    >
                      Ver Documentação
                    </BoostButton>
                  </div>

                  <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border text-center">
                    <div className="p-3 bg-boost-primary/10 rounded-lg w-fit mx-auto mb-3">
                      <Code className="h-6 w-6 text-boost-primary" />
                    </div>
                    <h3 className="font-semibold text-boost-text-primary mb-2">Exemplos de Código</h3>
                    <p className="text-sm text-boost-text-secondary mb-4">
                      Códigos prontos para acelerar sua implementação
                    </p>
                    <BoostButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate("/code-examples")}
                    >
                      Ver Exemplos
                    </BoostButton>
                  </div>
                </div>

                {/* Quick Testing Guide */}
                <div className="p-6 bg-boost-bg-tertiary/20 rounded-lg border border-boost-border">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-boost-primary/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-boost-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-boost-text-primary mb-3">
                        Como Testar Sua Integração
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                          <div>
                            <p className="font-medium text-boost-text-primary">Configure suas chaves de API</p>
                            <p className="text-sm text-boost-text-secondary">Use as chaves acima em seu ambiente de desenvolvimento</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                          <div>
                            <p className="font-medium text-boost-text-primary">Crie uma cobrança de teste</p>
                            <p className="text-sm text-boost-text-secondary">Use valores baixos (ex: R$ 1,00) para seus primeiros testes</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                          <div>
                            <p className="font-medium text-boost-text-primary">Monitore os webhooks</p>
                            <p className="text-sm text-boost-text-secondary">Configure um endpoint de teste e verifique se recebe os eventos</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-boost-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                          <div>
                            <p className="font-medium text-boost-text-primary">Entre em contato conosco</p>
                            <p className="text-sm text-boost-text-secondary">Nossa equipe pode ajudar a validar sua integração e esclarecer dúvidas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="text-center p-4 bg-boost-primary/5 rounded-lg border border-boost-primary/20">
                  <p className="text-boost-text-secondary mb-3">
                    <strong className="text-boost-text-primary">Dúvidas ou problemas?</strong> Nossa equipe técnica responde em até 24 horas.
                  </p>
                  <BoostButton 
                    variant="primary"
                    onClick={() => window.open('mailto:suporte-tecnico@boostpay.com.br?subject=Dúvida sobre Integração&body=Olá,%0A%0AEstou com dúvidas sobre:%0A%0A(Descreva sua dúvida aqui)%0A%0AObrigado!')}
                    className="flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Falar com Suporte Técnico</span>
                  </BoostButton>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle>Preferências de Notificação</BoostCardTitle>
              <BoostCardDescription>
                Configure como você deseja receber alertas sobre transações e eventos importantes.
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border border-boost-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-boost-accent/10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-boost-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-boost-text-primary">Notificações por E-mail</h3>
                    <p className="text-sm text-boost-text-secondary">
                      Receba alertas sobre transações, disputas e atualizações da conta
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                  <span className="text-sm text-boost-text-secondary">
                    {emailNotifications ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 border border-boost-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-boost-accent/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-boost-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-boost-text-primary">Notificações por SMS</h3>
                    <p className="text-sm text-boost-text-secondary">
                      Receba alertas críticos por mensagem de texto (disputas e falhas)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch 
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                  <span className="text-sm text-boost-text-secondary">
                    {smsNotifications ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              {/* Notification Summary */}
              <div className="bg-boost-bg-tertiary/30 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Bell className="h-5 w-5 text-boost-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-boost-text-primary">Eventos Monitorados</h4>
                    <ul className="text-sm text-boost-text-secondary mt-2 space-y-1">
                      <li>• Transações aprovadas e negadas</li>
                      <li>• Disputas e chargebacks</li>
                      <li>• Atualizações de conta e segurança</li>
                      <li>• Relatórios semanais de performance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <BoostButton 
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifications}
                  className="min-w-[170px] transition-all duration-200"
                >
                  {isSavingNotifications ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Preferências"
                  )}
                </BoostButton>
              </div>
            </BoostCardContent>
          </BoostCard>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle>Segurança da Conta</BoostCardTitle>
              <BoostCardDescription>
                Configure opções adicionais de segurança para proteger sua conta.
              </BoostCardDescription>
            </BoostCardHeader>
            <BoostCardContent className="space-y-6">
              {/* Two Factor Authentication */}
              <div className="flex items-center justify-between p-4 border border-boost-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-boost-accent/10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-boost-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-boost-text-primary">Autenticação de Dois Fatores (2FA)</h3>
                    <p className="text-sm text-boost-text-secondary">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch 
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                  <span className="text-sm text-boost-text-secondary">
                    {twoFactorEnabled ? "Habilitado" : "Desabilitado"}
                  </span>
                </div>
              </div>

              {/* Login History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-boost-text-primary">Histórico de Acesso</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-boost-bg-tertiary/30 rounded-lg">
                    <div>
                      <p className="font-medium text-boost-text-primary">São Paulo, SP - Brasil</p>
                      <p className="text-sm text-boost-text-secondary">Chrome 91.0 • 15/01/2024 às 14:30</p>
                    </div>
                    <BoostBadge variant="success">Atual</BoostBadge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-boost-bg-tertiary/30 rounded-lg">
                    <div>
                      <p className="font-medium text-boost-text-primary">Rio de Janeiro, RJ - Brasil</p>
                      <p className="text-sm text-boost-text-secondary">Safari 14.1 • 14/01/2024 às 09:15</p>
                    </div>
                    <BoostBadge variant="outline">Anterior</BoostBadge>
                  </div>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          {/* Users List */}
          <BoostCard>
            <BoostCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <BoostCardTitle>Gerenciamento de Usuários</BoostCardTitle>
                  <BoostCardDescription>
                    Controle o acesso e permissões dos usuários da plataforma
                  </BoostCardDescription>
                </div>
                <BoostButton onClick={() => { setEditingUser(null); setShowUserDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </BoostButton>
              </div>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border hover:bg-boost-bg-tertiary/50 transition-all">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-boost-accent/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-boost-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-boost-text-primary">{user.name}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full text-white ${roleLabels[user.role].color}`}>
                            {roleLabels[user.role].label}
                          </span>
                          {user.status === 'active' ? (
                            <BoostBadge variant="success" className="flex items-center space-x-1">
                              <UserCheck className="h-3 w-3" />
                              <span>Ativo</span>
                            </BoostBadge>
                          ) : (
                            <BoostBadge variant="error" className="flex items-center space-x-1">
                              <UserX className="h-3 w-3" />
                              <span>Inativo</span>
                            </BoostBadge>
                          )}
                        </div>
                        <p className="text-sm text-boost-text-secondary">{user.email}</p>
                        <p className="text-xs text-boost-text-muted mt-1">
                          Cadastrado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.permissions.slice(0, 4).map((perm) => {
                            const screen = availableScreens.find(s => s.id === perm);
                            return screen ? (
                              <span key={perm} className="text-xs px-2 py-0.5 bg-boost-accent/10 text-boost-text-secondary rounded">
                                {screen.icon} {screen.name}
                              </span>
                            ) : null;
                          })}
                          {user.permissions.length > 4 && (
                            <span className="text-xs px-2 py-0.5 bg-boost-accent/10 text-boost-text-secondary rounded">
                              +{user.permissions.length - 4} mais
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BoostButton 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setEditingUser(user); setShowUserDialog(true); }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </BoostButton>
                      {user.role !== 'master' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <BoostButton variant="ghost" size="icon" className="text-status-error hover:text-status-error">
                              <Trash2 className="h-4 w-4" />
                            </BoostButton>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o usuário {user.name}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setUsers(users.filter(u => u.id !== user.id));
                                  toast({
                                    title: "✅ Usuário Removido",
                                    description: `${user.name} foi removido com sucesso.`
                                  });
                                }}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* User Info Card */}
          <BoostCard className="bg-gradient-to-r from-boost-accent/5 to-boost-primary/5 border-boost-accent/20">
            <BoostCardHeader>
              <BoostCardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-boost-primary" />
                <span>Níveis de Acesso</span>
              </BoostCardTitle>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full text-white bg-purple-500">Master</span>
                    <h4 className="font-semibold text-boost-text-primary">Acesso Total</h4>
                  </div>
                  <p className="text-sm text-boost-text-secondary">
                    Controle completo da plataforma, incluindo gerenciamento de usuários e configurações críticas.
                  </p>
                </div>
                <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full text-white bg-blue-500">Administrador</span>
                    <h4 className="font-semibold text-boost-text-primary">Acesso Administrativo</h4>
                  </div>
                  <p className="text-sm text-boost-text-secondary">
                    Acesso a todas funcionalidades exceto gerenciamento de usuários e configurações críticas.
                  </p>
                </div>
                <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full text-white bg-green-500">Operador</span>
                    <h4 className="font-semibold text-boost-text-primary">Acesso Operacional</h4>
                  </div>
                  <p className="text-sm text-boost-text-secondary">
                    Acesso limitado a operações do dia a dia como transações, clientes e cobranças.
                  </p>
                </div>
                <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full text-white bg-gray-500">Visualizador</span>
                    <h4 className="font-semibold text-boost-text-primary">Apenas Visualização</h4>
                  </div>
                  <p className="text-sm text-boost-text-secondary">
                    Acesso somente leitura aos dados e relatórios, sem permissão para modificações.
                  </p>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* User Dialog */}
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? 'Atualize as informações e permissões do usuário'
                    : 'Preencha os dados do novo usuário e defina suas permissões'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-boost-text-primary">Informações Básicas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Nome Completo</Label>
                      <BoostInput 
                        id="user-name"
                        placeholder="João Silva"
                        defaultValue={editingUser?.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">E-mail</Label>
                      <BoostInput 
                        id="user-email"
                        type="email"
                        placeholder="joao@empresa.com.br"
                        defaultValue={editingUser?.email}
                      />
                    </div>
                  </div>
                  
                  {!editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Senha Temporária</Label>
                      <BoostInput 
                        id="user-password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <p className="text-xs text-boost-text-muted">
                        O usuário deverá alterar a senha no primeiro acesso
                      </p>
                    </div>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-boost-text-primary">Nível de Acesso</h3>
                  <Select defaultValue={editingUser?.role || "operator"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="master">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-purple-500">Master</span>
                          <span>Acesso Total</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-blue-500">Admin</span>
                          <span>Administrador</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="operator">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-green-500">Operador</span>
                          <span>Operador</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-gray-500">Viewer</span>
                          <span>Visualizador</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-boost-text-primary">Permissões de Acesso às Telas</h3>
                  <p className="text-xs text-boost-text-muted">
                    Selecione quais telas este usuário poderá acessar
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {availableScreens.map((screen) => (
                      <div key={screen.id} className="flex items-center space-x-3 p-3 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                        <Checkbox 
                          id={`screen-${screen.id}`}
                          defaultChecked={editingUser ? editingUser.permissions.includes(screen.id) : false}
                        />
                        <Label 
                          htmlFor={`screen-${screen.id}`}
                          className="text-boost-text-primary font-normal cursor-pointer flex items-center space-x-2"
                        >
                          <span>{screen.icon}</span>
                          <span>{screen.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-boost-text-primary">Status da Conta</h3>
                  <div className="flex items-center space-x-3 p-4 bg-boost-bg-tertiary/30 rounded-lg border border-boost-border">
                    <Switch defaultChecked={editingUser ? editingUser.status === 'active' : true} />
                    <div>
                      <Label className="text-boost-text-primary">Conta Ativa</Label>
                      <p className="text-xs text-boost-text-muted">
                        Desative para bloquear o acesso temporariamente
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <BoostButton variant="secondary" onClick={() => setShowUserDialog(false)}>
                  Cancelar
                </BoostButton>
                <BoostButton onClick={() => {
                  setShowUserDialog(false);
                  toast({
                    title: editingUser ? "✅ Usuário Atualizado" : "✅ Usuário Criado",
                    description: editingUser 
                      ? "As informações do usuário foram atualizadas com sucesso."
                      : "Novo usuário criado. Um e-mail com instruções foi enviado."
                  });
                }}>
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </BoostButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;