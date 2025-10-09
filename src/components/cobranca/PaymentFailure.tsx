import React from "react";
import { AlertCircle, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

interface PaymentFailureProps {
  valor: string;
  metodo: string;
  primaryColor: string;
  textColor: string;
  onTryAgain: () => void;
  onChangeMethod: () => void;
}

const PaymentFailure: React.FC<PaymentFailureProps> = ({
  valor,
  metodo,
  primaryColor,
  textColor,
  onTryAgain,
  onChangeMethod
}) => {
  return (
    <div className="space-y-6">
      {/* Header com animação */}
      <div className="text-center animate-fade-in">
        <div 
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse"
          style={{ backgroundColor: '#ef4444', opacity: 0.1 }}
        >
          <AlertCircle 
            className="w-10 h-10 text-red-500" 
          />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#ef4444' }}>
          Pagamento Recusado
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Ops! Não foi possível processar seu pagamento
        </p>
      </div>

      {/* Detalhes do pagamento */}
      <div 
        className="p-4 rounded-lg text-center animate-scale-in"
        style={{ backgroundColor: `${primaryColor}05` }}
      >
        <p className="text-sm opacity-70 mb-1" style={{ color: textColor }}>
          Tentativa de pagamento via {metodo}
        </p>
        <p className="text-lg font-semibold" style={{ color: textColor }}>
          {formatCurrency(valor)}
        </p>
      </div>

      {/* Possíveis motivos */}
      <div 
        className="p-4 rounded-lg animate-fade-in"
        style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
      >
        <h4 className="font-medium mb-2 text-red-700">
          Possíveis motivos:
        </h4>
        <ul className="text-sm text-red-600 space-y-1">
          <li>• Saldo ou limite insuficiente</li>
          <li>• Dados do cartão incorretos</li>
          <li>• Cartão vencido ou bloqueado</li>
          <li>• Problema temporário na operadora</li>
        </ul>
      </div>

      {/* Sugestões de ação */}
      <div 
        className="p-4 rounded-lg animate-fade-in"
        style={{ backgroundColor: '#f0f9ff', border: '1px solid #7dd3fc' }}
      >
        <h4 className="font-medium mb-2 text-blue-700">
          O que você pode fazer:
        </h4>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• Verificar os dados e tentar novamente</li>
          <li>• Usar outro cartão de crédito</li>
          <li>• Escolher o PIX como forma de pagamento</li>
          <li>• Entrar em contato com seu banco</li>
        </ul>
      </div>

      {/* Botões de ação */}
      <div className="space-y-3 animate-fade-in">
        <Button
          onClick={onTryAgain}
          className="w-full"
          style={{ 
            backgroundColor: primaryColor,
            color: 'white'
          }}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
        
        <Button
          onClick={onChangeMethod}
          className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border"
          style={{ 
            borderColor: primaryColor,
            color: primaryColor,
            backgroundColor: '#ffffff !important',
            background: '#ffffff'
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Escolher Outro Método
        </Button>
      </div>

      {/* Animação de shake incluída via CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentFailure;