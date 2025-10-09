import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, User, Package } from "lucide-react";
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
import { useClients } from "@/contexts/ClientsContext";

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
  description?: string;
  price: number;
  createdAt: Date;
}


const Cobranca = () => {
  const navigate = useNavigate();
  const { clients } = useClients();
  
  // Converter clientes do contexto para o formato usado em Cobranca
  const clientes = clients.map(c => ({
    id: c.id,
    nome: c.name,
    email: c.email,
    telefone: c.phone,
    documento: "", // Campo não existe no contexto básico
    tipo: 'pf' as 'pf' | 'pj',
    razaoSocial: undefined,
    createdAt: new Date()
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

  // Mock data dos produtos (mesma estrutura da tela Produtos)
  const [products, setProducts] = useState<Product[]>([]);

  // Carregar produtos do localStorage ao montar o componente
  useEffect(() => {
    const produtosSalvos = localStorage.getItem('boost-produtos');
    if (produtosSalvos) {
      const produtosParseados = JSON.parse(produtosSalvos);
      // Converter as datas de string para Date
      const produtosComDatas = produtosParseados.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
      setProducts(produtosComDatas);
    } else {
      // Produtos iniciais mock se não houver nada no localStorage
      const produtosIniciais: Product[] = [
        {
          id: "prod_FXZtYydpFLYqNa",
          name: "cerveja",
          description: "Cerveja gelada premium",
          price: 10.00,
          createdAt: new Date("2025-09-25T22:21:00"),
        },
        {
          id: "prod_Q26E6ckXuJCoWB",
          name: "coloca",
          description: "Produto coloca",
          price: 20.00,
          createdAt: new Date("2025-09-25T22:21:00"),
        },
      ];
      setProducts(produtosIniciais);
      localStorage.setItem('boost-produtos', JSON.stringify(produtosIniciais));
    }
  }, []);

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

  const handleCriarNovoCliente = () => {
    // Validação simples
    if (!novoCliente.nome || !novoCliente.email) {
      toast({
        title: "Erro na validação",
        description: "Preencha nome e email do cliente",
        variant: "destructive"
      });
      return;
    }

    try {
      // Salvar diretamente no localStorage no formato do Cobranca
      const clientesExistentes = JSON.parse(localStorage.getItem('boost-clientes') || '[]');
      const clienteCriado = {
        ...novoCliente,
        id: `CLI${Date.now()}`,
        createdAt: new Date()
      };
      
      const todosClientes = [...clientesExistentes, clienteCriado];
      localStorage.setItem('boost-clientes', JSON.stringify(todosClientes));
      
      // Selecionar automaticamente o cliente criado
      setFormData(prev => ({
        ...prev,
        clienteOpcao: "selecionar",
        clienteSelecionado: clienteCriado.id
      }));

      // Limpar formulário
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
        description: `${clienteCriado.nome} foi adicionado e selecionado para esta cobrança.`
      });
      
      // Forçar reload para aparecer no contexto
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro ao criar cliente",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleCriarNovoProduto = () => {
    // Validação simples
    if (!novoProduto.name || !novoProduto.price) {
      toast({
        title: "Erro na validação",
        description: "Preencha o nome e o valor do produto",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remover formatação: limpar tudo exceto números e vírgula
      const valorLimpo = novoProduto.price.replace(/[^\d,]/g, '');
      
      console.log('[DEBUG] novoProduto.price original:', novoProduto.price);
      console.log('[DEBUG] valorLimpo:', valorLimpo);
      
      // Converter vírgula para ponto e parsear
      const valorNumerico = parseFloat(valorLimpo.replace(',', '.'));
      
      console.log('[DEBUG] Criando produto - valorNumerico:', valorNumerico);
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        toast({
          title: "Erro na validação",
          description: "Digite um valor válido maior que zero",
          variant: "destructive"
        });
        return;
      }
      
      const produtoCriado: Product = {
        id: `prod_${Date.now()}`,
        name: novoProduto.name,
        description: novoProduto.description,
        price: valorNumerico,
        createdAt: new Date()
      };
      
      // Adicionar produto à lista local
      setProducts(prev => [produtoCriado, ...prev]);
      
      // Salvar no localStorage para aparecer na tela de Produtos
      const produtosExistentes = JSON.parse(localStorage.getItem('boost-produtos') || '[]');
      const todosProdutos = [produtoCriado, ...produtosExistentes];
      localStorage.setItem('boost-produtos', JSON.stringify(todosProdutos));
      
      // Formatar valor para o campo de cobrança (mesma formatação que o input usa)
      const valorFormatado = formatCurrencyInput((valorNumerico * 100).toString());
      
      console.log('[DEBUG] Valor formatado para formData:', valorFormatado);
      
      // Selecionar automaticamente o produto criado e preencher dados
      setFormData(prev => ({
        ...prev,
        produtoOpcao: "selecionar",
        produtosSelecionados: [produtoCriado.id],
        valor: valorFormatado,
        descricao: novoProduto.description || novoProduto.name
      }));

      // Limpar formulário
      setNovoProduto({
        name: "",
        description: "",
        price: ""
      });

      toast({
        title: "Produto criado com sucesso!",
        description: `${produtoCriado.name} foi adicionado e selecionado para esta cobrança.`
      });
    } catch (error) {
      toast({
        title: "Erro ao criar produto",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
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
          <h1 className="text-2xl font-bold text-boost-text-primary">Nova Cobrança</h1>
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
                {products.length === 0 ? (
                  <div className="p-8 text-center text-boost-text-secondary border border-boost-border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Nenhum produto cadastrado</p>
                    <p className="text-xs mt-1">Crie um novo produto ou cadastre na tela de Produtos</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-boost-text-secondary text-sm mb-3 block">
                        Selecione um ou mais produtos:
                      </Label>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto border border-boost-border rounded-lg p-2">
                        {products.map((produto) => (
                          <div
                            key={produto.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-boost-bg-secondary border border-boost-border cursor-pointer"
                            onClick={() => {
                              const isSelected = formData.produtosSelecionados.includes(produto.id);
                              const newSelection = isSelected
                                ? formData.produtosSelecionados.filter(id => id !== produto.id)
                                : [...formData.produtosSelecionados, produto.id];
                              
                              // Calcular valor total
                              const produtosSelecionados = products.filter(p => newSelection.includes(p.id));
                              const valorTotal = produtosSelecionados.reduce((sum, p) => sum + (p.price || 0), 0);
                              const valorFormatado = valorTotal.toFixed(2).replace('.', ',');
                              
                              // Criar descrição com todos os produtos
                              const descricao = produtosSelecionados.map(p => p.name).join(', ');
                              
                              setFormData(prev => ({
                                ...prev,
                                produtosSelecionados: newSelection,
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
                                  <p className="font-medium text-boost-text-primary truncate">
                                    {produto.name}
                                  </p>
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
                        ))}
                      </div>
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
                            
                            return (
                              <div key={produtoId} className="flex items-center justify-between text-sm py-2 border-b border-boost-border last:border-0">
                                <div className="flex-1">
                                  <p className="font-medium text-boost-text-primary">{produto.name}</p>
                                  {produto.description && (
                                    <p className="text-xs text-boost-text-secondary">{produto.description}</p>
                                  )}
                                </div>
                                <span className="font-semibold text-boost-text-primary ml-4">
                                  {formatCurrency(produto.price)}
                                </span>
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-between pt-3 border-t border-boost-border">
                            <span className="font-semibold text-boost-text-primary">Valor Total:</span>
                            <span className="text-lg font-bold text-boost-text-primary">
                              {formatCurrency(
                                products
                                  .filter(p => formData.produtosSelecionados.includes(p.id))
                                  .reduce((sum, p) => sum + (p.price || 0), 0)
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
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Produto
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
                <div>
                  <Label className="text-boost-text-secondary text-sm">Selecione um cliente: <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.clienteSelecionado} 
                    onValueChange={(value) => setFormData(prev => ({...prev, clienteSelecionado: value}))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Escolha um cliente cadastrado" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.length === 0 ? (
                        <div className="p-4 text-center text-boost-text-secondary">
                          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum cliente cadastrado</p>
                          <p className="text-xs">Crie um novo cliente ou solicite o cadastro</p>
                        </div>
                      ) : (
                        clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{cliente.nome}</span>
                              <span className="text-xs text-boost-text-secondary">
                                {cliente.documento} • {cliente.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mostrar dados do cliente selecionado */}
                {formData.clienteSelecionado && (
                  <div className="bg-boost-bg-secondary rounded-lg p-4 mt-4">
                    {(() => {
                      const cliente = clientes.find(c => c.id === formData.clienteSelecionado);
                      if (!cliente) return null;
                      
                      return (
                        <div>
                          <h4 className="font-medium text-boost-text-primary mb-3">Dados do Cliente:</h4>
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