import { useState } from "react";
import { BoostCard, BoostCardContent, BoostCardHeader, BoostCardTitle } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Upload, Clock, CheckCircle, XCircle, Eye, CalendarIcon, CreditCard, Shield, Filter } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface Dispute {
  id: string;
  transactionId: string;
  client: string;
  amount: number;
  status: "pendente" | "em_analise" | "ganhamos" | "perdemos";
  type: "chargeback" | "med";
  reason: string;
  deadline: string;
  createdAt: string;
  description?: string;
}

interface DisputeEvidence {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

const mockDisputes: Dispute[] = [
  // CHARGEBACKS (Cartão de Crédito/Débito)
  {
    id: "CHB001",
    transactionId: "CARD_789123",
    client: "João Silva",
    amount: 299.90,
    status: "pendente",
    type: "chargeback",
    reason: "Compra não reconhecida",
    description: "Cliente alega não ter autorizado a compra no cartão de crédito",
    deadline: "2025-09-25T23:59:59",
    createdAt: "2025-09-18T10:30:00"
  },
  {
    id: "CHB002",
    transactionId: "CARD_123456",
    client: "Pedro Oliveira da Silva",
    amount: 75.50,
    status: "ganhamos",
    type: "chargeback",
    reason: "Produto não entregue",
    description: "Cliente alega que não recebeu o produto comprado",
    deadline: "2025-09-15T23:59:59",
    createdAt: "2025-09-10T09:15:00"
  },
  {
    id: "CHB003",
    transactionId: "CARD_654321",
    client: "Carlos Pereira",
    amount: 199.00,
    status: "pendente",
    type: "chargeback",
    reason: "Produto diferente do prometido",
    description: "Cliente contesta qualidade do produto recebido",
    deadline: "2025-09-22T14:30:00",
    createdAt: "2025-09-19T11:20:00"
  },
  {
    id: "CHB004",
    transactionId: "CARD_147258",
    client: "Roberto Mendes",
    amount: 350.75,
    status: "em_analise",
    type: "chargeback",
    reason: "Erro de processamento",
    description: "Falha no processamento da transação no cartão",
    deadline: "2025-09-21T12:00:00",
    createdAt: "2025-09-16T15:45:00"
  },
  {
    id: "CHB005",
    transactionId: "CARD_741963",
    client: "Marcelo Santos Jr.",
    amount: 899.99,
    status: "perdemos",
    type: "chargeback",
    reason: "Produto defeituoso",
    description: "Cliente alega que produto chegou com defeito",
    deadline: "2025-09-10T23:59:59",
    createdAt: "2025-09-05T13:20:00"
  },
  {
    id: "CHB006",
    transactionId: "CARD_852741",
    client: "Patrícia Rodrigues",
    amount: 67.80,
    status: "pendente",
    type: "chargeback",
    reason: "Cancelamento não processado",
    description: "Cliente solicitou cancelamento mas não foi processado",
    deadline: "2025-09-23T10:30:00",
    createdAt: "2025-09-18T16:15:00"
  },
  
  // MEDs (PIX - Mecanismo Especial de Devolução)
  {
    id: "MED001", 
    transactionId: "PIX_456789",
    client: "Maria Santos",
    amount: 150.00,
    status: "pendente",
    type: "med",
    reason: "Vítima de golpe",
    description: "Cliente foi enganado e fez PIX para fraudador",
    deadline: "2025-09-24T23:59:59",
    createdAt: "2025-09-20T14:20:00"
  },
  {
    id: "MED002",
    transactionId: "PIX_321987",
    client: "Ana Costa",
    amount: 1450.00,
    status: "perdemos",
    type: "med",
    reason: "Falha operacional do banco",
    description: "PIX processado incorretamente por erro do sistema bancário",
    deadline: "2025-09-12T23:59:59",
    createdAt: "2025-09-10T16:45:00"
  },
  {
    id: "MED003",
    transactionId: "PIX_987654",
    client: "Lucia Ferreira",
    amount: 89.90,
    status: "ganhamos",
    type: "med",
    reason: "PIX enviado por engano",
    description: "Cliente digitou chave PIX errada e enviou para conta incorreta",
    deadline: "2025-09-14T23:59:59",
    createdAt: "2025-09-12T08:15:00"
  },
  {
    id: "MED004",
    transactionId: "PIX_369852",
    client: "Fernanda Lima",
    amount: 25.99,
    status: "pendente",
    type: "med",
    reason: "Golpe do falso vendedor",
    description: "Cliente pagou via PIX mas não recebeu produto de vendedor fraudulento",
    deadline: "2025-09-26T18:00:00",
    createdAt: "2025-09-19T09:30:00"
  },
  {
    id: "MED005",
    transactionId: "PIX_159753",
    client: "Bruno Almeida",
    amount: 520.00,
    status: "ganhamos",
    type: "med",
    reason: "Vítima de sequestro virtual",
    description: "Cliente foi coagido a fazer PIX durante golpe de sequestro virtual",
    deadline: "2025-09-13T23:59:59",
    createdAt: "2025-09-11T11:45:00"
  },
  {
    id: "MED006",
    transactionId: "PIX_753951",
    client: "Ricardo Souza",
    amount: 800.00,
    status: "em_analise",
    type: "med",
    reason: "PIX duplicado por erro",
    description: "Sistema processou o mesmo PIX duas vezes",
    deadline: "2025-09-27T15:30:00",
    createdAt: "2025-09-18T10:15:00"
  },
  {
    id: "MED007",
    transactionId: "PIX_852963",
    client: "Camila Rodrigues",
    amount: 320.00,
    status: "pendente",
    type: "med",
    reason: "Golpe do WhatsApp clonado",
    description: "Cliente foi vítima de golpe com WhatsApp clonado e fez PIX",
    deadline: "2025-09-25T20:00:00",
    createdAt: "2025-09-20T11:30:00"
  }
];

export default function Disputes() {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [defenseText, setDefenseText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<DisputeEvidence[]>([]);
  const [range, setRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [typeFilter, setTypeFilter] = useState<"all" | "chargeback" | "med">("all");
  const [viewedDisputes, setViewedDisputes] = useState<Set<string>>(new Set());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: "secondary",
      em_analise: "secondary", 
      ganhamos: "default",
      perdemos: "outline"
    } as const;
    
    const labels = {
      pendente: "Pendente",
      em_analise: "Em Análise",
      ganhamos: "ganha", 
      perdemos: "perdidas"
    };

    const icons = {
      pendente: <AlertTriangle className="h-3 w-3 mr-1" />,
      em_analise: <Clock className="h-3 w-3 mr-1" />,
      ganhamos: <CheckCircle className="h-3 w-3 mr-1" />,
      perdemos: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "default"} 
        className={cn(
          "flex items-center gap-1 whitespace-nowrap min-w-[90px] justify-center",
          status === "pendente" && "bg-orange-100 text-black hover:bg-orange-200 border-orange-300",
          status === "em_analise" && "bg-yellow-100 text-black hover:bg-yellow-200 border-yellow-300",
          status === "ganhamos" && "text-black",
          status === "perdemos" && "bg-red-100 text-black hover:bg-red-200 border-red-300"
        )}
      >
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: "chargeback" | "med") => {
    const variants = {
      chargeback: "outline",
      med: "secondary"
    } as const;
    
    const labels = {
      chargeback: "Chargeback",
      med: "MED"
    };

    const icons = {
      chargeback: <CreditCard className="h-3 w-3 mr-1" />,
      med: <Shield className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={variants[type]} className="flex items-center">
        {icons[type]}
        {labels[type]}
      </Badge>
    );
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft <= 0) {
      return { text: "Vencido", className: "text-red-600 font-bold" };
    } else if (hoursLeft <= 24) {
      return { text: `${Math.ceil(hoursLeft)}h restantes`, className: "text-orange-600 font-semibold" };
    } else {
      const daysLeft = Math.ceil(hoursLeft / 24);
      return { text: `${daysLeft} dias restantes`, className: "text-boost-text-secondary" };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: DisputeEvidence[] = Array.from(files).map((file, index) => ({
        id: `file_${Date.now()}_${index}`,
        name: file.name,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmitDefense = () => {
    if (!defenseText.trim() && uploadedFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione evidências ou escreva uma defesa",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "✅ Defesa enviada com sucesso!",
      description: "Sua defesa foi enviada e está sendo analisada"
    });

    setSelectedDispute(null);
    setDefenseText("");
    setUploadedFiles([]);
  };

  const setQuickPeriod = (days: number | "month" | "lastMonth") => {
    const today = new Date();
    if (days === "month") {
      setRange({ from: startOfMonth(today), to: endOfMonth(today) });
    } else if (days === "lastMonth") {
      const lastMonth = subMonths(today, 1);
      setRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
    } else {
      setRange({ from: subDays(today, days), to: today });
    }
  };

  const filteredDisputes = mockDisputes.filter(dispute => {
    // Filtro por data
    if (range?.from && range?.to) {
      const disputeDate = new Date(dispute.createdAt);
      // Normalizar a ordem das datas (garantir que from <= to)
      const fromDate = range.from < range.to ? range.from : range.to;
      const toDate = range.from < range.to ? range.to : range.from;
      
      const isInRange = isWithinInterval(disputeDate, {
        start: startOfDay(fromDate),
        end: endOfDay(toDate)
      });
      
      if (!isInRange) {
        return false;
      }
    }
    
    // Filtro por tipo
    if (typeFilter !== "all" && dispute.type !== typeFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-boost-text-primary">Disputas</h1>
          <p className="text-boost-text-secondary">Gerencie contestações de pagamento</p>
          <div className="mt-2 text-sm text-boost-text-secondary">
            <span className="font-medium">Chargeback:</span> Contestações de compras no cartão • 
            <span className="font-medium ml-2">MED:</span> Devoluções de PIX por fraude/erro
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-boost-text-secondary font-medium">Tipo:</span>
            <Select value={typeFilter} onValueChange={(value: "all" | "chargeback" | "med") => setTypeFilter(value)}>
              <SelectTrigger className="w-[140px] h-9 bg-boost-bg-secondary border-boost-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="chargeback">Chargeback</SelectItem>
                <SelectItem value="med">MED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-boost-text-secondary font-medium">Período:</span>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "justify-start text-left font-normal min-w-[200px] h-9 bg-boost-bg-secondary border-boost-border hover:bg-boost-bg-tertiary",
                    !range?.from && "text-boost-text-secondary"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {range?.from && range?.to ? (
                    <>
                      {format(range.from < range.to ? range.from : range.to, "dd/MM")} - {format(range.from < range.to ? range.to : range.from, "dd/MM")}
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
                selected={range}
                onSelect={setRange}
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
                  disabled={!range?.from || !range?.to}
                >
                  Aplicar
                </Button>
              </div>
            </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <BoostCard>
          <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <BoostCardTitle className="text-sm font-medium">Chargebacks</BoostCardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </BoostCardHeader>
          <BoostCardContent>
            <div className="text-2xl font-bold text-boost-text-primary">
              {filteredDisputes.filter(d => d.type === "chargeback").length}
            </div>
          </BoostCardContent>
        </BoostCard>

        <BoostCard>
          <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <BoostCardTitle className="text-sm font-medium">MEDs</BoostCardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </BoostCardHeader>
          <BoostCardContent>
            <div className="text-2xl font-bold text-boost-text-primary">
              {filteredDisputes.filter(d => d.type === "med").length}
            </div>
          </BoostCardContent>
        </BoostCard>

        <BoostCard>
          <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <BoostCardTitle className="text-sm font-medium">Pendentes</BoostCardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </BoostCardHeader>
          <BoostCardContent>
            <div className="text-2xl font-bold text-boost-text-primary">
              {filteredDisputes.filter(d => d.status === "pendente").length}
            </div>
          </BoostCardContent>
        </BoostCard>

        <BoostCard>
          <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <BoostCardTitle className="text-sm font-medium">Em Análise</BoostCardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </BoostCardHeader>
          <BoostCardContent>
            <div className="text-2xl font-bold text-boost-text-primary">
              {filteredDisputes.filter(d => d.status === "em_analise").length}
            </div>
          </BoostCardContent>
        </BoostCard>

        <BoostCard>
          <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <BoostCardTitle className="text-sm font-medium">Ganhas</BoostCardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </BoostCardHeader>
          <BoostCardContent>
            <div className="text-2xl font-bold text-boost-text-primary">
              {filteredDisputes.filter(d => d.status === "ganhamos").length}
            </div>
          </BoostCardContent>
        </BoostCard>

        <BoostCard>
          <BoostCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <BoostCardTitle className="text-sm font-medium">Perdidas</BoostCardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </BoostCardHeader>
          <BoostCardContent>
            <div className="text-2xl font-bold text-boost-text-primary">
              {filteredDisputes.filter(d => d.status === "perdemos").length}
            </div>
          </BoostCardContent>
        </BoostCard>
      </div>

      {/* Tabela de Disputas */}
      <BoostCard>
        <BoostCardHeader>
          <div className="flex items-center gap-3">
            <BoostCardTitle>Lista de Disputas</BoostCardTitle>
            <Badge className="bg-orange-100 text-black hover:bg-orange-200 border-orange-300">
              {filteredDisputes.filter(d => d.status === "pendente").length} novas
            </Badge>
          </div>
        </BoostCardHeader>
        <BoostCardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-boost-border">
                <TableHead className="text-boost-text-secondary">ID / Transação</TableHead>
                <TableHead className="text-boost-text-secondary">Tipo</TableHead>
                <TableHead className="text-boost-text-secondary">Cliente</TableHead>
                <TableHead className="text-boost-text-secondary">Valor</TableHead>
                <TableHead className="text-boost-text-secondary">Motivo</TableHead>
                <TableHead className="text-boost-text-secondary">Status</TableHead>
                <TableHead className="text-boost-text-secondary">Prazo</TableHead>
                <TableHead className="text-boost-text-secondary">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisputes.map((dispute) => {
                const deadlineStatus = getDeadlineStatus(dispute.deadline);
                return (
                  <TableRow key={dispute.id} className="border-boost-border">
                     <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {dispute.status === "pendente" && !viewedDisputes.has(dispute.id) && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                          <div className="font-medium text-boost-text-primary">{dispute.id}</div>
                        </div>
                        <button 
                          className="text-boost-accent hover:underline text-sm"
                          onClick={() => {/* Ver detalhes da transação */}}
                        >
                          {dispute.transactionId}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(dispute.type)}</TableCell>
                    <TableCell className="text-boost-text-primary">{dispute.client}</TableCell>
                    <TableCell className="text-boost-text-primary font-medium">
                      R$ {dispute.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-boost-text-primary">{dispute.reason}</TableCell>
                    <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-boost-text-primary text-sm">
                          {format(new Date(dispute.deadline), "dd/MM", { locale: ptBR })}
                        </div>
                        <div className={deadlineStatus.className + " text-xs"}>
                          {deadlineStatus.text}
                        </div>
                      </div>
                    </TableCell>
                     <TableCell>
                      <BoostButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setViewedDisputes(prev => new Set(prev).add(dispute.id));
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {dispute.status === "pendente" || dispute.status === "em_analise" ? "Responder" : "Ver Detalhes"}
                      </BoostButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </BoostCardContent>
      </BoostCard>

      {/* Modal de Detalhes da Disputa */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-boost-bg-secondary border-boost-border">
          <DialogHeader className="sticky top-0 bg-boost-bg-secondary pb-4 border-b border-boost-border">
            <DialogTitle className="text-boost-text-primary">
              Detalhes da Disputa - {selectedDispute?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDispute && (
            <div className="space-y-4 pt-4">
              {/* Resumo do Caso */}
              <BoostCard>
                <BoostCardHeader>
                  <BoostCardTitle>Resumo do Caso</BoostCardTitle>
                </BoostCardHeader>
                  <BoostCardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-boost-text-secondary">ID:</Label>
                        <p className="text-boost-text-primary font-medium">{selectedDispute.id}</p>
                      </div>
                      <div>
                        <Label className="text-boost-text-secondary">Tipo:</Label>
                        <div className="mt-1">{getTypeBadge(selectedDispute.type)}</div>
                      </div>
                      <div>
                        <Label className="text-boost-text-secondary">Transação:</Label>
                        <p className="text-boost-text-primary font-medium">{selectedDispute.transactionId}</p>
                      </div>
                      <div>
                        <Label className="text-boost-text-secondary">Cliente:</Label>
                        <p className="text-boost-text-primary font-medium">{selectedDispute.client}</p>
                      </div>
                      <div>
                        <Label className="text-boost-text-secondary">Valor:</Label>
                        <p className="text-boost-text-primary font-medium">R$ {selectedDispute.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-boost-text-secondary">Status:</Label>
                        <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-boost-text-secondary">
                        {selectedDispute.type === "chargeback" ? "Motivo do Chargeback:" : "Motivo da MED:"}
                      </Label>
                      <p className="text-boost-text-primary">{selectedDispute.reason}</p>
                    </div>
                    {selectedDispute.description && (
                      <div>
                        <Label className="text-boost-text-secondary">Descrição:</Label>
                        <p className="text-boost-text-primary">{selectedDispute.description}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-boost-text-secondary">Prazo para Resposta:</Label>
                      <p className={getDeadlineStatus(selectedDispute.deadline).className}>
                        {format(new Date(selectedDispute.deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - {getDeadlineStatus(selectedDispute.deadline).text}
                      </p>
                    </div>
                  </BoostCardContent>
              </BoostCard>

              {/* Seção de Defesa */}
              {(selectedDispute.status === "pendente" || selectedDispute.status === "em_analise") && (
                <BoostCard>
                  <BoostCardHeader>
                    <BoostCardTitle>
                      {selectedDispute.type === "chargeback" ? "Defesa contra Chargeback" : "Defesa contra MED"}
                    </BoostCardTitle>
                    <p className="text-boost-text-secondary">
                      {selectedDispute.type === "chargeback" 
                        ? "Forneça documentos que comprovem a legitimidade da venda (nota fiscal, comprovante de entrega, contratos, etc.)"
                        : "Apresente evidências que comprovem que o PIX foi legítimo e não decorrente de fraude ou erro"
                      }
                    </p>
                  </BoostCardHeader>
                  <BoostCardContent className="space-y-4">
                    <div>
                      <Label htmlFor="evidence-files">Upload de Arquivos</Label>
                      <div className="mt-2">
                        <input
                          id="evidence-files"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <BoostButton
                          variant="outline"
                          onClick={() => document.getElementById("evidence-files")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Arquivos
                        </BoostButton>
                        <p className="text-xs text-boost-text-secondary mt-1">
                          Aceitos: PDF, Imagens, Word. Máximo 10MB por arquivo.
                        </p>
                      </div>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <Label>Arquivos Enviados:</Label>
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-boost-bg-primary rounded border border-boost-border">
                              <span className="text-boost-text-primary">{file.name}</span>
                              <BoostButton
                                size="sm"
                                variant="ghost"
                                onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remover
                              </BoostButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="defense">Escreva sua defesa</Label>
                      <Textarea
                        id="defense"
                        placeholder={selectedDispute.type === "chargeback" 
                          ? "Explique detalhadamente como a venda foi realizada, evidências de entrega, comunicações com o cliente, etc."
                          : "Explique por que o PIX foi legítimo, forneça evidências do serviço prestado, comunicações, contratos, etc."
                        }
                        value={defenseText}
                        onChange={(e) => setDefenseText(e.target.value)}
                        className="min-h-[120px] bg-boost-bg-primary border-boost-border"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <BoostButton variant="outline" onClick={() => setSelectedDispute(null)}>
                        Cancelar
                      </BoostButton>
                      <BoostButton onClick={handleSubmitDefense}>
                        Enviar Defesa
                      </BoostButton>
                    </div>

                    {selectedDispute.status === "em_analise" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          <div>
                            <p className="font-medium text-blue-800">Defesa em Análise</p>
                            <p className="text-sm text-blue-600">
                              Sua defesa foi enviada e está sendo analisada pelos bancos/operadoras. Você ainda pode atualizar sua defesa se necessário.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </BoostCardContent>
                </BoostCard>
              )}

              {/* Histórico da Disputa - Para casos finalizados */}
              {(selectedDispute.status === "ganhamos" || selectedDispute.status === "perdemos") && (
                <BoostCard>
                  <BoostCardHeader>
                    <BoostCardTitle>
                      Histórico da {selectedDispute.type === "chargeback" ? "Defesa contra Chargeback" : "Defesa contra MED"}
                    </BoostCardTitle>
                    <p className="text-boost-text-secondary">
                      {selectedDispute.status === "ganhamos" 
                        ? "Sua defesa foi aceita e o caso foi resolvido a seu favor"
                        : "Sua defesa não foi aceita e o valor foi devolvido ao cliente"
                      }
                    </p>
                  </BoostCardHeader>
                  <BoostCardContent className="space-y-4">
                    <div className={`rounded-lg p-4 ${selectedDispute.status === "ganhamos" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                      <div className="flex items-center">
                        {selectedDispute.status === "ganhamos" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <p className={`font-medium ${selectedDispute.status === "ganhamos" ? "text-green-800" : "text-red-800"}`}>
                            {selectedDispute.status === "ganhamos" ? "Disputa Ganha" : "Disputa Perdida"}
                          </p>
                          <p className={`text-sm ${selectedDispute.status === "ganhamos" ? "text-green-600" : "text-red-600"}`}>
                            {selectedDispute.status === "ganhamos" 
                              ? "O valor permanece em sua conta. Suas evidências foram suficientes para comprovar a legitimidade da transação."
                              : "O valor foi devolvido ao cliente. As evidências apresentadas não foram consideradas suficientes."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-boost-text-secondary">Defesa Enviada:</Label>
                      <div className="mt-2 p-3 bg-boost-bg-primary border border-boost-border rounded-lg">
                        <p className="text-boost-text-primary">
                          {selectedDispute.type === "chargeback" 
                            ? "Defesa completa enviada com documentos comprovando a venda legítima, incluindo nota fiscal, comprovante de entrega e comunicações com o cliente."
                            : "Defesa enviada com evidências comprovando que o PIX foi processado corretamente e corresponde a um serviço/produto legítimo."
                          }
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-boost-text-secondary">Documentos Enviados:</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center p-2 bg-boost-bg-primary rounded border border-boost-border">
                          <span className="text-boost-text-primary">nota_fiscal_compra.pdf</span>
                        </div>
                        <div className="flex items-center p-2 bg-boost-bg-primary rounded border border-boost-border">
                          <span className="text-boost-text-primary">comprovante_entrega.jpg</span>
                        </div>
                        {selectedDispute.type === "chargeback" && (
                          <div className="flex items-center p-2 bg-boost-bg-primary rounded border border-boost-border">
                            <span className="text-boost-text-primary">comunicacao_cliente.pdf</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </BoostCardContent>
                </BoostCard>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}