import React from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

interface PaymentSuccessProps {
  valor: string;
  metodo: "PIX" | "Cartão de Crédito";
  primaryColor: string;
  textColor: string;
  onContinue: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  valor,
  metodo,
  primaryColor,
  textColor,
  onContinue
}) => {
  return (
    <div className="space-y-8 text-center animate-fade-in">
      {/* Ícone de sucesso animado */}
      <div className="flex justify-center">
        <div 
          className="relative w-24 h-24 rounded-full flex items-center justify-center animate-scale-in"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: primaryColor }}
          >
            <CheckCircle2 
              className="w-10 h-10 text-white animate-bounce" 
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </div>
      </div>

      {/* Título de sucesso */}
      <div className="space-y-2">
        <h2 
          className="text-2xl font-bold animate-fade-in"
          style={{ 
            color: textColor,
            animationDelay: '0.3s',
            animationFillMode: 'both'
          }}
        >
          Pagamento Confirmado!
        </h2>
        <p 
          className="text-lg opacity-80 animate-fade-in"
          style={{ 
            color: textColor,
            animationDelay: '0.5s',
            animationFillMode: 'both'
          }}
        >
          ✨ Transação realizada com sucesso
        </p>
      </div>

      {/* Detalhes do pagamento */}
      <div 
        className="p-6 rounded-lg space-y-3 animate-fade-in"
        style={{ 
          backgroundColor: `${primaryColor}08`,
          border: `1px solid ${primaryColor}20`,
          animationDelay: '0.7s',
          animationFillMode: 'both'
        }}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium" style={{ color: textColor }}>
            Método:
          </span>
          <span 
            className="font-bold"
            style={{ color: primaryColor }}
          >
            {metodo}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium" style={{ color: textColor }}>
            Valor:
          </span>
          <span 
            className="text-xl font-bold"
            style={{ color: primaryColor }}
          >
            {formatCurrency(valor)}
          </span>
        </div>

        <div className="pt-2 border-t border-opacity-20" style={{ borderColor: primaryColor }}>
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-sm" style={{ color: textColor, opacity: 0.8 }}>
              Comprovante enviado por email
            </span>
          </div>
        </div>
      </div>

      {/* Mensagem motivacional */}
      <div 
        className="p-4 rounded-lg animate-fade-in"
        style={{ 
          backgroundColor: `${primaryColor}05`,
          animationDelay: '0.9s',
          animationFillMode: 'both'
        }}
      >
        <p 
          className="text-sm font-medium"
          style={{ color: textColor, opacity: 0.9 }}
        >
          🎉 Obrigado pela sua confiança! 
        </p>
        <p 
          className="text-xs mt-1"
          style={{ color: textColor, opacity: 0.7 }}
        >
          Você receberá uma confirmação em breve
        </p>
      </div>

      {/* Botão de continuar */}
      <Button
        onClick={onContinue}
        className="w-full h-12 text-base font-semibold animate-fade-in hover-scale"
        style={{ 
          backgroundColor: primaryColor,
          color: 'white',
          animationDelay: '1.1s',
          animationFillMode: 'both'
        }}
      >
        Continuar
      </Button>

      {/* Efeito de confete CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes confetti {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          
          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${primaryColor};
            animation: confetti 3s linear infinite;
            pointer-events: none;
            z-index: 1000;
          }
          
          .confetti:nth-child(1) { left: 10%; animation-delay: 0s; }
          .confetti:nth-child(2) { left: 20%; animation-delay: 0.2s; }
          .confetti:nth-child(3) { left: 30%; animation-delay: 0.4s; }
          .confetti:nth-child(4) { left: 40%; animation-delay: 0.6s; }
          .confetti:nth-child(5) { left: 50%; animation-delay: 0.8s; }
          .confetti:nth-child(6) { left: 60%; animation-delay: 1s; }
          .confetti:nth-child(7) { left: 70%; animation-delay: 1.2s; }
          .confetti:nth-child(8) { left: 80%; animation-delay: 1.4s; }
          .confetti:nth-child(9) { left: 90%; animation-delay: 1.6s; }
        `
      }} />

      {/* Partículas de confete */}
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
    </div>
  );
};

export default PaymentSuccess;