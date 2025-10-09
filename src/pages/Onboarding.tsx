import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BoostInput } from "@/components/ui/boost-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Building2, 
  MapPin, 
  Upload, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AccountType = "juridica" | "fisica";

interface OnboardingData {
  accountType: AccountType;
  // Dados da conta
  cnpj?: string;
  cpfRepresentante?: string;
  dataNascimentoRepresentante?: string;
  celularRepresentante?: string;
  cpf?: string;
  dataNascimento?: string;
  celular?: string;
  // Dados do negócio
  nomeEmpresa: string;
  nomeFantasia?: string;
  segmento: string;
  website?: string;
  descricaoAtividade: string;
  // Endereço
  cep: string;
  estado: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  // Dados de acesso
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitaTermos: boolean;
  // Documentos
  contratoSocial?: File;
  rgRepresentante?: File;
  cpfDocumento?: File;
  comprovanteEndereco?: File;
}

const steps = [
  { id: 1, title: "Dados da conta", icon: User },
  { id: 2, title: "Dados do negócio", icon: Building2 },
  { id: 3, title: "Endereço", icon: MapPin },
  { id: 4, title: "Carregar documentos", icon: Upload },
  { id: 5, title: "Confirmação", icon: CheckCircle },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    accountType: undefined as any,
    nomeEmpresa: "",
    segmento: "",
    descricaoAtividade: "",
    cep: "",
    estado: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Simular loading inicial para evitar tela branca
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Verificar se há um parâmetro de etapa na URL
      const stepParam = searchParams.get('step');
      if (stepParam) {
        const stepNumber = parseInt(stepParam, 10);
        if (stepNumber >= 1 && stepNumber <= 5) {
          setCurrentStep(stepNumber);
          
          // Marcar que o onboarding foi iniciado
          localStorage.setItem('onboardingStarted', 'true');
          
          // Se chegou diretamente na etapa 4 (documentos), simular dados da conta
          if (stepNumber === 4) {
            // Verificar se já existem dados pessoais salvos
            const savedPersonalInfo = localStorage.getItem('personalInfo');
            if (savedPersonalInfo) {
              // Usuário com dados existentes - carregar dados salvos
              const personalData = JSON.parse(savedPersonalInfo);
              setData(prev => ({ ...prev, ...personalData }));
            } else {
              // Usuário novo direto para documentos - simular dados básicos
              setData(prev => ({
                ...prev,
                accountType: "juridica",
                nomeEmpresa: "Empresa Exemplo Ltda",
                segmento: "tecnologia",
                descricaoAtividade: "Desenvolvimento de software",
                cep: "01234-567",
                estado: "SP",
                logradouro: "Rua Exemplo",
                numero: "123",
                bairro: "Centro",
                cidade: "São Paulo",
                email: "usuario@exemplo.com"
              }));
            }
          }
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    // Salvar dados pessoais ao avançar das etapas iniciais
    if (currentStep <= 3) {
      localStorage.setItem('personalInfo', JSON.stringify(data));
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBackToStart = () => {
    // Se estamos na primeira etapa e há um tipo de conta selecionado, 
    // apenas limpa a seleção para permitir escolher novamente
    if (currentStep === 1 && data.accountType) {
      updateData("accountType", undefined);
    } else {
      // Caso contrário, volta para o dashboard
      navigate("/");
    }
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    
    // Verificar se todos os documentos necessários foram enviados
    const allDocumentsUploaded = checkAllDocumentsUploaded();
    
    setTimeout(() => {
      if (allDocumentsUploaded) {
        // Todos os documentos foram enviados
        localStorage.setItem('allDocumentsCompleted', 'true');
        toast({
          title: "✅ Cadastro Finalizado com Sucesso!",
          description: "Seus dados e documentos foram enviados para análise. Nossa equipe revisará todas as informações e você receberá uma resposta por email em até 3 dias úteis. Agradecemos pela confiança!",
          duration: 6000,
        });
      } else {
        // Faltam documentos, mas ainda permite finalizar
        toast({
          title: "✅ Cadastro Criado com Sucesso!",
          description: "Sua conta foi criada! Ainda há documentos pendentes que precisam ser enviados. Você encontrará um lembrete na tela inicial para completar o envio. Após enviar todos os documentos, a análise será concluída em até 3 dias úteis.",
          duration: 8000,
        });
      }
      
      // Sempre navegar para o dashboard após finalizar
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }, 1500); // Simular processamento
  };

  // Função para verificar se todos os documentos obrigatórios foram enviados
  const checkAllDocumentsUploaded = () => {
    if (data.accountType === "juridica") {
      return !!(data.contratoSocial && data.rgRepresentante && data.comprovanteEndereco);
    } else {
      return !!(data.cpfDocumento && data.comprovanteEndereco);
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    updateData(field, file);
    
    // Verificar se todos os documentos foram enviados após o upload
    setTimeout(() => {
      const allDocsComplete = checkAllDocumentsUploaded();
      if (allDocsComplete) {
        // Salvar no localStorage que todos os documentos foram enviados
        localStorage.setItem('allDocumentsCompleted', 'true');
        
        // Mostrar toast de sucesso
        toast({
          title: "✅ Todos os Documentos Enviados!",
          description: "Parabéns! Todos os documentos obrigatórios foram enviados com sucesso. O lembrete na tela inicial será removido automaticamente.",
          duration: 5000,
        });
      }
    }, 100);
  };

  const openFileSelector = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // Função para formatar data no input (DD/MM/AAAA)
  const formatDateInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para validar data
  const isValidDate = (dateString: string) => {
    if (dateString.length !== 10) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year &&
           year >= 1900 && 
           year <= new Date().getFullYear() &&
           date <= new Date();
  };
  // Função para verificar se os documentos foram enviados
  const getDocumentStatus = () => {
    if (data.accountType === "juridica") {
      const hasContratoSocial = !!data.contratoSocial;
      const hasRgRepresentante = !!data.rgRepresentante;
      const hasComprovanteEndereco = !!data.comprovanteEndereco;
      const allDocumentsSent = hasContratoSocial && hasRgRepresentante && hasComprovanteEndereco;
      
      return {
        status: allDocumentsSent ? "Enviados com sucesso" : "Pendente",
        color: allDocumentsSent ? "text-green-600" : "text-amber-600",
        validation: allDocumentsSent ? "Aguardando análise" : "Aguardando envio",
        validationColor: allDocumentsSent ? "text-amber-600" : "text-red-600"
      };
    } else {
      const hasCpfDocumento = !!data.cpfDocumento;
      const hasComprovanteEndereco = !!data.comprovanteEndereco;
      const allDocumentsSent = hasCpfDocumento && hasComprovanteEndereco;
      
      return {
        status: allDocumentsSent ? "Enviados com sucesso" : "Pendente", 
        color: allDocumentsSent ? "text-green-600" : "text-amber-600",
        validation: allDocumentsSent ? "Aguardando análise" : "Aguardando envio",
        validationColor: allDocumentsSent ? "text-amber-600" : "text-red-600"
      };
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Dados da Conta</h2>
              <p className="text-boost-text-secondary">Selecione o tipo de conta e insira os dados para iniciar o seu cadastro.</p>
            </div>

            {!data.accountType && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateData("accountType", "juridica")}
                  className="p-6 border border-boost-border rounded-lg hover:border-boost-accent transition-colors text-center space-y-2"
                >
                  <Building2 className="h-8 w-8 text-boost-accent mx-auto" />
                  <div>
                    <div className="font-medium text-boost-text-primary">Pessoa Jurídica</div>
                    <div className="text-sm text-boost-text-secondary">CNPJ</div>
                  </div>
                </button>
                <button
                  onClick={() => updateData("accountType", "fisica")}
                  className="p-6 border border-boost-border rounded-lg hover:border-boost-accent transition-colors text-center space-y-2"
                >
                  <User className="h-8 w-8 text-boost-accent mx-auto" />
                  <div>
                    <div className="font-medium text-boost-text-primary">Pessoa Física</div>
                    <div className="text-sm text-boost-text-secondary">CPF</div>
                  </div>
                </button>
              </div>
            )}

            {data.accountType && (
              <Card className="border-boost-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-boost-text-primary">Dados da Conta</h3>
                    <span className="text-sm px-3 py-1 bg-boost-accent text-white rounded-full">
                      {data.accountType === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"}
                    </span>
                  </div>

                  {data.accountType === "juridica" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <BoostInput
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={data.cnpj || ""}
                          onChange={(e) => updateData("cnpj", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpfRepresentante">CPF do representante legal</Label>
                        <BoostInput
                          id="cpfRepresentante"
                          placeholder="000.000.000-00"
                          value={data.cpfRepresentante || ""}
                          onChange={(e) => updateData("cpfRepresentante", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataNascimentoRepresentante">Data de nascimento do representante legal</Label>
                        <BoostInput
                          id="dataNascimentoRepresentante"
                          placeholder="DD/MM/AAAA"
                          icon={<Calendar className="h-4 w-4" />}
                          value={data.dataNascimentoRepresentante || ""}
                          onChange={(e) => {
                            const formatted = formatDateInput(e.target.value);
                            updateData("dataNascimentoRepresentante", formatted);
                          }}
                          maxLength={10}
                        />
                        {data.dataNascimentoRepresentante && !isValidDate(data.dataNascimentoRepresentante) && (
                          <p className="text-xs text-red-500">
                            Digite uma data válida no formato DD/MM/AAAA
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="celularRepresentante">Celular do representante legal</Label>
                        <BoostInput
                          id="celularRepresentante"
                          placeholder="(00) 00000-0000"
                          value={data.celularRepresentante || ""}
                          onChange={(e) => updateData("celularRepresentante", e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <BoostInput
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={data.cpf || ""}
                          onChange={(e) => updateData("cpf", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de nascimento</Label>
                        <BoostInput
                          id="dataNascimento"
                          placeholder="DD/MM/AAAA"
                          icon={<Calendar className="h-4 w-4" />}
                          value={data.dataNascimento || ""}
                          onChange={(e) => {
                            const formatted = formatDateInput(e.target.value);
                            updateData("dataNascimento", formatted);
                          }}
                          maxLength={10}
                        />
                        {data.dataNascimento && !isValidDate(data.dataNascimento) && (
                          <p className="text-xs text-red-500">
                            Digite uma data válida no formato DD/MM/AAAA
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="celular">Celular</Label>
                        <BoostInput
                          id="celular"
                          placeholder="(00) 00000-0000"
                          value={data.celular || ""}
                          onChange={(e) => updateData("celular", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Dados do Negócio</h2>
              <p className="text-boost-text-secondary">Informe os dados da sua empresa ou atividade profissional.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-boost-text-primary">Dados do Negócio</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <BoostInput
                    id="nomeEmpresa"
                    placeholder="Nome da sua empresa"
                    value={data.nomeEmpresa}
                    onChange={(e) => updateData("nomeEmpresa", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia (opcional)</Label>
                  <BoostInput
                    id="nomeFantasia"
                    placeholder="Nome fantasia"
                    value={data.nomeFantasia || ""}
                    onChange={(e) => updateData("nomeFantasia", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segmento">Segmento</Label>
                  <Select value={data.segmento} onValueChange={(value) => updateData("segmento", value)}>
                    <SelectTrigger className="boost-input">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="comercio">Comércio</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (opcional)</Label>
                  <BoostInput
                    id="website"
                    placeholder="https://www.seusite.com"
                    value={data.website || ""}
                    onChange={(e) => updateData("website", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricaoAtividade">Descrição da Atividade</Label>
                  <Textarea
                    id="descricaoAtividade"
                    placeholder="Descreva brevemente a atividade da empresa"
                    className="boost-input min-h-[100px] resize-none"
                    value={data.descricaoAtividade}
                    onChange={(e) => updateData("descricaoAtividade", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Endereço</h2>
              <p className="text-boost-text-secondary">Cadastre o endereço principal da sua empresa ou residência.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-boost-text-primary">Endereço</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <BoostInput
                    id="cep"
                    placeholder="00000-000"
                    value={data.cep}
                    onChange={(e) => updateData("cep", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <BoostInput
                      id="cidade"
                      placeholder="São Paulo"
                      value={data.cidade}
                      onChange={(e) => updateData("cidade", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <BoostInput
                      id="estado"
                      placeholder="SP"
                      value={data.estado}
                      onChange={(e) => updateData("estado", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <BoostInput
                    id="logradouro"
                    placeholder="Rua, Avenida, etc."
                    value={data.logradouro}
                    onChange={(e) => updateData("logradouro", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <BoostInput
                      id="numero"
                      placeholder="123"
                      value={data.numero}
                      onChange={(e) => updateData("numero", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <BoostInput
                      id="complemento"
                      placeholder="Apto 101"
                      value={data.complemento || ""}
                      onChange={(e) => updateData("complemento", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <BoostInput
                      id="bairro"
                      placeholder="Centro"
                      value={data.bairro}
                      onChange={(e) => updateData("bairro", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Banner para acesso direto via documentos pendentes */}
            {searchParams.get('step') === '4' && (
              <div className="bg-boost-bg-secondary border border-boost-border rounded-lg p-4 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-boost-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="h-4 w-4 text-boost-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-boost-text-primary mb-1">
                      Envio de Documentos Pendentes
                    </h4>
                    <p className="text-xs text-boost-text-secondary">
                      Complete o envio dos documentos necessários para finalizar a validação da sua conta.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Carregar Documentos</h2>
              <p className="text-boost-text-secondary">Envie os documentos necessários para validação da conta.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-boost-accent" />
                  <h3 className="text-lg font-medium text-boost-text-primary">Carregar Documentos</h3>
                </div>

                <div className="bg-boost-accent/10 border border-boost-accent/20 rounded-lg p-4">
                  <h4 className="font-medium text-boost-text-primary mb-2">Documentos Necessários</h4>
                  <p className="text-sm text-boost-text-secondary mb-3">Para validar sua conta, envie os documentos abaixo:</p>
                  <ul className="text-sm text-boost-text-primary space-y-1">
                    {data.accountType === "juridica" ? (
                      <>
                        <li>• Contrato Social ou CNPJ</li>
                        <li>• RG/CNH do representante legal</li>
                        <li>• CPF do representante legal</li>
                        <li>• Comprovante de endereço da empresa</li>
                      </>
                    ) : (
                      <>
                        <li>• RG ou CNH</li>
                        <li>• CPF</li>
                        <li>• Comprovante de endereço</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-4">
                  {data.accountType === "juridica" ? (
                    <>
                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">Contrato Social / CNPJ</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="contratoSocial"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("contratoSocial", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("contratoSocial")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.contratoSocial && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {data.contratoSocial.name}
                          </p>
                        )}
                      </div>

                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">RG/CNH do Representante</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="rgRepresentante"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("rgRepresentante", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("rgRepresentante")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.rgRepresentante && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {data.rgRepresentante.name}
                          </p>
                        )}
                      </div>

                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">Comprovante de Endereço</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="comprovanteEndereco"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("comprovanteEndereco", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("comprovanteEndereco")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.comprovanteEndereco && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {data.comprovanteEndereco.name}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">RG ou CNH</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="cpfDocumento"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("cpfDocumento", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("cpfDocumento")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.cpfDocumento && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {data.cpfDocumento.name}
                          </p>
                        )}
                      </div>

                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">Comprovante de Endereço</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="comprovanteEnderecoPF"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("comprovanteEndereco", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("comprovanteEnderecoPF")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.comprovanteEndereco && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {data.comprovanteEndereco.name}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        <strong>Análise Rápida e Segura</strong>
                      </p>
                      <p className="text-sm text-blue-700">
                        Seus documentos serão analisados com segurança pela nossa equipe especializada. 
                        O processo de validação leva até 3 dias úteis, e você receberá uma notificação 
                        por email assim que sua conta estiver aprovada e pronta para uso.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Confirmação</h2>
              <p className="text-boost-text-secondary">Revise todas as informações antes de finalizar o cadastro.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium text-boost-text-primary">Confirmação dos Dados</h3>
                </div>

                {/* Status dos documentos */}
                <div className={`border rounded-lg p-4 ${checkAllDocumentsUploaded() ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} animate-fade-in`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {checkAllDocumentsUploaded() ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Upload className="h-5 w-5 text-blue-600" />
                    )}
                    <h4 className="font-medium">
                      {checkAllDocumentsUploaded() ? 'Documentos Enviados' : 'Documentos Pendentes'}
                    </h4>
                  </div>
                  
                  <p className={`text-sm ${checkAllDocumentsUploaded() ? 'text-green-700' : 'text-blue-700'}`}>
                    {checkAllDocumentsUploaded() 
                      ? 'Todos os documentos obrigatórios foram enviados com sucesso! Seus dados estão prontos para análise.'
                      : 'Você pode criar sua conta agora e enviar os documentos pendentes posteriormente. Um lembrete será exibido na tela inicial para completar o envio quando desejar.'
                    }
                  </p>
                  
                  {/* Lista de status dos documentos */}
                  <div className="mt-3 space-y-1">
                    {data.accountType === "juridica" ? (
                      <>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.contratoSocial ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-amber-400"></div>
                          }
                          <span className={data.contratoSocial ? 'text-green-700' : 'text-blue-700'}>
                            Contrato Social ou CNPJ
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.rgRepresentante ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.rgRepresentante ? 'text-green-700' : 'text-blue-700'}>
                            RG/CNH do representante legal
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.comprovanteEndereco ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.comprovanteEndereco ? 'text-green-700' : 'text-blue-700'}>
                            Comprovante de endereço da empresa
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.cpfDocumento ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.cpfDocumento ? 'text-green-700' : 'text-blue-700'}>
                            RG ou CNH
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.comprovanteEndereco ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.comprovanteEndereco ? 'text-green-700' : 'text-blue-700'}>
                            Comprovante de endereço
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Próximos Passos:</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Após finalizar o cadastro, nossa equipe analisará seus dados e documentos. 
                    Você receberá uma resposta por email em até 3 dias úteis com o status da sua conta.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Tipo de Conta</h4>
                    <p className="text-sm text-boost-text-secondary">
                      {data.accountType === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"}
                    </p>
                  </div>

                  {data.accountType === "juridica" ? (
                    <div className="border border-boost-border rounded-lg p-4">
                      <h4 className="font-medium text-boost-text-primary mb-3">Dados da Conta</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-boost-text-secondary">CNPJ:</span>
                          <p className="font-medium">{data.cnpj}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">CPF do Representante:</span>
                          <p className="font-medium">{data.cpfRepresentante}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Data de Nascimento:</span>
                          <p className="font-medium">{data.dataNascimentoRepresentante || "-"}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Celular:</span>
                          <p className="font-medium">{data.celularRepresentante}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-boost-border rounded-lg p-4">
                      <h4 className="font-medium text-boost-text-primary mb-3">Dados da Conta</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-boost-text-secondary">CPF:</span>
                          <p className="font-medium">{data.cpf}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Data de Nascimento:</span>
                          <p className="font-medium">{data.dataNascimento || "-"}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Celular:</span>
                          <p className="font-medium">{data.celular}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Dados do Negócio</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-boost-text-secondary">Nome da Empresa:</span>
                        <p className="font-medium">{data.nomeEmpresa}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Segmento:</span>
                        <p className="font-medium">{data.segmento}</p>
                      </div>
                      {data.website && (
                        <div>
                          <span className="text-boost-text-secondary">Website:</span>
                          <p className="font-medium">{data.website}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-boost-text-secondary">Descrição da Atividade:</span>
                        <p className="font-medium">{data.descricaoAtividade}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Endereço</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-boost-text-secondary">CEP:</span>
                        <p className="font-medium">{data.cep}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Logradouro:</span>
                        <p className="font-medium">{data.logradouro}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Número:</span>
                        <p className="font-medium">{data.numero}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Bairro:</span>
                        <p className="font-medium">{data.bairro}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Cidade:</span>
                        <p className="font-medium">{data.cidade}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Estado:</span>
                        <p className="font-medium">{data.estado}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Documentos</h4>
                    <div className="text-sm space-y-2">
                      {(() => {
                        const docStatus = getDocumentStatus();
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-boost-text-secondary">Status dos documentos:</span>
                              <span className={`font-medium ${docStatus.color}`}>{docStatus.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-boost-text-secondary">Validação:</span>
                              <span className={`font-medium ${docStatus.validationColor}`}>{docStatus.validation}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-boost-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-boost-text-primary font-bold text-2xl">LB</span>
          </div>
          <p className="text-boost-text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-boost-bg-primary flex">
      {/* Sidebar */}
      <div className="w-80 bg-boost-bg-primary border-r border-boost-border p-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-boost-text-primary font-bold text-2xl">LB</span>
          </div>
          <div className="space-y-1">
            <Progress value={(currentStep / 5) * 100} className="h-2" />
            <p className="text-sm text-boost-text-secondary">Etapa {currentStep} de 5</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-boost-accent/10 text-boost-accent"
                    : isCompleted
                    ? "text-boost-text-primary"
                    : "text-boost-text-secondary"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-boost-accent text-white"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-boost-bg-tertiary text-boost-text-secondary"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* Botão Voltar para Tela Principal */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 text-boost-text-secondary hover:text-boost-accent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para tela principal</span>
              </Button>
            </div>

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleBackToStart}
                  className="flex items-center space-x-2 text-boost-text-secondary hover:text-boost-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{data.accountType ? "Voltar ao início" : "Voltar ao início"}</span>
                </Button>
              )}

              {currentStep < 5 ? (
                <Button 
                  onClick={nextStep} 
                  className="flex items-center space-x-2"
                  disabled={
                    (!data.accountType && currentStep === 1) || 
                    (currentStep === 4 && !checkAllDocumentsUploaded())
                  }
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting}
                  className={`${
                    checkAllDocumentsUploaded() 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white flex items-center space-x-2 disabled:opacity-70 transition-all duration-300`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {checkAllDocumentsUploaded() ? 'Finalizar Cadastro' : 'Criar Conta'}
                      </span>
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}