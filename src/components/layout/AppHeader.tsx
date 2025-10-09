import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  TestTube,
  Globe,
  Sun,
  Moon,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Check,
  Lock,
  FileCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BoostButton } from "@/components/ui/boost-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AccountActivationProgress } from "@/components/AccountActivationProgress";

export function AppHeader() {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState("test");
  const [documentsCompleted, setDocumentsCompleted] = useState(false);
  const [accountApproved, setAccountApproved] = useState(false);
  const [showProductionAlert, setShowProductionAlert] = useState(false);
  const { theme, setTheme } = useTheme();

  // Verificar status dos documentos
  useEffect(() => {
    const completed = localStorage.getItem('documentsCompleted') === 'true';
    const approved = localStorage.getItem('accountApproved') === 'true';
    setDocumentsCompleted(completed);
    setAccountApproved(approved);
  }, []);

  const handleEnvironmentChange = (value: string) => {
    if (value === "production" && !accountApproved) {
      setShowProductionAlert(true);
      return;
    }
    setEnvironment(value);
  };

  const handleCompleteRegistration = () => {
    // Verificar se o usuário já iniciou o onboarding
    const hasStartedOnboarding = localStorage.getItem('onboardingStarted') === 'true';
    const hasPersonalInfo = localStorage.getItem('personalInfo');
    
    if (!hasStartedOnboarding || !hasPersonalInfo) {
      // Usuário novo - vai para o início do cadastro
      navigate('/onboarding?step=1');
    } else {
      // Usuário com dados já preenchidos - vai direto para documentos
      navigate('/onboarding?step=5');
    }
    setShowProductionAlert(false);
  };

  // Estado das notificações
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Transação Aprovada",
      message: "Sua transação de R$ 150,00 foi aprovada com sucesso.",
      time: "2 min atrás",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Documentos Pendentes",
      message: "Ainda há documentos que precisam ser enviados para completar seu cadastro.",
      time: "1 hora atrás", 
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Nova Funcionalidade",
      message: "Agora você pode exportar seus relatórios em formato PDF.",
      time: "2 horas atrás",
      read: true,
    },
    {
      id: 4,
      type: "error",
      title: "Falha na Transação",
      message: "Transação de R$ 89,50 foi rejeitada. Verifique os dados do cartão.",
      time: "1 dia atrás",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Função para simular nova notificação (para demonstração)
  const addNewNotification = () => {
    const newNotification = {
      id: Date.now(),
      type: "info",
      title: "Nova Notificação",
      message: "Esta é uma nova notificação de teste!",
      time: "Agora",
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-status-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <X className="h-4 w-4 text-status-error" />;
      default:
        return <Info className="h-4 w-4 text-boost-accent" />;
    }
  };

  return (
    <header className="bg-boost-bg-primary border-b border-boost-border">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="text-boost-text-secondary hover:text-boost-text-primary" />
          
          {/* Environment Selector */}
        <Popover open={showProductionAlert} onOpenChange={setShowProductionAlert}>
          <PopoverTrigger asChild>
            <div>
              <Select value={environment} onValueChange={handleEnvironmentChange}>
                <SelectTrigger className="w-48 bg-boost-bg-secondary border-boost-border text-boost-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-boost-bg-secondary border-boost-border">
                  <SelectItem value="test" className="text-boost-text-primary hover:bg-boost-bg-tertiary">
                    <div className="flex items-center space-x-2">
                      <TestTube className="h-4 w-4 text-boost-accent" />
                      <span>Ambiente de Teste</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="production" className="text-boost-text-primary hover:bg-boost-bg-tertiary">
                    <div className="flex items-center space-x-2">
                      {!accountApproved ? (
                        <Lock className="h-4 w-4 text-boost-text-secondary" />
                      ) : (
                        <Globe className="h-4 w-4 text-status-success" />
                      )}
                      <span className={!accountApproved ? "text-boost-text-secondary" : ""}>
                        Produção {!accountApproved && "(Bloqueado)"}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-boost-bg-secondary border-boost-border p-0" align="start">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {!documentsCompleted ? (
                    <Lock className="h-5 w-5 text-amber-500 mt-0.5" />
                  ) : (
                    <FileCheck className="h-5 w-5 text-boost-accent mt-0.5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-boost-text-primary mb-2">
                    {!documentsCompleted ? "Conta Pendente" : "Validação em Andamento"}
                  </h4>
                  <p className="text-sm text-boost-text-secondary mb-4">
                    {!documentsCompleted 
                      ? "O ambiente de produção será liberado após a ativação da sua conta."
                      : "Documentação em validação. Após aprovação será liberado o ambiente de produção."
                    }
                  </p>
                  {!documentsCompleted && (
                    <BoostButton 
                      onClick={handleCompleteRegistration}
                      size="sm"
                      className="w-full"
                    >
                      Completar Processo
                    </BoostButton>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        </div>

        <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <BoostButton 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </BoostButton>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BoostButton variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-status-error text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </BoostButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-boost-bg-secondary border-boost-border max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-boost-border">
              <DropdownMenuLabel className="text-boost-text-primary text-base font-semibold flex items-center">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-status-error text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <BoostButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas como lida
                </BoostButton>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                <p className="text-boost-text-secondary text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-boost-border/50 hover:bg-boost-bg-tertiary/50 transition-colors ${
                      !notification.read ? 'bg-boost-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-boost-text-primary' : 'text-boost-text-secondary'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-boost-text-secondary mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-boost-text-secondary mt-2">
                              {notification.time}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <BoostButton
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </BoostButton>
                            )}
                            <BoostButton
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </BoostButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-boost-border">
                <BoostButton 
                  variant="ghost" 
                  className="w-full text-sm text-boost-text-secondary hover:text-boost-text-primary"
                >
                  Ver todas as notificações
                </BoostButton>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BoostButton variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-boost-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-boost-text-primary" />
              </div>
              <span className="font-medium text-boost-text-primary">João Silva</span>
              <ChevronDown className="h-4 w-4 text-boost-text-secondary" />
            </BoostButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-boost-bg-secondary border-boost-border">
            <DropdownMenuLabel className="text-boost-text-primary">
              Minha Conta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-boost-border" />
            <DropdownMenuItem 
              className="text-boost-text-secondary hover:bg-boost-bg-tertiary hover:text-boost-text-primary cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem className="text-boost-text-secondary hover:bg-boost-bg-tertiary hover:text-boost-text-primary cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Account Activation Progress */}
      <div className="px-6 pb-4">
        <AccountActivationProgress />
      </div>
    </header>
  );
}