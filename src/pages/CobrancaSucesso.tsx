import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Copy, Share2, ArrowLeft, ExternalLink, Smartphone, Save } from "lucide-react";
import { BoostButton } from "@/components/ui/boost-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import ClientPreview from "@/components/cobranca/ClientPreview";
import CustomizationPanel from "@/components/cobranca/CustomizationPanel";

interface CustomizationSettings {
  logo?: string;
  companyName: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  productImage?: string;
}

const CobrancaSucesso = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isCustomizationSaved, setIsCustomizationSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);
  
  const [customization, setCustomization] = useState<CustomizationSettings>({
    companyName: "Boost Pay",
    subtitle: "Pagamento Seguro",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    primaryColor: "#06b6d4",
  });

  // Obter dados da URL
  const [linkPagamento, setLinkPagamento] = useState(
    (searchParams.get("link") || `${window.location.origin}/checkout`).split('?')[0]
  );
  const valor = searchParams.get("valor") || "R$ 1.000,00";
  const descricao = searchParams.get("descricao") || "Descrição do pagamento";
  const clienteNome = searchParams.get("cliente") || "Cliente";
  
  // Carrega personalização existente ao inicializar
  useEffect(() => {
    const customId = searchParams.get('custom');
    if (customId) {
      try {
        const savedCustomization = localStorage.getItem(`payment-customization-${customId}`);
        if (savedCustomization && savedCustomization !== 'null') {
          setCustomization(JSON.parse(savedCustomization));
          setIsCustomizationSaved(true);
        }
      } catch (e) {
        console.error('Error loading customization by ID:', e);
      }
    }
    // NÃO carregar personalização padrão - cada cobrança deve ter valores limpos
  }, [searchParams]);

  // Monte o link exibido sempre com os parâmetros necessários
  useEffect(() => {
    const baseUrl = `${window.location.origin}/checkout`;
    const params = new URLSearchParams();
    params.set('valor', valor);
    params.set('descricao', descricao);
    params.set('cliente', clienteNome);
    const customId = searchParams.get('custom');
    if (customId) params.set('custom', customId);
    
    // Propagar clienteOpcao se presente
    const clienteOpcao = searchParams.get('clienteOpcao');
    if (clienteOpcao) params.set('clienteOpcao', clienteOpcao);
    
    setLinkPagamento(`${baseUrl}?${params.toString()}`);
  }, [valor, descricao, clienteNome, searchParams]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkPagamento);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link de pagamento foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link de Pagamento - Boost Pay',
          text: `Pagamento de ${valor} - ${descricao}`,
          url: linkPagamento,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomization(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomization(prev => ({
          ...prev,
          productImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomizationChange = (field: keyof CustomizationSettings, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveCustomization = () => {
    try {
      // Use existing custom ID if available, otherwise generate new one
      const existingCustomId = searchParams.get('custom');
      const customizationId = existingCustomId || Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      console.log('Saving customization with ID:', customizationId, customization);
      
      // Save customization to localStorage with unique ID
      localStorage.setItem(`payment-customization-${customizationId}`, JSON.stringify(customization));
      localStorage.setItem('payment-customization', JSON.stringify(customization)); // Keep for backward compatibility
      
      // Build a short, functional link on this app domain
      const baseUrl = `${window.location.origin}/checkout`;
      const params = new URLSearchParams();
      params.set('valor', valor);
      params.set('descricao', descricao);
      params.set('cliente', clienteNome);
      params.set('custom', customizationId);
      
      // Propagar clienteOpcao se presente
      const clienteOpcao = searchParams.get('clienteOpcao');
      if (clienteOpcao) params.set('clienteOpcao', clienteOpcao);
      
      const newLink = `${baseUrl}?${params.toString()}`;
      setLinkPagamento(newLink);
      setIsCustomizationSaved(true);
      
      // Update URL para incluir o custom ID usando navigate (only if it's a new ID)
      if (!existingCustomId) {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('custom', customizationId);
        navigate(`${window.location.pathname}?${currentParams.toString()}`, { replace: true });
      }
      
      toast({
        title: "Personalização salva!",
        description: "O link de pagamento foi atualizado com suas personalizações.",
      });
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a personalização.",
        variant: "destructive"
      });
    }
  };

  // Componentes extraídos para arquivos separados para evitar remount e perda de foco nos inputs.


  return (
    <div className="min-h-screen bg-gradient-to-br from-boost-bg-primary via-boost-bg-secondary to-boost-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <BoostButton
            variant="ghost"
            size="icon"
            onClick={() => navigate("/cobranca")}
            className="text-boost-text-secondary hover:text-boost-text-primary mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </BoostButton>
          <div>
            <h1 className="text-2xl font-bold text-boost-text-primary">Cobrança Criada</h1>
            <p className="text-boost-text-secondary">Seu link de pagamento está pronto!</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cartão de Sucesso */}
          <div className="space-y-6">
            {/* Animação de sucesso */}
            <Card className="border border-boost-border bg-boost-bg-primary animate-scale-in">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-status-success rounded-full flex items-center justify-center mb-4 animate-fade-in">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-boost-text-primary">Cobrança criada com sucesso!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-boost-bg-secondary rounded-lg p-4">
                  <h3 className="font-medium text-boost-text-primary mb-2">Detalhes da Cobrança:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-boost-text-secondary">Cliente:</span>
                      <span className="text-boost-text-primary font-medium">{clienteNome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-boost-text-secondary">Valor:</span>
                      <span className="text-boost-text-primary font-medium">{valor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-boost-text-secondary">Tipo:</span>
                      <span className="text-boost-text-primary font-medium">PIX</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Link de Pagamento */}
            <Card className="border border-boost-border bg-boost-bg-primary animate-fade-in">
              <CardHeader>
                <CardTitle className="text-boost-text-primary flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Link de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-boost-bg-secondary rounded-lg p-3 border border-boost-border">
                  <p className="text-sm text-boost-text-primary break-all font-mono">
                    {linkPagamento}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <BoostButton
                    onClick={copyToClipboard}
                    className="flex-1"
                    variant={copied ? "primary" : "outline"}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </BoostButton>
                  
                  <BoostButton
                    onClick={shareLink}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </BoostButton>
                </div>

                <div className="mt-4">
                  <BoostButton
                    onClick={() => window.open(linkPagamento, '_blank')}
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Página de Pagamento
                  </BoostButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pré-visualização */}
          <div className="space-y-6">
            <Card className="border border-boost-border bg-boost-bg-primary animate-fade-in">
              <CardHeader>
                <CardTitle className="text-boost-text-primary flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Pré-visualização do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientPreview 
                  customization={customization} 
                  valor={valor} 
                  descricao={descricao} 
                  requiresRegistration={searchParams.get('clienteOpcao') === 'solicitar'}
                  previewMode={true}
                />
              </CardContent>
            </Card>

            {/* Personalização */}
            <Card className="border border-boost-border bg-boost-bg-primary animate-fade-in">
              <CardHeader>
                <CardTitle className="text-boost-text-primary">
                  Personalização White Label
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomizationPanel
                  customization={customization}
                  handleCustomizationChange={handleCustomizationChange}
                  logoInputRef={logoInputRef}
                  productImageRef={productImageRef}
                  handleLogoUpload={handleLogoUpload}
                  handleProductImageUpload={handleProductImageUpload}
                />
                
                <div className="mt-6 pt-4 border-t border-boost-border">
                  <BoostButton
                    onClick={saveCustomization}
                    className="w-full"
                    size="lg"
                    variant={isCustomizationSaved ? "success" : "primary"}
                  >
                    {isCustomizationSaved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Personalização Salva
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Personalização
                      </>
                    )}
                  </BoostButton>
                  {isCustomizationSaved && (
                    <p className="text-sm text-boost-text-secondary text-center mt-2">
                      O link foi atualizado com suas personalizações!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="space-y-3">
              <BoostButton
                onClick={() => navigate("/cobranca")}
                className="w-full"
                size="lg"
              >
                Criar Nova Cobrança
              </BoostButton>
              
              <BoostButton
                onClick={() => navigate("/transactions")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Ver Transações
              </BoostButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CobrancaSucesso;