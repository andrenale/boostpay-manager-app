import { useState } from "react";
import { TrendingUp, TrendingDown, CreditCard, Zap, DollarSign, CheckCircle, Clock, Users, Calendar as CalendarIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostBadge } from "@/components/ui/boost-badge";
import { BoostButton } from "@/components/ui/boost-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Mock user data - em uma aplicação real, viria do contexto de autenticação ou localStorage
  const userData = {
    name: "Maria Santos", // Altere aqui para testar: "João Silva", "Ana Paula", etc.
    gender: "feminino" // Altere aqui para testar: "masculino" ou "feminino"
  };

  // Função para personalizar a saudação baseada no gênero
  const getWelcomeMessage = (name: string, gender: string) => {
    const firstName = name.split(" ")[0];
    const welcomeText = gender === "feminino" ? "Bem-vinda" : "Bem-vindo";
    return `${welcomeText} de volta, ${firstName}! 👋`;
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

  // Mock data for charts
  const revenueData = [
    { name: "Jan", value: 12000 },
    { name: "Fev", value: 19000 },
    { name: "Mar", value: 15000 },
    { name: "Abr", value: 25000 },
    { name: "Mai", value: 22000 },
    { name: "Jun", value: 30000 },
    { name: "Jul", value: 28000 },
  ];

  const paymentMethodData = [
    { name: "Cartão de Crédito", value: 65, color: "#00BFFF" },
    { name: "PIX", value: 35, color: "#38A169" },
  ];

  const recentTransactions = [
    { id: "TXN001", client: "João Silva", amount: 299.90, status: "success" },
    { id: "TXN002", client: "Maria Santos", amount: 150.00, status: "success" },
    { id: "TXN003", client: "Pedro Costa", amount: 89.50, status: "warning" },
    { id: "TXN004", client: "Ana Paula", amount: 420.00, status: "success" },
    { id: "TXN005", client: "Carlos Lima", amount: 75.25, status: "error" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-fade-in flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-boost-text-primary mb-2">
            {getWelcomeMessage(userData.name, userData.gender)}
          </h1>
          <p className="text-boost-text-secondary">
            Você teve 15 novas vendas hoje. Aqui está um resumo da sua atividade.
          </p>
        </div>
        
        {/* Compact Date Filter */}
        <div className="flex items-center gap-2 ml-6">
          <span className="text-sm text-boost-text-secondary font-medium">Período:</span>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "justify-start text-left font-normal min-w-[200px] h-9 bg-boost-bg-secondary border-boost-border hover:bg-boost-bg-tertiary",
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
            <PopoverContent className="w-auto p-0" align="end">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        {/* Total Sales */}
        <BoostCard>
          <BoostCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-boost-text-secondary text-sm font-medium">Total de Vendas (Mês)</p>
                <p className="text-2xl font-bold text-boost-text-primary">R$ 156.280</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-status-success mr-1" />
                  <span className="text-status-success text-sm">+12.5%</span>
                  <span className="text-boost-text-muted text-sm ml-2">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-boost-accent/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-boost-accent" />
              </div>
            </div>
          </BoostCardContent>
        </BoostCard>

        {/* Net Revenue */}
        <BoostCard>
          <BoostCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-boost-text-secondary text-sm font-medium">Receita Líquida (Mês)</p>
                <p className="text-2xl font-bold text-boost-text-primary">R$ 142.105</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-status-success mr-1" />
                  <span className="text-status-success text-sm">+8.2%</span>
                  <span className="text-boost-text-muted text-sm ml-2">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-status-success/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-status-success" />
              </div>
            </div>
          </BoostCardContent>
        </BoostCard>

        {/* Approved Transactions */}
        <BoostCard>
          <BoostCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-boost-text-secondary text-sm font-medium">Transações Aprovadas (Hoje)</p>
                <p className="text-2xl font-bold text-boost-text-primary">247</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-status-success mr-1" />
                  <span className="text-status-success text-sm">98.7%</span>
                  <span className="text-boost-text-muted text-sm ml-2">taxa de aprovação</span>
                </div>
              </div>
              <div className="p-3 bg-status-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-status-success" />
              </div>
            </div>
          </BoostCardContent>
        </BoostCard>

        {/* Approval Rate */}
        <BoostCard>
          <BoostCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-boost-text-secondary text-sm font-medium">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-boost-text-primary">96.4%</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-status-error mr-1" />
                  <span className="text-status-error text-sm">-1.2%</span>
                  <span className="text-boost-text-muted text-sm ml-2">vs semana anterior</span>
                </div>
              </div>
              <div className="p-3 bg-status-info/10 rounded-lg">
                <Zap className="h-6 w-6 text-status-info" />
              </div>
            </div>
          </BoostCardContent>
        </BoostCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
        {/* Revenue Chart */}
        <BoostCard>
          <BoostCardHeader>
            <BoostCardTitle>Receita por Período</BoostCardTitle>
            <BoostCardDescription>Últimos 7 meses</BoostCardDescription>
          </BoostCardHeader>
          <BoostCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-color))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--text-secondary))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--text-secondary))"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background-secondary))", 
                    border: "1px solid hsl(var(--border-color))",
                    borderRadius: "8px",
                    color: "hsl(var(--text-primary))"
                  }}
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, "Receita"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--accent-blue))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent-blue))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--accent-blue))", fill: "hsl(var(--accent-blue))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </BoostCardContent>
        </BoostCard>

        {/* Payment Methods Chart */}
        <BoostCard>
          <BoostCardHeader>
            <BoostCardTitle>Vendas por Método de Pagamento</BoostCardTitle>
            <BoostCardDescription>Distribuição dos métodos utilizados</BoostCardDescription>
          </BoostCardHeader>
          <BoostCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background-secondary))", 
                    border: "1px solid hsl(var(--border-color))",
                    borderRadius: "8px",
                    color: "hsl(var(--text-primary))"
                  }}
                  formatter={(value) => [`${value}%`, "Percentual"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-boost-accent rounded-full mr-2"></div>
                <span className="text-sm text-boost-text-secondary">Cartão de Crédito (65%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-status-success rounded-full mr-2"></div>
                <span className="text-sm text-boost-text-secondary">PIX (35%)</span>
              </div>
            </div>
          </BoostCardContent>
        </BoostCard>
      </div>

      {/* Recent Activity */}
      <BoostCard className="animate-slide-up">
        <BoostCardHeader>
          <BoostCardTitle>Atividade Recente</BoostCardTitle>
          <BoostCardDescription>Últimas 5 transações processadas</BoostCardDescription>
        </BoostCardHeader>
        <BoostCardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-boost-bg-tertiary/50 rounded-lg hover:bg-boost-bg-tertiary transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-boost-bg-secondary rounded-full">
                    <Users className="h-4 w-4 text-boost-text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-boost-text-primary">{transaction.client}</p>
                    <p className="text-sm text-boost-text-secondary">ID: {transaction.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="font-semibold text-boost-text-primary">
                    R$ {transaction.amount.toFixed(2)}
                  </p>
                  <BoostBadge variant={
                    transaction.status === "success" ? "success" :
                    transaction.status === "warning" ? "warning" : 
                    "error"
                  }>
                    {transaction.status === "success" && "Aprovada"}
                    {transaction.status === "warning" && "Pendente"}
                    {transaction.status === "error" && "Negada"}
                  </BoostBadge>
                </div>
              </div>
            ))}
          </div>
        </BoostCardContent>
      </BoostCard>
    </div>
  );
};

export default Dashboard;