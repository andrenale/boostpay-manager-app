import { useState } from "react";
import { Search, Filter, Users, Eye, Mail, Phone, UserPlus } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { BoostBadge } from "@/components/ui/boost-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { clients, addClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const { toast } = useToast();

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "error";
      default: return "default" as const;
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setNewClient({ ...newClient, phone: formatted });
  };

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    // Phone validation
    const phoneNumbers = newClient.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      toast({
        title: "Erro",
        description: "Por favor, insira um telefone válido.",
        variant: "destructive"
      });
      return;
    }

    addClient(newClient);

    toast({
      title: "Cliente criado!",
      description: `${newClient.name} foi adicionado com sucesso.`,
    });

    setNewClient({ name: "", email: "", phone: "" });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-boost-text-primary mb-2">
            Clientes
          </h1>
          <p className="text-boost-text-secondary">
            Gerencie sua base de clientes e acompanhe o histórico de compras.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <BoostButton className="bg-green-600 hover:bg-green-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Cliente
            </BoostButton>
          </DialogTrigger>
          <DialogContent className="bg-boost-bg-secondary border-boost-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-boost-text-primary">Criar Cliente</DialogTitle>
              <DialogDescription className="text-boost-text-secondary">
                Adicione um novo cliente ao seu sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-boost-text-primary">
                  Nome Completo *
                </Label>
                <BoostInput
                  id="name"
                  placeholder="Ex: João Silva Santos"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-boost-text-primary">
                  E-mail *
                </Label>
                <BoostInput
                  id="email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-boost-text-primary">
                  Telefone *
                </Label>
                <BoostInput
                  id="phone"
                  placeholder="Ex: (11) 98765-4321"
                  value={newClient.phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <BoostButton 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </BoostButton>
              <BoostButton variant="primary" onClick={handleCreateClient}>
                Criar Cliente
              </BoostButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <BoostCard className="animate-slide-up">
        <BoostCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <BoostInput
                placeholder="Buscar por nome, e-mail ou telefone..."
                icon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </BoostCardContent>
      </BoostCard>

      {/* Clients Table */}
      <BoostCard className="animate-slide-up">
        <BoostCardHeader>
          <BoostCardTitle>Base de Clientes</BoostCardTitle>
        </BoostCardHeader>
        <BoostCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-boost-bg-tertiary border-b border-boost-border">
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Cliente</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">E-mail</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Telefone</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Total Gasto</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Última Compra</th>
                  <th className="text-left py-3 px-6 font-semibold text-boost-text-primary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    className="border-b border-boost-border hover:bg-boost-bg-tertiary/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-boost-accent/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-boost-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-boost-text-primary">{client.name}</p>
                          <p className="text-sm text-boost-text-secondary">{client.transactionCount} transações</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-boost-text-secondary">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-boost-text-secondary">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-boost-text-primary">
                      R$ {client.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-boost-text-secondary">
                      {new Date(client.lastPurchase).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6">
                      <Sheet>
                        <SheetTrigger asChild>
                          <BoostButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedClient(client)}
                          >
                            <Eye className="h-4 w-4" />
                          </BoostButton>
                        </SheetTrigger>
                        <SheetContent className="bg-boost-bg-secondary border-boost-border w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle className="text-boost-text-primary">
                              Detalhes do Cliente
                            </SheetTitle>
                            <SheetDescription className="text-boost-text-secondary">
                              Informações completas e histórico de transações
                            </SheetDescription>
                          </SheetHeader>
                          
                          {selectedClient && (
                            <div className="mt-6 space-y-6">
                              {/* Client Info */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-boost-text-primary">Informações do Cliente</h3>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Nome</p>
                                    <p className="text-boost-text-primary font-medium">{selectedClient.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">E-mail</p>
                                    <p className="text-boost-text-primary">{selectedClient.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-boost-text-secondary">Telefone</p>
                                    <p className="text-boost-text-primary">{selectedClient.phone}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Summary Stats */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-boost-text-primary">Resumo</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-boost-bg-tertiary/30 rounded-lg">
                                    <p className="text-sm text-boost-text-secondary">Total Gasto</p>
                                    <p className="text-xl font-bold text-boost-accent">
                                      R$ {selectedClient.totalSpent.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-boost-bg-tertiary/30 rounded-lg">
                                    <p className="text-sm text-boost-text-secondary">Transações</p>
                                    <p className="text-xl font-bold text-boost-text-primary">
                                      {selectedClient.transactionCount}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Transaction History */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-boost-text-primary">Histórico de Transações</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {selectedClient.transactions.map((transaction: any) => (
                                    <div key={transaction.id} className="flex justify-between items-center p-3 bg-boost-bg-tertiary/30 rounded-lg">
                                      <div>
                                        <p className="font-medium text-boost-text-primary">{transaction.id}</p>
                                        <p className="text-sm text-boost-text-secondary">
                                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <p className="font-semibold text-boost-text-primary">
                                          R$ {transaction.amount.toFixed(2)}
                                        </p>
                                        <BoostBadge variant={getStatusVariant(transaction.status)}>
                                          {transaction.status === "success" ? "Aprovada" : 
                                           transaction.status === "warning" ? "Pendente" : "Negada"}
                                        </BoostBadge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-boost-bg-tertiary rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-boost-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-boost-text-primary mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-boost-text-secondary">
                Ajuste os filtros ou aguarde suas primeiras vendas!
              </p>
            </div>
          )}
        </BoostCardContent>
      </BoostCard>
    </div>
  );
};

export default Clients;