import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastPurchase: string;
  transactionCount: number;
  transactions?: any[];
}

interface ClientsContextType {
  clients: Cliente[];
  addClient: (client: Omit<Cliente, 'id' | 'totalSpent' | 'lastPurchase' | 'transactionCount'>) => Cliente;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Cliente[]>([]);

  useEffect(() => {
    // Carregar clientes do localStorage
    const savedClients = localStorage.getItem('boost-clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      // Clientes mock iniciais
      const initialClients: Cliente[] = [
        {
          id: "CLI001",
          name: "João Silva Santos",
          email: "joao@email.com",
          phone: "(11) 98765-4321",
          totalSpent: 1299.75,
          lastPurchase: "2024-01-15",
          transactionCount: 8,
          transactions: [
            { id: "TXN001234", date: "2024-01-15", amount: 299.90, status: "success" },
            { id: "TXN001200", date: "2024-01-10", amount: 150.00, status: "success" },
            { id: "TXN001180", date: "2024-01-08", amount: 89.50, status: "success" },
            { id: "TXN001156", date: "2024-01-05", amount: 420.00, status: "success" },
            { id: "TXN001123", date: "2024-01-02", amount: 340.35, status: "success" },
          ]
        },
        {
          id: "CLI002",
          name: "Maria Santos Costa",
          email: "maria@email.com",
          phone: "(11) 91234-5678",
          totalSpent: 750.00,
          lastPurchase: "2024-01-14",
          transactionCount: 3,
          transactions: [
            { id: "TXN001235", date: "2024-01-14", amount: 150.00, status: "success" },
            { id: "TXN001201", date: "2024-01-12", amount: 300.00, status: "success" },
            { id: "TXN001167", date: "2024-01-08", amount: 300.00, status: "success" },
          ]
        },
        {
          id: "CLI003",
          name: "Pedro Costa Lima",
          email: "pedro@email.com",
          phone: "(21) 99876-5432",
          totalSpent: 89.50,
          lastPurchase: "2024-01-15",
          transactionCount: 1,
          transactions: [
            { id: "TXN001236", date: "2024-01-15", amount: 89.50, status: "warning" },
          ]
        },
        {
          id: "CLI004",
          name: "Ana Paula Silva",
          email: "ana@email.com",
          phone: "(11) 97654-3210",
          totalSpent: 2100.00,
          lastPurchase: "2024-01-15",
          transactionCount: 12,
          transactions: [
            { id: "TXN001237", date: "2024-01-15", amount: 420.00, status: "success" },
            { id: "TXN001198", date: "2024-01-13", amount: 680.00, status: "success" },
            { id: "TXN001145", date: "2024-01-10", amount: 320.00, status: "success" },
          ]
        }
      ];
      setClients(initialClients);
      localStorage.setItem('boost-clients', JSON.stringify(initialClients));
    }
  }, []);

  const addClient = (clientData: Omit<Cliente, 'id' | 'totalSpent' | 'lastPurchase' | 'transactionCount'>) => {
    const newClient: Cliente = {
      ...clientData,
      id: `CLI${Date.now()}`,
      totalSpent: 0,
      lastPurchase: new Date().toISOString().split('T')[0],
      transactionCount: 0,
      transactions: []
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('boost-clients', JSON.stringify(updatedClients));

    return newClient;
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient }}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
}
