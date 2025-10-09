import { useState, useEffect } from "react";
import { Search, Filter, Download, MoreVertical, Eye, CreditCard, Zap, Calendar as CalendarIcon } from "lucide-react";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { BoostBadge } from "@/components/ui/boost-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [savedCobrancas, setSavedCobrancas] = useState([]);

  // Carregar cobranças salvas do localStorage
  useEffect(() => {
    const cobrancasSalvas = JSON.parse(localStorage.getItem('boost-cobrancas') || '[]');
    setSavedCobrancas(cobrancasSalvas);

    // Listener para atualizar quando novas cobranças forem criadas
    const handleStorageChange = () => {
      const novasCobrancas = JSON.parse(localStorage.getItem('boost-cobrancas') || '[]');
      setSavedCobrancas(novasCobrancas);
    };

    // Verificar mudanças no localStorage a cada 1 segundo
    const interval = setInterval(handleStorageChange, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mock transactions data
  const mockTransactions = [{
    id: "TXN001234",
    date: "2024-01-15 14:30",
    dateObj: new Date("2024-01-15T14:30:00"),
    client: "João Silva Santos",
    email: "joao@email.com",
    document: "123.456.789-00",
    amount: 299.90,
    method: "Cartão de Crédito",
    methodIcon: CreditCard,
    cardLast4: "4242",
    status: "success",
    statusText: "Aprovada",
    splits: [{
      recipient: "Vendedor",
      amount: 239.92
    }, {
      recipient: "Plataforma",
      amount: 59.98
    }]
  }, {
    id: "TXN001235",
    date: "2024-01-15 13:45",
    dateObj: new Date("2024-01-15T13:45:00"),
    client: "Maria Santos Costa",
    email: "maria@email.com",
    document: "987.654.321-00",
    amount: 150.00,
    method: "PIX",
    methodIcon: Zap,
    pixKey: "maria@email.com",
    status: "success",
    statusText: "Aprovada",
    splits: []
  }, {
    id: "TXN001236",
    date: "2024-01-15 12:15",
    dateObj: new Date("2024-01-15T12:15:00"),
    client: "Pedro Costa Lima",
    email: "pedro@email.com",
    document: "456.789.123-00",
    amount: 89.50,
    method: "Cartão de Crédito",
    methodIcon: CreditCard,
    cardLast4: "1234",
    status: "warning",
    statusText: "Pendente",
    splits: []
  }, {
    id: "TXN001237",
    date: "2024-01-15 11:00",
    dateObj: new Date("2024-01-15T11:00:00"),
    client: "Ana Paula Silva",
    email: "ana@email.com",
    document: "321.654.987-00",
    amount: 420.00,
    method: "PIX",
    methodIcon: Zap,
    pixKey: "321.654.987-00",
    status: "success",
    statusText: "Aprovada",
    splits: [{
      recipient: "Vendedor",
      amount: 378.00
    }, {
      recipient: "Plataforma",
      amount: 42.00
    }]
  }, {
    id: "TXN001238",
    date: "2024-01-15 10:30",
    dateObj: new Date("2024-01-15T10:30:00"),
    client: "Carlos Lima Santos",
    email: "carlos@email.com",
    document: "654.321.987-00",
    amount: 75.25,
    method: "Cartão de Crédito",
    methodIcon: CreditCard,
    cardLast4: "9999",
    status: "error",
    statusText: "Negada",
    splits: []
  }];

  // Converter cobranças salvas para formato de transações
  const convertedCobrancas = savedCobrancas.map((cobranca: any) => ({
    id: cobranca.id,
    date: cobranca.date,
    dateObj: new Date(cobranca.createdAt),
    client: cobranca.client,
    email: cobranca.email,
    document: cobranca.document,
    amount: cobranca.amount != null ? parseFloat(cobranca.amount) : 0,
    method: cobranca.method,
    methodIcon: cobranca.method === "PIX" ? Zap : CreditCard,
    status: cobranca.status === "pending" ? "warning" : cobranca.status,
    statusText: cobranca.status === "pending" ? "Aguardando Pagamento" : cobranca.statusText,
    splits: cobranca.splits || [],
    description: cobranca.description,
    paymentLink: cobranca.paymentLink
  }));

  // Combinar cobranças salvas com transações mock
  const transactions = [...convertedCobrancas, ...mockTransactions];

  const setQuickPeriod = (days: number | "month" | "lastMonth") => {
    const today = new Date();
    if (days === "month") {
      setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
    } else if (days === "lastMonth") {
      const lastMonth = subMonths(today, 1);
      setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
    } else {
      setDateRange({ from: subDays(today, days), to: today });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesMethod = methodFilter === "all" || transaction.method === methodFilter;
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const transactionDate = transaction.dateObj;
      matchesDate = transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    }
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "default" as const;
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-boost-text-primary mb-2">
          Transações
        </h1>
        <p className="text-boost-text-secondary">
          Gerencie e acompanhe todas as suas transações em tempo real.
        </p>
      </div>

      {/* Filters */}
      <BoostCard className="animate-slide-up">
        <BoostCardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 min-w-[280px]">
                <BoostInput placeholder="Buscar por ID ou nome do cliente..." icon={<Search className="h-4 w-4" />} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>

              {/* Date Filter */}
              <div className="min-w-[280px]">
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-boost-bg-secondary border-boost-border hover:bg-boost-bg-tertiary",
                        !dateRange?.from && "text-boost-text-secondary"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateRange?.from && dateRange?.to ? (
                        <>
                          {format(dateRange.from < dateRange.to ? dateRange.from : dateRange.to, "dd/MM")} - {format(dateRange.from < dateRange.to ? dateRange.to : dateRange.from, "dd/MM")}
                        </>
                      ) : (
                        <span className="text-sm">Selecionar período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setQuickPeriod(0)}>
                          Hoje
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setQuickPeriod(7)}>
                          7 dias
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setQuickPeriod(30)}>
                          30 dias
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setQuickPeriod("month")}>
                          Este mês
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setQuickPeriod("lastMonth")}>
                          Mês passado
                        </Button>
                      </div>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(date) => date > new Date()}
                        className={cn("p-3 pointer-events-auto")}
                        locale={ptBR}
                      />
                      <div className="px-3 pb-3 border-t border-boost-border">
                        <Button 
                          size="sm" 
                          className="w-full h-9"
                          onClick={() => setIsDatePickerOpen(false)}
                          disabled={!dateRange?.from || !dateRange?.to}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-boost-bg-secondary border-boost-border text-boost-text-primary">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-boost-bg-secondary border-boost-border">
                  <SelectItem value="all" className="text-boost-text-primary">Todos os status</SelectItem>
                  <SelectItem value="success" className="text-boost-text-primary">Aprovada</SelectItem>
                  <SelectItem value="warning" className="text-boost-text-primary">Pendente</SelectItem>
                  <SelectItem value="error" className="text-boost-text-primary">Negada</SelectItem>
                </SelectContent>
              </Select>

              {/* Method Filter */}
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[180px] bg-boost-bg-secondary border-boost-border text-boost-text-primary">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent className="bg-boost-bg-secondary border-boost-border">
                  <SelectItem value="all" className="text-boost-text-primary">Todos os métodos</SelectItem>
                  <SelectItem value="Cartão de Crédito" className="text-boost-text-primary">Cartão de Crédito</SelectItem>
                  <SelectItem value="PIX" className="text-boost-text-primary">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <BoostButton variant="secondary" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </BoostButton>
          </div>
        </BoostCardContent>
      </BoostCard>

      {/* Transactions Table */}
      <BoostCard className="animate-slide-up">
        <BoostCardHeader>
          <BoostCardTitle>Todas as Transações</BoostCardTitle>
        </BoostCardHeader>
        <BoostCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-boost-bg-tertiary border-b border-boost-border">
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">ID</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Data</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Cliente</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Valor</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Método</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Status</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => <tr key={transaction.id} className="border-b border-boost-border hover:bg-boost-bg-tertiary/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-boost-text-primary">
                      {transaction.id}
                    </td>
                    <td className="py-4 px-6 text-boost-text-secondary">
                      {transaction.date}
                    </td>
                    <td className="py-4 px-6 text-boost-text-primary">
                      {transaction.client}
                    </td>
                    <td className="py-4 px-6 font-semibold text-boost-text-primary">
                      R$ {(transaction.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <transaction.methodIcon className="h-4 w-4 text-boost-text-secondary" />
                        <span className="text-boost-text-secondary">{transaction.method}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <BoostBadge variant={getStatusVariant(transaction.status)}>
                        {transaction.statusText}
                      </BoostBadge>
                    </td>
                    <td className="py-4 px-6">
                      <Sheet>
                        <SheetTrigger asChild>
                          <BoostButton variant="ghost" size="icon" onClick={() => setSelectedTransaction(transaction)}>
                            <Eye className="h-4 w-4" />
                          </BoostButton>
                        </SheetTrigger>
                        <SheetContent className="bg-boost-bg-secondary border-boost-border w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle className="text-boost-text-primary">
                              Detalhes da Transação
                            </SheetTitle>
                            <SheetDescription className="text-boost-text-secondary">
                              ID: {selectedTransaction?.id}
                            </SheetDescription>
                          </SheetHeader>
                          
                          {selectedTransaction && <div className="mt-6 space-y-6">
                              {/* Transaction Summary */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-boost-text-primary">Resumo</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Status</p>
                                    <BoostBadge variant={getStatusVariant(selectedTransaction.status)}>
                                      {selectedTransaction.statusText}
                                    </BoostBadge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Valor</p>
                                    <p className="font-semibold text-boost-text-primary">
                                      R$ {(selectedTransaction.amount || 0).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-boost-text-secondary">Data/Hora</p>
                                    <p className="text-boost-text-primary">{selectedTransaction.date}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Details */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-boost-text-primary">Dados do Pagamento</h3>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Método</p>
                                    <div className="flex items-center space-x-2">
                                      <selectedTransaction.methodIcon className="h-4 w-4 text-boost-text-secondary" />
                                      <span className="text-boost-text-primary">{selectedTransaction.method}</span>
                                    </div>
                                  </div>
                                  {selectedTransaction.cardLast4 && <div>
                                      <p className="text-sm text-boost-text-secondary">Cartão</p>
                                      <p className="text-boost-text-primary">**** **** **** {selectedTransaction.cardLast4}</p>
                                    </div>}
                                  {selectedTransaction.pixKey && <div>
                                      <p className="text-sm text-boost-text-secondary">Chave PIX</p>
                                      <p className="text-boost-text-primary">{selectedTransaction.pixKey}</p>
                                    </div>}
                                </div>
                              </div>

                              {/* Customer Details */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-boost-text-primary">Dados do Cliente</h3>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Nome</p>
                                    <p className="text-boost-text-primary">{selectedTransaction.client}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">E-mail</p>
                                    <p className="text-boost-text-primary">{selectedTransaction.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Documento</p>
                                    <p className="text-boost-text-primary">{selectedTransaction.document}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Split Details */}
                              {selectedTransaction.splits && selectedTransaction.splits.length > 0 && <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-boost-text-primary">Split de Pagamento</h3>
                                  <div className="space-y-2">
                                    {selectedTransaction.splits.map((split: any, index: number) => <div key={index} className="flex justify-between py-2 px-3 bg-boost-bg-tertiary/30 rounded">
                                        <span className="text-boost-text-secondary">{split.recipient}</span>
                                        <span className="text-boost-text-primary font-medium">
                                          R$ {(split.amount || 0).toFixed(2)}
                                        </span>
                                      </div>)}
                                  </div>
                                </div>}

                              {/* Actions */}
                              <div className="pt-4 border-t border-boost-border">
                                <BoostButton variant="destructive" className="w-full">
                                  Estornar Pagamento
                                </BoostButton>
                              </div>
                            </div>}
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-boost-bg-tertiary rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-boost-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-boost-text-primary mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-boost-text-secondary mb-4">
                Ajuste os filtros ou realize sua primeira venda!
              </p>
            </div>}
        </BoostCardContent>
      </BoostCard>
    </div>;
};
export default Transactions;