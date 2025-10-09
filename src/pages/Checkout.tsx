import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ClientPreview from "@/components/cobranca/ClientPreview";

// Public Checkout page to preview a payment with saved customization
// Reads customization from localStorage by ID passed via ?custom=ID

export default function Checkout() {
  const [searchParams] = useSearchParams();

  const valor = searchParams.get("valor") || "R$ 0,00";
  const descricao = searchParams.get("descricao") || "Pagamento";
  const clienteOpcao = searchParams.get("clienteOpcao");
  const requiresRegistration = clienteOpcao === "solicitar";


  const customization = useMemo(() => {
    const customId = searchParams.get("custom");
    let data: any = null;
    
    // APENAS carrega customização se houver ID específico
    if (customId) {
      try {
        const key = `payment-customization-${customId}`;
        const stored = localStorage.getItem(key);
        
        if (stored && stored !== 'null') {
          data = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error loading customization by ID:', e);
      }
    }
    
    // SEMPRE usar valores padrão limpos quando não há ID específico
    const result = {
      logo: data?.logo || null,
      companyName: data?.companyName || "Boost Pay",
      subtitle: data?.subtitle || "Pagamento Seguro",
      backgroundColor: data?.backgroundColor || "#ffffff",
      textColor: data?.textColor || "#1f2937",
      primaryColor: data?.primaryColor || "#06b6d4",
      productImage: data?.productImage || null,
    };
    
    return result;
  }, [searchParams]);

  // Simple centered layout without the dashboard chrome
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-boost-bg-primary via-boost-bg-secondary to-boost-bg-primary p-4">
      <div className="w-full max-w-md">
        <ClientPreview 
          customization={customization} 
          valor={valor} 
          descricao={descricao} 
          requiresRegistration={requiresRegistration}
        />
      </div>
    </div>
  );
}
