import { useState } from "react";
import { BoostCard, BoostCardContent, BoostCardHeader, BoostCardTitle } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar as CalendarIcon, Wallet, TrendingUp } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "entrada" | "saida" | "taxa" | "saque";
  amount: number;
  status: "concluido" | "pendente" | "processando";
}

const mockTransactions: Transaction[] = [
  { id: "1", date: "2024-01-15T10:30:00", description: "Venda para João Silva", type: "entrada", amount: 150.00, status: "concluido" },
  { id: "2", date: "2024-01-15T10:30:30", description: "Taxa da transação TXN123", type: "taxa", amount: -7.50, status: "concluido" },
  { id: "3", date: "2024-01-14T15:20:00", description: "Estorno da venda TXN456", type: "saida", amount: -80.00, status: "concluido" },
  { id: "4", date: "2024-01-13T09:15:00", description: "Saque para Conta Itaú", type: "saque", amount: -200.00, status: "processando" },
  { id: "5", date: "2024-01-12T14:45:00", description: "Venda para Maria Santos", type: "entrada", amount: 320.50, status: "concluido" },
];

export default function Financial() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("todos");

  const availableBalance = 1250.75;
  const pendingBalance = 890.30;

  const getStatusBadge = (status: string) => {
    const variants = {
      concluido: "default",
      pendente: "secondary",
      processando: "secondary",
      enviado: "secondary",
      falhou: "destructive"
    } as const;
    
    const labels = {
      concluido: "Concluído",
      pendente: "Pendente", 
      processando: "Processando",
      enviado: "Enviado",
      falhou: "Falhou"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrada": return "↗️";
      case "saida": return "↙️";
      case "taxa": return "⚡";
      case "saque": return "💰";
      default: return "📝";
    }
  };

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

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (typeFilter !== "todos" && transaction.type !== typeFilter) return false;
    
    if (dateRange?.from && dateRange?.to) {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-boost-text-primary">Financeiro</h1>
          <p className="text-boost-text-secondary">Gerencie seu fluxo de caixa e extrato</p>
        </div>
      </div>

      <div className="space-y-6">
          {/* Cards de Saldo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BoostCard>
              <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <BoostCardTitle className="text-sm font-medium">
                  Saldo Disponível
                </BoostCardTitle>
                <Wallet className="h-4 w-4 text-boost-accent" />
              </BoostCardHeader>
              <BoostCardContent>
                <div className="text-2xl font-bold text-boost-text-primary">
                  R$ {availableBalance.toFixed(2)}
                </div>
                <p className="text-xs text-boost-text-secondary mt-2">
                  Saldo disponível para transferência
                </p>
              </BoostCardContent>
            </BoostCard>

            <BoostCard>
              <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <BoostCardTitle className="text-sm font-medium">
                  Saldo a Receber
                </BoostCardTitle>
                <TrendingUp className="h-4 w-4 text-boost-accent" />
              </BoostCardHeader>
              <BoostCardContent>
                <div className="text-2xl font-bold text-boost-text-primary">
                  R$ {pendingBalance.toFixed(2)}
                </div>
                <p className="text-xs text-boost-text-secondary">
                  Vendas parceladas e prazos de recebimento
                </p>
              </BoostCardContent>
            </BoostCard>
          </div>

          {/* Filtros do Extrato */}
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle>Filtros do Extrato</BoostCardTitle>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[280px]">
                  <Label>Período</Label>
                  <div className="space-y-2">
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
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>Tipo de Movimentação</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-boost-bg-primary border-boost-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-boost-bg-secondary border-boost-border">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entrada">Entradas</SelectItem>
                      <SelectItem value="saida">Saídas</SelectItem>
                      <SelectItem value="taxa">Taxas</SelectItem>
                      <SelectItem value="saque">Saques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <BoostButton variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </BoostButton>
                </div>
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* Tabela de Extrato */}
          <BoostCard>
            <BoostCardHeader>
              <BoostCardTitle>Extrato Financeiro</BoostCardTitle>
            </BoostCardHeader>
            <BoostCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-boost-border">
                    <TableHead className="text-boost-text-secondary">Data/Hora</TableHead>
                    <TableHead className="text-boost-text-secondary">Descrição</TableHead>
                    <TableHead className="text-boost-text-secondary">Tipo</TableHead>
                    <TableHead className="text-boost-text-secondary">Status</TableHead>
                    <TableHead className="text-boost-text-secondary text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-boost-border">
                      <TableCell className="text-boost-text-primary">
                        {format(new Date(transaction.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-boost-text-primary">{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getTypeIcon(transaction.type)}</span>
                          <span className="text-boost-text-primary capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}R$ {Math.abs(transaction.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </BoostCardContent>
            </BoostCard>
        </div>
    </div>
  );
}