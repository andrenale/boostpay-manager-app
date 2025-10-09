import { useState } from "react";
import { Plus, Edit, Trash2, Users, Percent, DollarSign } from "lucide-react";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostInput } from "@/components/ui/boost-input";
import { BoostBadge } from "@/components/ui/boost-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Split = () => {
  const [activeTab, setActiveTab] = useState("recipients");
  const [showRecipientDialog, setShowRecipientDialog] = useState(false);
  const [showEditRecipientDialog, setShowEditRecipientDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [ruleRecipients, setRuleRecipients] = useState([
    { id: "1", recipientId: "", divisionType: "percentage", value: "" }
  ]);

  // Mock data
  const recipients = [
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
    },
    {
      id: "REC003",
      name: "Maria Santos - Vendedora",
      document: "987.654.321-00",
      email: "maria.santos@email.com",
      phone: "(11) 88888-7777",
      status: "pending"
    }
  ];

  const splitRules = [
    {
      id: "RULE001",
      name: "Comissão Padrão do Marketplace",
      description: "80% Vendedor, 20% Plataforma",
      recipients: [
        { name: "Vendedor Principal", percentage: 80 },
        { name: "Plataforma", percentage: 20 }
      ],
      active: true
    },
    {
      id: "RULE002",
      name: "Split Três Partes",
      description: "60% Vendedor, 30% Plataforma, 10% Afiliado",
      recipients: [
        { name: "Vendedor Principal", percentage: 60 },
        { name: "Plataforma", percentage: 30 },
        { name: "Programa de Afiliados", percentage: 10 }
      ],
      active: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-boost-text-primary mb-2">
          Split de Pagamentos
        </h1>
        <p className="text-boost-text-secondary">
          Configure recebedores e regras de divisão para seus pagamentos.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-2 bg-boost-bg-secondary">
          <TabsTrigger 
            value="recipients" 
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Users className="h-4 w-4 mr-2" />
            Recebedores
          </TabsTrigger>
          <TabsTrigger 
            value="rules"
            className="data-[state=active]:bg-boost-accent data-[state=active]:text-boost-text-primary"
          >
            <Percent className="h-4 w-4 mr-2" />
            Regras de Split
          </TabsTrigger>
        </TabsList>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="space-y-6">
          <BoostCard>
            <BoostCardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <BoostCardTitle>Recebedores Convidados</BoostCardTitle>
                  <BoostCardDescription>
                    Gerencie os convites enviados para pessoas e empresas que podem receber parte dos pagamentos.
                  </BoostCardDescription>
                </div>
                <Dialog open={showRecipientDialog} onOpenChange={setShowRecipientDialog}>
                  <DialogTrigger asChild>
                    <BoostButton className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Convidar Recebedor</span>
                    </BoostButton>
                  </DialogTrigger>
                  <DialogContent className="bg-boost-bg-secondary border-boost-border max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-boost-text-primary">Convidar Novo Recebedor</DialogTitle>
                      <DialogDescription className="text-boost-text-secondary">
                        Convide uma pessoa ou empresa para abrir uma conta e receber pagamentos via split.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-boost-text-secondary">Nome / Razão Social</Label>
                        <BoostInput placeholder="Digite o nome completo ou razão social" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-boost-text-secondary">CPF / CNPJ</Label>
                        <BoostInput placeholder="000.000.000-00 ou 00.000.000/0001-00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-boost-text-secondary">E-mail</Label>
                        <BoostInput placeholder="email@exemplo.com" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-boost-text-secondary">Telefone</Label>
                        <BoostInput placeholder="(11) 99999-9999" />
                      </div>
                    </div>
                    <DialogFooter>
                      <BoostButton variant="secondary" onClick={() => setShowRecipientDialog(false)}>
                        Cancelar
                      </BoostButton>
                      <BoostButton onClick={() => setShowRecipientDialog(false)}>
                        Enviar Convite
                      </BoostButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="space-y-4">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-4 bg-boost-bg-tertiary/50 rounded-lg hover:bg-boost-bg-tertiary transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-boost-accent/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-boost-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-boost-text-primary">{recipient.name}</h3>
                        <p className="text-sm text-boost-text-secondary">
                          {recipient.document} • {recipient.email} • {recipient.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoostBadge variant={recipient.status === "accepted" ? "success" : "warning"}>
                        {recipient.status === "accepted" ? "Conta Ativa" : "Convite Pendente"}
                      </BoostBadge>
                      <div className="flex space-x-1">
                        <BoostButton 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedRecipient(recipient);
                            setShowEditRecipientDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </BoostButton>
                        <BoostButton 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedRecipient(recipient);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </BoostButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BoostCardContent>
          </BoostCard>

          {/* Edit Recipient Dialog */}
          <Dialog open={showEditRecipientDialog} onOpenChange={setShowEditRecipientDialog}>
            <DialogContent className="bg-boost-bg-secondary border-boost-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-boost-text-primary">Editar Recebedor</DialogTitle>
                <DialogDescription className="text-boost-text-secondary">
                  Edite as informações do recebedor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-boost-text-secondary">Nome / Razão Social</Label>
                  <BoostInput 
                    placeholder="Digite o nome completo ou razão social" 
                    defaultValue={selectedRecipient?.name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-boost-text-secondary">CPF / CNPJ</Label>
                  <BoostInput 
                    placeholder="000.000.000-00 ou 00.000.000/0001-00" 
                    defaultValue={selectedRecipient?.document || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-boost-text-secondary">E-mail</Label>
                  <BoostInput 
                    placeholder="email@exemplo.com" 
                    type="email" 
                    defaultValue={selectedRecipient?.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-boost-text-secondary">Telefone</Label>
                  <BoostInput 
                    placeholder="(11) 99999-9999" 
                    defaultValue={selectedRecipient?.phone || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <BoostButton variant="secondary" onClick={() => setShowEditRecipientDialog(false)}>
                  Cancelar
                </BoostButton>
                <BoostButton onClick={() => setShowEditRecipientDialog(false)}>
                  Salvar Alterações
                </BoostButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="bg-boost-bg-secondary border-boost-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-boost-text-primary">Excluir Recebedor</AlertDialogTitle>
                <AlertDialogDescription className="text-boost-text-secondary">
                  Tem certeza que deseja excluir o recebedor "{selectedRecipient?.name}"? 
                  Esta ação não pode ser desfeita e o recebedor será removido de todas as regras de split.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <BoostButton variant="secondary">Cancelar</BoostButton>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <BoostButton 
                    variant="destructive" 
                    onClick={() => {
                      // Aqui você implementaria a lógica de exclusão
                      console.log('Excluindo recebedor:', selectedRecipient);
                      setShowDeleteDialog(false);
                    }}
                  >
                    Excluir
                  </BoostButton>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <BoostCard>
            <BoostCardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <BoostCardTitle>Regras de Split</BoostCardTitle>
                  <BoostCardDescription>
                    Defina como os pagamentos serão divididos entre os recebedores.
                  </BoostCardDescription>
                </div>
                <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                  <DialogTrigger asChild>
                    <BoostButton className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Criar Nova Regra</span>
                    </BoostButton>
                  </DialogTrigger>
                  <DialogContent className="bg-boost-bg-secondary border-boost-border max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-boost-text-primary">Nova Regra de Split</DialogTitle>
                      <DialogDescription className="text-boost-text-secondary">
                        Configure como os pagamentos serão divididos automaticamente.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Rule Name */}
                      <div className="space-y-2">
                        <Label className="text-boost-text-secondary">Nome da Regra</Label>
                        <BoostInput placeholder="Ex: Comissão Padrão do Marketplace" />
                      </div>

                      {/* Recipients Configuration */}
                      <div className="space-y-4">
                        <Label className="text-boost-text-secondary text-base font-semibold">
                          Configuração dos Recebedores
                        </Label>
                        

                        {/* Dynamic Recipients */}
                        {ruleRecipients.map((ruleRecipient, index) => (
                          <div key={ruleRecipient.id} className="p-4 border border-boost-border rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-boost-text-primary">Recebedor {index + 1}</h4>
                              {ruleRecipients.length > 1 && (
                                <BoostButton 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setRuleRecipients(prev => prev.filter(r => r.id !== ruleRecipient.id))}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </BoostButton>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-boost-text-secondary">Recebedor</Label>
                                <Select 
                                  value={ruleRecipient.recipientId} 
                                  onValueChange={(value) => 
                                    setRuleRecipients(prev => 
                                      prev.map(r => r.id === ruleRecipient.id ? {...r, recipientId: value} : r)
                                    )
                                  }
                                >
                                  <SelectTrigger className="bg-boost-bg-primary border-boost-border text-boost-text-primary">
                                    <SelectValue placeholder="Selecione um recebedor" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-boost-bg-secondary border-boost-border">
                                    {recipients
                                      .filter((recipient) => recipient.status === "accepted")
                                      .map((recipient) => (
                                        <SelectItem key={recipient.id} value={recipient.id} className="text-boost-text-primary">
                                          {recipient.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-3">
                                <Label className="text-boost-text-secondary">Tipo de Divisão</Label>
                                <RadioGroup 
                                  value={ruleRecipient.divisionType} 
                                  onValueChange={(value) => 
                                    setRuleRecipients(prev => 
                                      prev.map(r => r.id === ruleRecipient.id ? {...r, divisionType: value} : r)
                                    )
                                  }
                                  className="flex space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="percentage" id={`percentage-${ruleRecipient.id}`} />
                                    <Label htmlFor={`percentage-${ruleRecipient.id}`} className="text-boost-text-secondary">Percentual (%)</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed" id={`fixed-${ruleRecipient.id}`} />
                                    <Label htmlFor={`fixed-${ruleRecipient.id}`} className="text-boost-text-secondary">Valor Fixo (R$)</Label>
                                  </div>
                                </RadioGroup>
                                <BoostInput 
                                  placeholder={ruleRecipient.divisionType === "percentage" ? "0.00" : "0,00"} 
                                  value={ruleRecipient.value}
                                  onChange={(e) => 
                                    setRuleRecipients(prev => 
                                      prev.map(r => r.id === ruleRecipient.id ? {...r, value: e.target.value} : r)
                                    )
                                  }
                                  icon={ruleRecipient.divisionType === "percentage" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Recipient Button */}
                        <BoostButton 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setRuleRecipients(prev => [...prev, { 
                            id: Date.now().toString(), 
                            recipientId: "", 
                            divisionType: "percentage", 
                            value: "" 
                          }])}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Recebedor
                        </BoostButton>

                        {/* Tax Responsibility */}
                        <div className="p-4 bg-boost-bg-tertiary/30 rounded-lg">
                          <Label className="text-boost-text-secondary text-sm">
                            Responsável pelas taxas de transação
                          </Label>
                          <div className="mt-2 p-3 bg-boost-bg-secondary/50 rounded border border-boost-border">
                            <span className="text-boost-text-primary font-medium">Estabelecimento (Plataforma)</span>
                            <p className="text-sm text-boost-text-secondary mt-1">
                              As taxas de transação são sempre de responsabilidade do estabelecimento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <BoostButton variant="secondary" onClick={() => setShowRuleDialog(false)}>
                        Cancelar
                      </BoostButton>
                      <BoostButton onClick={() => setShowRuleDialog(false)}>
                        Criar Regra
                      </BoostButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </BoostCardHeader>
            <BoostCardContent>
              <div className="space-y-4">
                {splitRules.map((rule) => (
                  <div key={rule.id} className="p-6 bg-boost-bg-tertiary/50 rounded-lg hover:bg-boost-bg-tertiary transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-boost-text-primary">{rule.name}</h3>
                          <BoostBadge variant={rule.active ? "success" : "outline"}>
                            {rule.active ? "Ativa" : "Inativa"}
                          </BoostBadge>
                        </div>
                        <p className="text-boost-text-secondary">{rule.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <BoostButton variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </BoostButton>
                        <BoostButton variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </BoostButton>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-boost-text-secondary">Distribuição:</Label>
                      {rule.recipients.map((recipient, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-boost-bg-secondary/50 rounded">
                          <span className="text-boost-text-primary">{recipient.name}</span>
                          <span className="font-semibold text-boost-text-primary">{recipient.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BoostCardContent>
          </BoostCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Split;