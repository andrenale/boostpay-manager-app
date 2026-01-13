import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, Trash2, User, Package, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { SectionCard } from "@/components/SectionCard";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatCurrencyInput, formatCurrency } from "@/lib/currency";
import { useCurrentEstablishmentProducts, useCreateCurrentEstablishmentProduct } from "@/hooks/useProducts";
import { useCurrentEstablishmentCustomers, useCreateCurrentEstablishmentCustomer } from "@/hooks/useCustomers";
import { useEstablishment } from "@/hooks/useEstablishment";
import { ProductResponse, CustomerResponse } from "@/types/api";
import { handleApiError } from "@/services/api";

// Interfaces para os tipos de dados
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  tipo: 'pf' | 'pj'; // pessoa física ou jurídica
  razaoSocial?: string;
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  createdAt: Date;
}


const Cobranca = () => {
  const navigate = useNavigate();
  const { establishmentId, isLoading: establishmentLoading } = useEstablishment();
  
  // Estado para busca de produtos
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Estado para busca de clientes
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  
  // Debounce product search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(productSearchTerm);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [productSearchTerm]);
  
  // Debounce customer search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearchTerm);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [customerSearchTerm]);
  
  // API hook for products with search support
  const { 
    data: productsFromAPI = [], 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useCurrentEstablishmentProducts(
    {
      search: debouncedSearchTerm.trim() || undefined,
      limit: debouncedSearchTerm.trim() ? undefined : 4, // Limit to 4 only when not searching
    },
    {
      enabled: !!establishmentId,
    }
  );
  
  // API hook for customers with search support (only search, never list all)
  const {
    data: customersFromAPI = [],
    isLoading: customersLoading,
    isFetching: customersFetching,
    error: customersError,
    refetch: refetchCustomers
  } = useCurrentEstablishmentCustomers(
    {
      search: debouncedCustomerSearch.trim(),
    },
    {
      enabled: !!establishmentId && debouncedCustomerSearch.trim().length >= 5,
    }
  );
  
  // Product creation mutation
  const createProductMutation = useCreateCurrentEstablishmentProduct({
    onSuccess: (newProduct) => {
      // Refetch products to update the list
      refetchProducts();
      
      // Format price for the form
      const valorFormatado = formatCurrencyInput((parseFloat(newProduct.price) * 100).toString());
      
      // Auto-select the created product and fill in the data
      setFormData(prev => ({
        ...prev,
        produtoOpcao: "selecionar",
        produtosSelecionados: [newProduct.id.toString()],
        valor: valorFormatado,
        descricao: newProduct.description || newProduct.name
      }));
      
      // Reset the form
      setNovoProduto({
        name: "",
        description: "",
        price: "",
      });
      
      toast({
        title: "Produto criado com sucesso!",
        description: `${newProduct.name} foi adicionado e selecionado para esta cobrança.`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar produto",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });
  
  // Customer creation mutation
  const createCustomerMutation = useCreateCurrentEstablishmentCustomer({
    onSuccess: (newCustomer) => {
      // Refetch customers to update the list
      refetchCustomers();
      
      // Auto-select the created customer
      setFormData(prev => ({
        ...prev,
        clienteOpcao: "selecionar",
        clienteSelecionado: newCustomer.id.toString()
      }));
      
      // Reset the form
      setNovoCliente({
        nome: "",
        email: "",
        telefone: "",
        documento: "",
        tipo: "pf",
        razaoSocial: ""
      });
      
      toast({
        title: "Cliente criado com sucesso!",
        description: `${newCustomer.name} foi adicionado e selecionado para esta cobrança.`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cliente",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });
  
  // Convert API products to the format used in Cobranca
  const products: Product[] = productsFromAPI.map(p => ({
    id: p.id.toString(),
    name: p.name,
    code: p.code,
    description: p.description || undefined,
    price: parseFloat(p.price),
    createdAt: new Date(p.created_at || Date.now())
  }));
  
  // Convert API customers to the format used in Cobranca
  const clientes = customersFromAPI.map(c => ({
    id: c.id.toString(),
    nome: c.name,
    email: c.email || "",
    telefone: c.phone,
    documento: c.document_number,
    tipo: 'pf' as 'pf' | 'pj',
    razaoSocial: undefined,
    createdAt: new Date(c.created_at || Date.now())
  }));
  
  const [openSections, setOpenSections] = useState({
    tipoCobranca: false,
    cliente: true,
    produto: false,
    dados: true,
    informacoes: false,
    splits: false,
    tempo: false,
    destino: false,
  });

  // Mock data dos recebedores ativos (mesma estrutura do Split)
  const activeRecipients = [
    {
      id: "REC001",
      name: "João Silva - Vendedor Principal",
      document: "123.456.789-00",
      email: "joao.silva@email.com",
      phone: "(11) 99999-8888",
      status: "accepted"
    },
    {
      id: "REC002", 
      name: "Plataforma E-commerce",
      document: "12.345.678/0001-90",
      email: "contato@plataforma.com",
      phone: "(11) 3333-4444",
      status: "accepted"
    }
  ];
  
  const [formData, setFormData] = useState({
    tipoCobranca: "hibrido",
    clienteOpcao: "selecionar",
    clienteSelecionado: "",
    produtoOpcao: "selecionar",
    produtosSelecionados: [] as string[],
    produtoQuantities: {} as Record<string, number>,
    valor: "",
    descricao: "",
    informacoesAdicionais: [],
    splits: [],
    tempo: "24h",
    destinoPagamento: {
      razaoSocial: "BOOST ADMINISTRADORA DE PAGAMENTOS LTDA",
      cnpj: "28.620.382/0001-75",
    },
  });

  // Estado para o formulário de criação de produto
  const [novoProduto, setNovoProduto] = useState({
    name: "",
    description: "",
    price: "",
  });

  // Estado para o formulário de criação de cliente
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    tipo: "pf" as 'pf' | 'pj',
    razaoSocial: ""
  });

  const handleCriarNovoCliente = async () => {
    // Validação simples
    if (!novoCliente.nome || !novoCliente.telefone || !novoCliente.documento) {
      toast({
        title: "Erro na validação",
        description: "Preencha nome, telefone e documento do cliente",
        variant: "destructive"
      });
      return;
    }

    if (!establishmentId) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create customer via API
      await createCustomerMutation.mutateAsync({
        name: novoCliente.nome,
        phone: novoCliente.telefone,
        email: novoCliente.email || undefined,
        document_number: novoCliente.documento,
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Error creating customer:', error);
    }
  };

  const handleCriarNovoProduto = async () => {
    // Validação simples
    if (!novoProduto.name || !novoProduto.price) {
      toast({
        title: "Erro na validação",
        description: "Preencha o nome e o valor do produto",
        variant: "destructive"
      });
      return;
    }

    if (!establishmentId) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remover formatação: limpar tudo exceto números e vírgula
      const valorLimpo = novoProduto.price.replace(/[^\d,]/g, '');
      
      // Converter vírgula para ponto e parsear
      const valorNumerico = parseFloat(valorLimpo.replace(',', '.'));
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        toast({
          title: "Erro na validação",
          description: "Digite um valor válido maior que zero",
          variant: "destructive"
        });
        return;
      }
      
      // Create product via API
      await createProductMutation.mutateAsync({
        code: `prod_${Date.now()}`, // Generate a unique code
        name: novoProduto.name,
        description: novoProduto.description || undefined,
        price: valorNumerico.toString(),
      });
      
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Error creating product:', error);
    }
  };

  const getClienteSubtitle = () => {
    if (formData.clienteOpcao === "selecionar" && formData.clienteSelecionado) {
      const cliente = clientes.find(c => c.id === formData.clienteSelecionado);
      return cliente ? `${cliente.nome} - ${cliente.documento}` : "Nenhum Cliente Selecionado";
    } else if (formData.clienteOpcao === "criar") {
      return novoCliente.nome ? `Criando: ${novoCliente.nome}` : "Criar novo cliente";
    }
    return "Nenhum Cliente Selecionado";
  };

  const getProdutoSubtitle = () => {
    if (formData.produtoOpcao === "selecionar" && formData.produtosSelecionados.length > 0) {
      const totalProdutos = formData.produtosSelecionados.length;
      const produtosSelecionados = products.filter(p => formData.produtosSelecionados.includes(p.id));
      const valorTotal = produtosSelecionados.reduce((sum, p) => sum + (p.price || 0), 0);
      return `${totalProdutos} produto(s) selecionado(s) - ${formatCurrency(valorTotal)}`;
    } else if (formData.produtoOpcao === "criar") {
      return novoProduto.name ? `Criando: ${novoProduto.name}` : "Criar novo produto";
    } else if (formData.produtoOpcao === "selecionar") {
      return "Selecione um ou mais produtos";
    }
    return "Selecione um ou mais produtos";
  };

  const getSplitsSubtitle = () => {
    if (formData.splits.length === 0) {
      return "Adicionar split para cobrança (opcional)";
    }
    
    const configurados = formData.splits.filter(s => s.recebedorId && s.valor);
    if (configurados.length === 0) {
      return `${formData.splits.length} split(s) adicionado(s) - Configure os valores`;
    }
    
    const percentuais = configurados.filter(s => s.tipo === "percentual");
    const fixos = configurados.filter(s => s.tipo === "fixo");
    
    let subtitle = `${configurados.length} recebedor(es) configurado(s)`;
    
    if (percentuais.length > 0) {
      const totalPercentual = percentuais.reduce((acc, s) => acc + parseFloat(s.valor || "0"), 0);
      subtitle += ` - ${totalPercentual}% em percentuais`;
    }
    
    if (fixos.length > 0) {
      subtitle += ` - ${fixos.length} valor(es) fixo(s)`;
    }
    
    return subtitle;
  };

  // Função para calcular a data de expiração
  const getExpirationTime = (tempo: string) => {
    const now = new Date();
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    };

    switch (tempo) {
      case "15min":
        const in15min = new Date(now.getTime() + 15 * 60 * 1000);
        return `15 minutos - Válido até ${formatDate(in15min)}`;
      case "30min":
        const in30min = new Date(now.getTime() + 30 * 60 * 1000);
        return `30 minutos - Válido até ${formatDate(in30min)}`;
      case "1h":
        const in1hour = new Date(now.getTime() + 60 * 60 * 1000);
        return `1 hora - Válido até ${formatDate(in1hour)}`;
      case "3h":
        const in3hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        return `3 horas - Válido até ${formatDate(in3hours)}`;
      case "6h":
        const in6hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        return `6 horas - Válido até ${formatDate(in6hours)}`;
      case "12h":
        const in12hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        return `12 horas - Válido até ${formatDate(in12hours)}`;
      case "24h":
        const in24hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return `24 horas - Válido até ${formatDate(in24hours)}`;
      case "36h":
        const in36hours = new Date(now.getTime() + 36 * 60 * 60 * 1000);
        return `36 horas - Válido até ${formatDate(in36hours)}`;
      case "infinito":
        return "Infinito - Link sem prazo de expiração";
      default:
        return "24 horas - Válido até " + formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const toggleSection = (section: string, open?: boolean) => {
    // Adiciona proteção contra duplo clique usando debounce
    const now = Date.now();
    const lastToggle = (window as any).lastToggleTime || 0;
    
    if (now - lastToggle < 300) { // 300ms de debounce
      return;
    }
    
    (window as any).lastToggleTime = now;
    
    setOpenSections(prev => ({
      ...prev,
      [section]: open !== undefined ? open : !prev[section as keyof typeof prev]
    }));
  };

  const addInformacaoAdicional = () => {
    setFormData(prev => ({
      ...prev,
      informacoesAdicionais: [...prev.informacoesAdicionais, { titulo: "", descricao: "" }]
    }));
  };

  const addSplit = () => {
    setFormData(prev => ({
      ...prev,
      splits: [...prev.splits, { recebedorId: "", tipo: "percentual", valor: "" }]
    }));
  };

  const removeSplit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      splits: prev.splits.filter((_, i) => i !== index)
    }));
  };

  const handleCriarCobranca = () => {
    console.log('[DEBUG] Validando cobrança - formData.valor:', formData.valor);
    
    // Validação obrigatória: Cliente
    if (formData.clienteOpcao === "selecionar" && !formData.clienteSelecionado) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para continuar",
        variant: "destructive"
      });
      // Abrir seção do cliente se estiver fechada
      setOpenSections(prev => ({ ...prev, cliente: true }));
      return;
    }
    
    if (formData.clienteOpcao === "criar") {
      if (!novoCliente.nome || !novoCliente.email || !novoCliente.documento) {
        toast({
          title: "Dados do cliente incompletos",
          description: "Preencha todos os campos obrigatórios do cliente",
          variant: "destructive"
        });
        setOpenSections(prev => ({ ...prev, cliente: true }));
        return;
      }
    }
    
    // Validação obrigatória: Descrição da cobrança
    if (!formData.descricao) {
      toast({
        title: "Dados da cobrança obrigatórios",
        description: "Preencha a descrição da cobrança",
        variant: "destructive"
      });
      setOpenSections(prev => ({ ...prev, dados: true }));
      return;
    }
    
    // Validação obrigatória: Valor
    if (!formData.valor) {
      toast({
        title: "Dados da cobrança obrigatórios",
        description: "Digite um valor válido maior que zero",
        variant: "destructive"
      });
      setOpenSections(prev => ({ ...prev, dados: true }));
      return;
    }
    
    // Remover formatação e converter para número (aceitar tanto "1.000,00" quanto "1000,00")
    const valorLimpo = formData.valor.replace(/[^\d,]/g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpo);
    
    console.log('[DEBUG] Valor limpo:', valorLimpo);
    console.log('[DEBUG] Valor numérico:', valorNumerico);
    
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({
        title: "Erro na validação",
        description: "Digite um valor válido maior que zero",
        variant: "destructive"
      });
      return;
    }

    // Simular criação da cobrança
    const paymentParams = new URLSearchParams({
      valor: `R$ ${formData.valor}`,
      descricao: formData.descricao
    });
    
    // Adicionar parâmetro clienteOpcao se necessário
    if (formData.clienteOpcao === "solicitar") {
      paymentParams.append('clienteOpcao', 'solicitar');
    }
    
    // Gerar um ID único para cada nova cobrança para evitar conflitos de customização
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    paymentParams.append('custom', uniqueId);
    
    const linkPagamento = `${window.location.origin}/checkout?${paymentParams.toString()}`;
    
    // Preparar dados para a página de sucesso
    const clienteNome = formData.clienteOpcao === "selecionar" && formData.clienteSelecionado
      ? clientes.find(c => c.id === formData.clienteSelecionado)?.nome || "Cliente Selecionado"
      : formData.clienteOpcao === "criar" && novoCliente.nome
      ? novoCliente.nome
      : "Cliente preencherá dados";

    // Salvar a cobrança no localStorage para aparecer nas transações
    const novaCobranca = {
      id: `COB${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('pt-BR'),
      dateObj: new Date(),
      client: clienteNome,
      email: formData.clienteOpcao === "selecionar" && formData.clienteSelecionado
        ? clientes.find(c => c.id === formData.clienteSelecionado)?.email || "email@exemplo.com"
        : formData.clienteOpcao === "criar" && novoCliente.email
        ? novoCliente.email
        : "email@exemplo.com",
      document: formData.clienteOpcao === "selecionar" && formData.clienteSelecionado
        ? clientes.find(c => c.id === formData.clienteSelecionado)?.documento || "000.000.000-00"
        : formData.clienteOpcao === "criar" && novoCliente.documento
        ? novoCliente.documento
        : "000.000.000-00",
      amount: parseFloat(formData.valor.replace(',', '.')),
      method: formData.tipoCobranca === "pix" ? "PIX" : formData.tipoCobranca === "cartao" ? "Cartão de Crédito" : "Boleto",
      methodIcon: formData.tipoCobranca === "pix" ? "Zap" : "CreditCard",
      status: "pending",
      statusText: "Aguardando",
      description: formData.descricao,
      paymentLink: linkPagamento,
      splits: formData.splits.map(split => ({
        recipient: activeRecipients.find(r => r.id === split.recebedorId)?.name || "Recebedor",
        amount: split.tipo === "percentual" 
          ? (parseFloat(formData.valor.replace(',', '.')) * parseFloat(split.valor || "0")) / 100
          : parseFloat(split.valor || "0")
      })),
      createdAt: new Date().toISOString()
    };

    // Recuperar cobranças existentes e adicionar a nova
    const cobrancasExistentes = JSON.parse(localStorage.getItem('boost-cobrancas') || '[]');
    const todasCobrancas = [novaCobranca, ...cobrancasExistentes];
    localStorage.setItem('boost-cobrancas', JSON.stringify(todasCobrancas));

    toast({
      title: "Cobrança criada com sucesso!",
      description: "A cobrança foi salva no histórico de transações."
    });

    // Gerar ID único para nova customização na página de sucesso
    const successCustomId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const params = new URLSearchParams({
      valor: `R$ ${formData.valor}`,
      descricao: formData.descricao,
      cliente: clienteNome,
      custom: successCustomId
    });
    
    // Adicionar clienteOpcao se for solicitar cadastro
    if (formData.clienteOpcao === "solicitar") {
      params.set("clienteOpcao", "solicitar");
    }

    // Redirecionar para página de sucesso
    navigate(`/cobranca/sucesso?${params.toString()}`);
  };

  // SectionCard agora é um componente reutilizável importado de '@/components/SectionCard'


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <BoostButton
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-boost-text-secondary hover:text-boost-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </BoostButton>
        <div>
          <h1 className="mt-4 text-2xl font-bold text-boost-text-primary">Nova Cobrança</h1>
          <p className="text-boost-text-secondary">
            Configure sua cobrança personalizada para gerar um link de pagamento
          </p>
        </div>
      </div>

      {/* Seções do formulário */}
      <div className="space-y-4">
        {/* 1. Tipo de cobrança */}
        <SectionCard
          number={1}
          title="Tipo de cobrança"
          subtitle={
            formData.tipoCobranca === "pix" ? "Cobrança PIX" :
            formData.tipoCobranca === "cartao" ? "Cartão de Crédito" :
            formData.tipoCobranca === "boleto" ? "Boleto Bancário" :
            formData.tipoCobranca === "hibrido" ? "Híbrido (todas opções)" : "Cobrança PIX"
          }
          open={openSections.tipoCobranca}
          onOpenChange={(open) => toggleSection("tipoCobranca", open)}
        >
          <div className="pt-4">
            <Select 
              value={formData.tipoCobranca} 
              onValueChange={(value) => setFormData(prev => ({...prev, tipoCobranca: value}))}
            >
              <SelectTrigger className="bg-boost-bg-secondary border-boost-border">
                <SelectValue placeholder="Selecione o tipo de cobrança" />
              </SelectTrigger>
              <SelectContent className="bg-boost-bg-secondary border-boost-border z-50">
                <SelectItem value="pix" className="text-boost-text-primary">Cobrança PIX</SelectItem>
                <SelectItem value="cartao" className="text-boost-text-primary">Cartão de Crédito</SelectItem>
                <SelectItem value="boleto" className="text-boost-text-primary">Boleto Bancário</SelectItem>
                <SelectItem value="hibrido" className="text-boost-text-primary">Híbrido (todas opções)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        {/* 2. Produto */}
        <SectionCard
          number={2}
          title="Produto"
          subtitle={getProdutoSubtitle()}
          open={openSections.produto}
          onOpenChange={(open) => toggleSection("produto", open)}
        >
          <div className="pt-4">
            <RadioGroup 
              value={formData.produtoOpcao}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev, 
                  produtoOpcao: value, 
                  produtosSelecionados: [],
                  valor: "",
                  descricao: ""
                }));
                // Limpar formulário de novo produto ao trocar opção
                if (value !== "criar") {
                  setNovoProduto({
                    name: "",
                    description: "",
                    price: ""
                  });
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-boost-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selecionar" id="selecionarProduto" />
                    <Label htmlFor="selecionarProduto" className="font-medium">Selecionar produto</Label>
                  </div>
                  <p className="text-sm text-boost-text-secondary mt-2">
                    Escolha entre produtos já cadastrados
                  </p>
                </div>
                
                <div className="border border-boost-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="criar" id="criarProduto" />
                    <Label htmlFor="criarProduto" className="font-medium">Criar produto</Label>
                  </div>
                  <p className="text-sm text-boost-text-secondary mt-2">
                    Cadastre um novo produto agora
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* Formulário para selecionar produtos existentes */}
            {formData.produtoOpcao === "selecionar" && (
              <div className="mt-6 space-y-4">
                {productsLoading && !productSearchTerm ? (
                  <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                    <p className="font-medium">Carregando produtos...</p>
                  </div>
                ) : productsError ? (
                  <div className="p-8 text-center text-red-600 border border-red-300 rounded-lg bg-red-50">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Erro ao carregar produtos</p>
                    <p className="text-xs mt-1">Tente novamente mais tarde</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-boost-text-secondary text-sm mb-3 block">
                        Selecione um ou mais produtos:
                      </Label>
                      
                      {/* Search Input - Always visible */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-boost-text-secondary" />
                        <BoostInput
                          type="text"
                          placeholder="Buscar por nome ou código (#123)..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-10"
                          autoFocus={!!debouncedSearchTerm}
                        />
                        {productSearchTerm && !productsLoading && (
                          <button
                            type="button"
                            onClick={() => setProductSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-boost-text-secondary hover:text-boost-text-primary"
                          >
                            ✕
                          </button>
                        )}
                        {productsLoading && productSearchTerm && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-boost-primary border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-[400px] overflow-y-auto border border-boost-border rounded-lg p-2">
                        {products.length === 0 ? (
                          <div className="p-4 text-center text-boost-text-secondary">
                            <p className="text-sm">Nenhum produto encontrado</p>
                            <p className="text-xs mt-1">
                              {productSearchTerm.trim() ? "Tente outro termo de busca" : "Crie um novo produto"}
                            </p>
                          </div>
                        ) : (
                          products.map((produto) => (
                          <div
                            key={produto.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-boost-bg-secondary border border-boost-border cursor-pointer"
                            onClick={() => {
                              const isSelected = formData.produtosSelecionados.includes(produto.id);
                              const newSelection = isSelected
                                ? formData.produtosSelecionados.filter(id => id !== produto.id)
                                : [...formData.produtosSelecionados, produto.id];
                              
                              // Atualizar quantidades (inicializar com 1 para novos produtos, remover para desmarcados)
                              const newQuantities = { ...formData.produtoQuantities };
                              if (!isSelected) {
                                newQuantities[produto.id] = 1;
                              } else {
                                delete newQuantities[produto.id];
                              }
                              
                              // Calcular valor total com quantidades
                              const produtosSelecionados = products.filter(p => newSelection.includes(p.id));
                              const valorTotal = produtosSelecionados.reduce((sum, p) => {
                                const quantity = newQuantities[p.id] || 1;
                                return sum + (p.price || 0) * quantity;
                              }, 0);
                              const valorFormatado = valorTotal.toFixed(2).replace('.', ',');
                              
                              // Criar descrição com todos os produtos
                              const descricao = produtosSelecionados.map(p => {
                                const quantity = newQuantities[p.id] || 1;
                                return quantity > 1 ? `${p.name} (${quantity}x)` : p.name;
                              }).join(', ');
                              
                              setFormData(prev => ({
                                ...prev,
                                produtosSelecionados: newSelection,
                                produtoQuantities: newQuantities,
                                valor: valorFormatado,
                                descricao: descricao || prev.descricao
                              }));
                            }}
                          >
                            <Checkbox
                              checked={formData.produtosSelecionados.includes(produto.id)}
                              onCheckedChange={() => {}} // Handled by div onClick
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-boost-text-primary truncate">
                                      {produto.name}
                                    </p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                      #{produto.id}
                                    </span>
                                  </div>
                                  {produto.description && (
                                    <p className="text-xs text-boost-text-secondary mt-0.5 line-clamp-2">
                                      {produto.description}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-boost-text-primary whitespace-nowrap">
                                  {formatCurrency(produto.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                        )}
                      </div>
                      
                      {/* Show hint when not searching */}
                      {!productSearchTerm.trim() && products.length === 4 && (
                        <p className="text-xs text-boost-text-secondary mt-2">
                          Mostrando os primeiros 4 produtos. Use a busca para encontrar mais.
                        </p>
                      )}
                    </div>

                    {/* Mostrar resumo dos produtos selecionados */}
                    {formData.produtosSelecionados.length > 0 && (
                      <div className="bg-boost-bg-secondary rounded-lg p-4 border border-boost-border">
                        <h4 className="font-medium text-boost-text-primary mb-3">
                          Produtos Selecionados ({formData.produtosSelecionados.length}):
                        </h4>
                        <div className="space-y-2">
                          {formData.produtosSelecionados.map((produtoId) => {
                            const produto = products.find(p => p.id === produtoId);
                            if (!produto) return null;
                            
                            const quantity = formData.produtoQuantities[produtoId] || 1;
                            const subtotal = produto.price * quantity;
                            
                            return (
                              <div key={produtoId} className="flex items-center gap-3 py-2 border-b border-boost-border last:border-0">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-boost-text-primary">{produto.name}</p>
                                  {produto.description && (
                                    <p className="text-xs text-boost-text-secondary truncate">{produto.description}</p>
                                  )}
                                </div>
                                
                                {/* Quantity Input with +/- buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentQty = formData.produtoQuantities[produtoId] || 1;
                                      if (currentQty <= 1) return; // Don't go below 1
                                      
                                      const newQuantity = currentQty - 1;
                                      const newQuantities = {
                                        ...formData.produtoQuantities,
                                        [produtoId]: newQuantity
                                      };
                                      
                                      // Recalcular valor total
                                      const valorTotal = formData.produtosSelecionados.reduce((sum, id) => {
                                        const p = products.find(prod => prod.id === id);
                                        if (!p) return sum;
                                        const qty = newQuantities[id] || 1;
                                        return sum + (p.price || 0) * qty;
                                      }, 0);
                                      const valorFormatado = valorTotal.toFixed(2).replace('.', ',');
                                      
                                      // Atualizar descrição
                                      const descricao = formData.produtosSelecionados.map(id => {
                                        const p = products.find(prod => prod.id === id);
                                        if (!p) return '';
                                        const qty = newQuantities[id] || 1;
                                        return qty > 1 ? `${p.name} (${qty}x)` : p.name;
                                      }).filter(Boolean).join(', ');
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        produtoQuantities: newQuantities,
                                        valor: valorFormatado,
                                        descricao
                                      }));
                                    }}
                                    className="h-8 w-8 flex items-center justify-center rounded border border-boost-border bg-boost-bg-primary hover:bg-boost-bg-secondary transition-colors text-boost-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity <= 1}
                                    title="Diminuir quantidade"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="w-12 h-8 flex items-center justify-center text-sm font-medium text-boost-text-primary bg-white border border-boost-border rounded px-2">
                                    {quantity}
                                  </div>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentQty = formData.produtoQuantities[produtoId] || 1;
                                      if (currentQty >= 999) return; // Don't go above 999
                                      
                                      const newQuantity = currentQty + 1;
                                      const newQuantities = {
                                        ...formData.produtoQuantities,
                                        [produtoId]: newQuantity
                                      };
                                      
                                      // Recalcular valor total
                                      const valorTotal = formData.produtosSelecionados.reduce((sum, id) => {
                                        const p = products.find(prod => prod.id === id);
                                        if (!p) return sum;
                                        const qty = newQuantities[id] || 1;
                                        return sum + (p.price || 0) * qty;
                                      }, 0);
                                      const valorFormatado = valorTotal.toFixed(2).replace('.', ',');
                                      
                                      // Atualizar descrição
                                      const descricao = formData.produtosSelecionados.map(id => {
                                        const p = products.find(prod => prod.id === id);
                                        if (!p) return '';
                                        const qty = newQuantities[id] || 1;
                                        return qty > 1 ? `${p.name} (${qty}x)` : p.name;
                                      }).filter(Boolean).join(', ');
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        produtoQuantities: newQuantities,
                                        valor: valorFormatado,
                                        descricao
                                      }));
                                    }}
                                    className="h-8 w-8 flex items-center justify-center rounded border border-boost-border bg-boost-bg-primary hover:bg-boost-bg-secondary transition-colors text-boost-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity >= 999}
                                    title="Aumentar quantidade"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                {/* Subtotal */}
                                <span className="font-semibold text-boost-text-primary whitespace-nowrap w-24 text-right">
                                  {formatCurrency(subtotal)}
                                </span>
                                
                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSelection = formData.produtosSelecionados.filter(id => id !== produtoId);
                                    const newQuantities = { ...formData.produtoQuantities };
                                    delete newQuantities[produtoId];
                                    
                                    // Recalcular valor total
                                    const valorTotal = newSelection.reduce((sum, id) => {
                                      const p = products.find(prod => prod.id === id);
                                      if (!p) return sum;
                                      const qty = newQuantities[id] || 1;
                                      return sum + (p.price || 0) * qty;
                                    }, 0);
                                    const valorFormatado = valorTotal.toFixed(2).replace('.', ',');
                                    
                                    // Atualizar descrição
                                    const descricao = newSelection.map(id => {
                                      const p = products.find(prod => prod.id === id);
                                      if (!p) return '';
                                      const qty = newQuantities[id] || 1;
                                      return qty > 1 ? `${p.name} (${qty}x)` : p.name;
                                    }).filter(Boolean).join(', ');
                                    
                                    setFormData(prev => ({
                                      ...prev,
                                      produtosSelecionados: newSelection,
                                      produtoQuantities: newQuantities,
                                      valor: valorFormatado,
                                      descricao: descricao || prev.descricao
                                    }));
                                  }}
                                  className="p-1 hover:bg-boost-bg-primary rounded transition-colors text-boost-text-secondary hover:text-red-500"
                                  title="Remover produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-between pt-3 border-t border-boost-border">
                            <span className="font-semibold text-boost-text-primary">Valor Total:</span>
                            <span className="text-lg font-bold text-boost-text-primary">
                              {formatCurrency(
                                formData.produtosSelecionados.reduce((sum, id) => {
                                  const p = products.find(prod => prod.id === id);
                                  if (!p) return sum;
                                  const qty = formData.produtoQuantities[id] || 1;
                                  return sum + (p.price || 0) * qty;
                                }, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Formulário para criar novo produto */}
            {formData.produtoOpcao === "criar" && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-boost-text-primary">Criar Novo Produto:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-boost-text-secondary text-sm">Nome do Produto *</Label>
                    <BoostInput
                      placeholder="Ex: Cerveja Premium"
                      value={novoProduto.name}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNovoProduto(prev => ({...prev, name: value}));
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-boost-text-secondary text-sm">Valor *</Label>
                    <BoostInput
                      placeholder="R$ 0,00"
                      value={novoProduto.price}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        setNovoProduto(prev => ({...prev, price: formatted}));
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-boost-text-secondary text-sm">Descrição</Label>
                    <Textarea
                      placeholder="Descreva o produto (opcional)"
                      value={novoProduto.description}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNovoProduto(prev => ({...prev, description: value}));
                      }}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <BoostButton
                    onClick={handleCriarNovoProduto}
                    className="min-w-32"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Produto
                      </>
                    )}
                  </BoostButton>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 3. Cliente a ser cobrado */}
        <SectionCard
          number={3}
          title="Cliente a ser cobrado"
          subtitle={getClienteSubtitle()}
          open={openSections.cliente}
          onOpenChange={(open) => toggleSection("cliente", open)}
        >
          <div className="pt-4">
            <RadioGroup 
              value={formData.clienteOpcao}
              onValueChange={(value) => {
                setFormData(prev => ({...prev, clienteOpcao: value, clienteSelecionado: ""}));
                // Limpar formulário de novo cliente ao trocar opção
                if (value !== "criar") {
                  setNovoCliente({
                    nome: "",
                    email: "",
                    telefone: "",
                    documento: "",
                    tipo: "pf",
                    razaoSocial: ""
                  });
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-boost-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selecionar" id="selecionar" />
                    <Label htmlFor="selecionar" className="font-medium">Selecionar cliente</Label>
                  </div>
                  <p className="text-sm text-boost-text-secondary mt-2">
                    Escolha entre clientes já cadastrados
                  </p>
                </div>
                
                <div className="border border-boost-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="criar" id="criar" />
                    <Label htmlFor="criar" className="font-medium">Criar cliente</Label>
                  </div>
                  <p className="text-sm text-boost-text-secondary mt-2">
                    Crie um novo cliente de forma simplificada agora
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* Formulário para selecionar cliente existente */}
            {formData.clienteOpcao === "selecionar" && (
              <div className="mt-6 space-y-4">
                {customersLoading && !customerSearchTerm ? (
                  <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                    <p className="font-medium">Carregando clientes...</p>
                  </div>
                ) : customersError ? (
                  <div className="p-8 text-center text-red-600 border border-red-300 rounded-lg bg-red-50">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Erro ao carregar clientes</p>
                    <p className="text-xs mt-1">Tente novamente mais tarde</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-boost-text-secondary text-sm mb-3 block">
                        Selecione um cliente: <span className="text-red-500">*</span>
                      </Label>
                      
                      {/* Search Input */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-boost-text-secondary" />
                        <BoostInput
                          type="text"
                          placeholder="Buscar por nome, email, telefone ou documento..."
                          value={customerSearchTerm}
                          onChange={(e) => setCustomerSearchTerm(e.target.value)}
                          className="pl-10"
                          autoFocus={!!debouncedCustomerSearch}
                        />
                        {customerSearchTerm && !customersLoading && (
                          <button
                            type="button"
                            onClick={() => setCustomerSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-boost-text-secondary hover:text-boost-text-primary"
                          >
                            ✕
                          </button>
                        )}
                        {customersLoading && customerSearchTerm && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-boost-primary border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Customer List or Prompt - Only show if no customer is selected */}
                      {!formData.clienteSelecionado && (
                        <>
                          {customerSearchTerm.trim().length < 5 ? (
                            <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p className="font-medium">Digite para buscar clientes</p>
                              <p className="text-xs mt-1">
                                {customerSearchTerm.trim().length > 0 
                                  ? `Digite mais ${5 - customerSearchTerm.trim().length} caractere(s) para buscar`
                                  : "Digite pelo menos 5 caracteres para buscar"}
                              </p>
                            </div>
                          ) : customerSearchTerm.trim().length >= 5 && debouncedCustomerSearch.trim().length < 5 ? (
                            <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                              <div className="animate-spin h-12 w-12 mx-auto mb-3 border-4 border-boost-primary border-t-transparent rounded-full"></div>
                              <p className="font-medium">Preparando busca...</p>
                            </div>
                          ) : debouncedCustomerSearch.trim().length >= 5 && (customersLoading || customersFetching) ? (
                            <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                              <div className="animate-spin h-12 w-12 mx-auto mb-3 border-4 border-boost-primary border-t-transparent rounded-full"></div>
                              <p className="font-medium">Buscando clientes...</p>
                            </div>
                          ) : debouncedCustomerSearch.trim().length >= 5 && clientes.length === 0 ? (
                            <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p className="font-medium">Nenhum cliente encontrado</p>
                              <p className="text-xs mt-1">Tente outro termo de busca</p>
                            </div>
                          ) : clientes.length > 0 ? (
                            <div className="border border-boost-border rounded-lg max-h-64 overflow-y-auto">
                              {clientes.map((cliente) => (
                                <button
                                  key={cliente.id}
                                  type="button"
                                  onClick={() => setFormData(prev => ({...prev, clienteSelecionado: cliente.id}))}
                                  className="w-full p-4 text-left hover:bg-boost-bg-tertiary transition-colors border-b border-boost-border last:border-b-0 bg-boost-bg-secondary"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-boost-text-primary">{cliente.nome}</div>
                                      <div className="text-xs text-boost-text-secondary mt-1">
                                        {cliente.documento} • {cliente.email}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Mostrar dados do cliente selecionado */}
                {formData.clienteSelecionado && (
                  <div className="bg-boost-bg-secondary rounded-lg p-4 mt-4">
                    {(() => {
                      const cliente = clientes.find(c => c.id === formData.clienteSelecionado);
                      if (!cliente) return null;
                      
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-boost-text-primary">Dados do Cliente:</h4>
                            <BoostButton
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({...prev, clienteSelecionado: ""}));
                                setCustomerSearchTerm("");
                              }}
                              className="text-boost-text-secondary hover:text-boost-text-primary"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Limpar seleção
                            </BoostButton>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-boost-text-secondary">Nome:</span>
                              <p className="text-boost-text-primary font-medium">{cliente.nome}</p>
                            </div>
                            <div>
                              <span className="text-boost-text-secondary">Email:</span>
                              <p className="text-boost-text-primary font-medium">{cliente.email}</p>
                            </div>
                            <div>
                              <span className="text-boost-text-secondary">Telefone:</span>
                              <p className="text-boost-text-primary font-medium">{cliente.telefone}</p>
                            </div>
                            {cliente.razaoSocial && (
                              <div className="md:col-span-2">
                                <span className="text-boost-text-secondary">Razão Social:</span>
                                <p className="text-boost-text-primary font-medium">{cliente.razaoSocial}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Formulário para criar novo cliente */}
            {formData.clienteOpcao === "criar" && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-boost-text-primary">Criar Novo Cliente:</h4>
                
                {/* Tipo de pessoa */}
                <div>
                  <Label className="text-boost-text-secondary text-sm">Tipo de Cliente:</Label>
                  <RadioGroup 
                    value={novoCliente.tipo}
                    onValueChange={(value: 'pf' | 'pj') => setNovoCliente(prev => ({...prev, tipo: value}))}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pf" id="pf" />
                      <Label htmlFor="pf">Pessoa Física</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pj" id="pj" />
                      <Label htmlFor="pj">Pessoa Jurídica</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-boost-text-secondary text-sm">
                      {novoCliente.tipo === 'pf' ? 'Nome Completo' : 'Nome Fantasia'} *
                    </Label>
                    <BoostInput
                      name="nome"
                      autoComplete="name"
                      placeholder={novoCliente.tipo === 'pf' ? 'João Silva' : 'Empresa LTDA'}
                      value={novoCliente.nome}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNovoCliente(prev => ({...prev, nome: value}));
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-boost-text-secondary text-sm">
                      {novoCliente.tipo === 'pf' ? 'CPF' : 'CNPJ'} *
                    </Label>
                    <BoostInput
                      name="documento"
                      autoComplete="off"
                      placeholder={novoCliente.tipo === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      value={novoCliente.documento}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNovoCliente(prev => ({...prev, documento: value}));
                      }}
                    />
                  </div>

                  {novoCliente.tipo === 'pj' && (
                    <div className="md:col-span-2">
                      <Label className="text-boost-text-secondary text-sm">Razão Social</Label>
                      <BoostInput
                        name="razaoSocial"
                        autoComplete="organization"
                        placeholder="Empresa LTDA"
                        value={novoCliente.razaoSocial}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setNovoCliente(prev => ({...prev, razaoSocial: value}));
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-boost-text-secondary text-sm">Email *</Label>
                    <BoostInput
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="contato@email.com"
                      value={novoCliente.email}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNovoCliente(prev => ({...prev, email: value}));
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-boost-text-secondary text-sm">Telefone</Label>
                    <BoostInput
                      name="telefone"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      value={novoCliente.telefone}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setNovoCliente(prev => ({...prev, telefone: value}));
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <BoostButton
                    onClick={handleCriarNovoCliente}
                    className="min-w-32"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Cliente
                  </BoostButton>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 4. Dados da Cobrança */}
        <SectionCard
          number={4}
          title="Dados da Cobrança"
          subtitle={formData.valor ? (() => {
            try {
              // Remover qualquer formatação e converter para número
              const valorLimpo = formData.valor.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.');
              const valorNumerico = parseFloat(valorLimpo);
              return !isNaN(valorNumerico) ? formatCurrency(valorNumerico) : "Sem valor";
            } catch {
              return "Sem valor";
            }
          })() : "Sem valor"}
          open={openSections.dados}
          onOpenChange={(open) => toggleSection("dados", open)}
        >
          <div className="pt-4 space-y-4">
            {formData.produtoOpcao !== "nenhum" && formData.produtosSelecionados.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-boost-text-secondary">
                  <span className="font-medium text-boost-text-primary">ℹ️ Produto(s) selecionado(s):</span> Os dados abaixo foram preenchidos automaticamente. Você pode editá-los se necessário.
                </p>
              </div>
            )}
            <div>
              <Label className="text-boost-text-secondary text-sm">Valor <span className="text-red-500">*</span></Label>
              <BoostInput
                placeholder="R$ 0,00"
                value={formData.valor}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value);
                  setFormData(prev => ({...prev, valor: formatted}));
                }}
              />
            </div>
            <div>
              <Label className="text-boost-text-secondary text-sm">Descrição <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Descrição do pagamento"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </SectionCard>

        {/* 5. Informações Adicionais */}
        <SectionCard
          number={5}
          title="Informações Adicionais"
          subtitle="Adicione descrições extras na cobrança. Elas serão exibidas no link de pagamento e no extrato. (Opcional)"
          open={openSections.informacoes}
          onOpenChange={(open) => toggleSection("informacoes", open)}
        >
          <div className="pt-4 space-y-4">
            {formData.informacoesAdicionais.map((info, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BoostInput placeholder="Título" />
                <BoostInput placeholder="Descrição" />
              </div>
            ))}
            <BoostButton
              variant="outline"
              onClick={addInformacaoAdicional}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Informação
            </BoostButton>
          </div>
        </SectionCard>

        {/* 6. Splits */}
        <SectionCard
          number={6}
          title="Splits"
          subtitle={getSplitsSubtitle()}
          open={openSections.splits}
          onOpenChange={(open) => toggleSection("splits", open)}
        >
          <div className="pt-4 space-y-4">
            {activeRecipients.length === 0 ? (
              <div className="text-center py-8 text-boost-text-secondary">
                <p className="mb-2">Nenhum recebedor com conta ativa encontrado.</p>
                <p className="text-sm">
                  Vá para <span className="text-boost-accent">Split de Pagamentos → Recebedores</span> para convidar recebedores.
                </p>
              </div>
            ) : (
              <>
                {formData.splits.map((split, index) => (
                  <div key={index} className="bg-boost-bg-secondary border border-boost-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-boost-text-primary">Recebedor #{index + 1}</h4>
                      <BoostButton
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSplit(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </BoostButton>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Seleção do recebedor */}
                      <div>
                        <Label className="text-boost-text-secondary text-sm mb-2 block">Recebedor:</Label>
                        <Select 
                          value={split.recebedorId} 
                          onValueChange={(value) => 
                            setFormData(prev => ({
                              ...prev,
                              splits: prev.splits.map((s, i) => 
                                i === index ? {...s, recebedorId: value} : s
                              )
                            }))
                          }
                        >
                          <SelectTrigger className="bg-boost-bg-primary border-boost-border text-boost-text-primary">
                            <SelectValue placeholder="Selecione um recebedor ativo" />
                          </SelectTrigger>
                          <SelectContent className="bg-boost-bg-secondary border-boost-border">
                            {activeRecipients.map((recipient) => (
                              <SelectItem 
                                key={recipient.id} 
                                value={recipient.id} 
                                className="text-boost-text-primary"
                              >
                                <div className="flex flex-col">
                                  <span>{recipient.name}</span>
                                  <span className="text-xs text-boost-text-secondary">
                                    {recipient.document}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tipo de split */}
                      <div>
                        <Label className="text-boost-text-secondary text-sm mb-2 block">Tipo de split:</Label>
                        <RadioGroup 
                          value={split.tipo}
                          onValueChange={(value: "percentual" | "fixo") => 
                            setFormData(prev => ({
                              ...prev,
                              splits: prev.splits.map((s, i) => 
                                i === index ? {...s, tipo: value, valor: ""} : s
                              )
                            }))
                          }
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentual" id={`percentual-${index}`} />
                            <Label htmlFor={`percentual-${index}`}>Percentual (%)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixo" id={`fixo-${index}`} />
                            <Label htmlFor={`fixo-${index}`}>Valor fixo (R$)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Input de valor */}
                      <div>
                        <Label className="text-boost-text-secondary text-sm mb-2 block">
                          {split.tipo === "percentual" ? "Percentual:" : "Valor fixo:"}
                        </Label>
                        <div className="relative">
                          <BoostInput 
                            placeholder={split.tipo === "percentual" ? "Ex: 10" : "Ex: 50,00"}
                            value={split.valor}
                            onChange={(e) => {
                              let value = e.target.value;
                              
                              // Formatação para percentual (apenas números)
                              if (split.tipo === "percentual") {
                                value = value.replace(/[^0-9]/g, "");
                                if (parseInt(value) > 80) value = "80";
                              }
                              // Formatação para valor fixo (formato monetário)
                              else {
                                value = value.replace(/[^0-9,]/g, "");
                              }
                              
                              setFormData(prev => ({
                                ...prev,
                                splits: prev.splits.map((s, i) => 
                                  i === index ? {...s, valor: value} : s
                                )
                              }));
                            }}
                            className="pr-12"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-boost-text-secondary text-sm">
                            {split.tipo === "percentual" ? "%" : "R$"}
                          </div>
                        </div>
                        {split.tipo === "percentual" && split.valor && (
                          <p className="text-xs text-boost-text-secondary mt-1">
                            Máximo: 80%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <BoostButton
                  variant="outline"
                  onClick={addSplit}
                  className="w-full"
                  disabled={activeRecipients.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar recebedor ao split
                </BoostButton>
              </>
            )}
          </div>
        </SectionCard>

        {/* 7. Tempo para pagamento */}
        <SectionCard
          number={7}
          title="Tempo para pagamento"
          subtitle={getExpirationTime(formData.tempo)}
          open={openSections.tempo}
          onOpenChange={(open) => toggleSection("tempo", open)}
        >
          <div className="pt-4">
            <div className="mb-4">
              <Label className="text-boost-text-secondary text-sm mb-3 block">
                Selecione o prazo de validade do link de pagamento:
              </Label>
            </div>
            <Select 
              value={formData.tempo}
              onValueChange={(value) => setFormData(prev => ({...prev, tempo: value}))}
            >
              <SelectTrigger className="bg-boost-bg-secondary border-boost-border text-boost-text-primary">
                <SelectValue placeholder="Selecione o prazo de validade" />
              </SelectTrigger>
              <SelectContent className="bg-boost-bg-secondary border-boost-border z-[100]">
                <SelectItem value="15min">
                  <div className="flex flex-col">
                    <span className="font-medium">15 minutos</span>
                    <span className="text-xs text-boost-text-secondary">Ideal para pagamentos urgentes</span>
                  </div>
                </SelectItem>
                <SelectItem value="30min">
                  <div className="flex flex-col">
                    <span className="font-medium">30 minutos</span>
                    <span className="text-xs text-boost-text-secondary">Para confirmações rápidas</span>
                  </div>
                </SelectItem>
                <SelectItem value="1h">
                  <div className="flex flex-col">
                    <span className="font-medium">1 hora</span>
                    <span className="text-xs text-boost-text-secondary">Tempo suficiente para decisão</span>
                  </div>
                </SelectItem>
                <SelectItem value="3h">
                  <div className="flex flex-col">
                    <span className="font-medium">3 horas</span>
                    <span className="text-xs text-boost-text-secondary">Para análises mais detalhadas</span>
                  </div>
                </SelectItem>
                <SelectItem value="6h">
                  <div className="flex flex-col">
                    <span className="font-medium">6 horas</span>
                    <span className="text-xs text-boost-text-secondary">Meio período de trabalho</span>
                  </div>
                </SelectItem>
                <SelectItem value="12h">
                  <div className="flex flex-col">
                    <span className="font-medium">12 horas</span>
                    <span className="text-xs text-boost-text-secondary">Período estendido</span>
                  </div>
                </SelectItem>
                <SelectItem value="24h">
                  <div className="flex flex-col">
                    <span className="font-medium">24 horas</span>
                    <span className="text-xs text-boost-text-secondary">Padrão recomendado</span>
                  </div>
                </SelectItem>
                <SelectItem value="36h">
                  <div className="flex flex-col">
                    <span className="font-medium">36 horas</span>
                    <span className="text-xs text-boost-text-secondary">Prazo estendido</span>
                  </div>
                </SelectItem>
                <SelectItem value="infinito">
                  <div className="flex flex-col">
                    <span className="font-medium">Infinito</span>
                    <span className="text-xs text-boost-text-secondary">Link permanente sem prazo de expiração</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        {/* 8. Destino do pagamento */}
        <SectionCard
          number={8}
          title="Destino do pagamento"
          subtitle="BOOST ADMINISTRADORA DE PAGAMENTOS LTDA - CNPJ: 28.620.382/0001-75"
          open={openSections.destino}
          onOpenChange={(open) => toggleSection("destino", open)}
        >
          <div className="pt-4 space-y-4">
            <div>
              <Label className="text-boost-text-secondary text-sm">Razão Social:</Label>
              <p className="text-boost-text-primary font-medium">
                {formData.destinoPagamento.razaoSocial}
              </p>
            </div>
            <div>
              <Label className="text-boost-text-secondary text-sm">CNPJ:</Label>
              <p className="text-boost-text-primary font-medium">
                {formData.destinoPagamento.cnpj}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-boost-border">
        <BoostButton
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </BoostButton>
        <BoostButton
          onClick={handleCriarCobranca}
          className="min-w-32"
        >
          Criar Cobrança
        </BoostButton>
      </div>
    </div>
  );
};

export default Cobranca;