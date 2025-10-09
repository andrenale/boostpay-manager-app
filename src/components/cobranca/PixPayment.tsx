import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import PaymentSuccess from "./PaymentSuccess";

interface PixPaymentProps {
  valor: string;
  descricao: string;
  primaryColor: string;
  textColor: string;
  onBack: () => void;
}

const PixPayment: React.FC<PixPaymentProps> = ({ 
  valor, 
  descricao, 
  primaryColor, 
  textColor,
  onBack 
}) => {
  console.log('PixPayment component mounted with props:', { valor, descricao, primaryColor, textColor });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [pixCopyCode, setPixCopyCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Gerar código PIX simulado e QR Code
  useEffect(() => {
    const generatePixCode = () => {
      // Código PIX simulado - em produção seria gerado pelo backend
      const cleanValor = valor.replace(/[^\d,]/g, '').replace(',', '.');
      const pixCode = `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540${cleanValor}5802BR5920Boost Pay Pagamentos6009Sao Paulo62070503***6304ABCD`;
      
      setPixCopyCode(pixCode);
      
      // Gerar QR Code
      QRCode.toDataURL(pixCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Code:', err);
      });
    };

    generatePixCode();
  }, [valor]);

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCopyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Simular confirmação de pagamento após copiar o código
      setTimeout(() => {
        setPaymentConfirmed(true);
      }, 5000);
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err);
    }
  };

  // Se o pagamento foi confirmado, mostrar tela de sucesso
  if (paymentConfirmed) {
    return (
      <PaymentSuccess
        valor={valor}
        metodo="PIX"
        primaryColor={primaryColor}
        textColor={textColor}
        onContinue={() => {
          setPaymentConfirmed(false);
          onBack();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
          Pagar com PIX
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Escaneie o QR Code ou copie o código para pagar
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {qrCodeDataUrl ? (
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code PIX" 
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Gerando QR Code...</span>
            </div>
          )}
        </div>
      </div>

      {/* Valor */}
      <div className="text-center">
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Valor
        </p>
        <p className="text-2xl font-bold" style={{ color: textColor }}>
          {formatCurrency(valor)}
        </p>
      </div>

      {/* Código PIX para copiar */}
      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: textColor }}>
          Código PIX:
        </p>
        <div 
          className="p-3 rounded-lg border"
          style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}
        >
          <p 
            className="text-xs font-mono break-all"
            style={{ color: textColor }}
          >
            {pixCopyCode || "Gerando código PIX..."}
          </p>
        </div>
        
        <Button
          onClick={copyPixCode}
          disabled={!pixCopyCode}
          className="w-full"
          style={{ 
            backgroundColor: copied ? '#10b981' : primaryColor,
            color: 'white'
          }}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Código Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copiar Código PIX
            </>
          )}
        </Button>
      </div>

      {/* Instruções */}
      <div 
        className="p-4 rounded-lg"
        style={{ backgroundColor: `${primaryColor}05` }}
      >
        <h4 className="font-medium mb-2" style={{ color: textColor }}>
          Como pagar:
        </h4>
        <ol className="text-sm space-y-1" style={{ color: textColor, opacity: 0.8 }}>
          <li>1. Abra o app do seu banco</li>
          <li>2. Escolha a opção PIX</li>
          <li>3. Escaneie o QR Code ou cole o código</li>
          <li>4. Confirme o pagamento</li>
        </ol>
      </div>

      {/* Botão voltar */}
      <Button
        onClick={onBack}
        className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border"
        style={{ 
          borderColor: primaryColor,
          color: primaryColor,
          backgroundColor: '#ffffff !important',
          background: '#ffffff'
        }}
      >
        Outro método
      </Button>

      {/* Informações de segurança */}
      <div className="text-center pt-2">
        <p className="text-xs opacity-60" style={{ color: textColor }}>
          🔒 Pagamento protegido por criptografia
        </p>
      </div>
    </div>
  );
};

export default PixPayment;