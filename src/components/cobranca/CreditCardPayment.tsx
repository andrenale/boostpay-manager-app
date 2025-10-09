import React, { useState } from "react";
import { CreditCard, Lock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailure from "./PaymentFailure";

interface CreditCardPaymentProps {
  valor: string;
  descricao: string;
  primaryColor: string;
  textColor: string;
  onBack: () => void;
}

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  installments: string;
}

const CreditCardPayment: React.FC<CreditCardPaymentProps> = ({
  valor,
  descricao,
  primaryColor,
  textColor,
  onBack
}) => {
  console.log('CreditCardPayment component mounted with props:', { valor, descricao, primaryColor, textColor });
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formattedValue.slice(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
    }
    return cleanValue;
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'name') {
      formattedValue = value.toUpperCase();
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    return 'Cartão';
  };

  const isFormValid = () => {
    return cardData.number.replace(/\s/g, '').length >= 16 &&
           cardData.name.trim().length >= 3 &&
           cardData.expiry.length === 5 &&
           cardData.cvv.length >= 3;
  };

  const handlePayment = async () => {
    if (!isFormValid()) return;
    
    setIsProcessing(true);
    
    // Simular processamento do pagamento
    setTimeout(() => {
      setIsProcessing(false);
      // Simula 30% de chance de falha para demonstração
      const success = Math.random() > 0.3;
      if (success) {
        setPaymentConfirmed(true);
      } else {
        setPaymentFailed(true);
      }
    }, 3000);
  };

  // Se o pagamento foi confirmado, mostrar tela de sucesso
  if (paymentConfirmed) {
    return (
      <PaymentSuccess
        valor={valor}
        metodo="Cartão de Crédito"
        primaryColor={primaryColor}
        textColor={textColor}
        onContinue={() => {
          setPaymentConfirmed(false);
          onBack();
        }}
      />
    );
  }

  // Se o pagamento falhou, mostrar tela de falha
  if (paymentFailed) {
    return (
      <PaymentFailure
        valor={valor}
        metodo="Cartão de Crédito"
        primaryColor={primaryColor}
        textColor={textColor}
        onTryAgain={() => {
          setPaymentFailed(false);
        }}
        onChangeMethod={() => {
          setPaymentFailed(false);
          onBack();
        }}
      />
    );
  }

  const generateInstallmentOptions = () => {
    const cleanValor = parseCurrency(valor);
    const options = [];
    
    for (let i = 1; i <= 12; i++) {
      const installmentValue = cleanValor / i;
      const formattedValue = formatCurrency(installmentValue);
      
      const label = i === 1 
        ? `1x de ${formattedValue} (à vista)`
        : `${i}x de ${formattedValue}`;
      
      options.push({ value: i.toString(), label });
    }
    
    return options;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
          Cartão de Crédito
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Preencha os dados do seu cartão
        </p>
      </div>

      {/* Valor */}
      <div className="text-center">
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Valor total
        </p>
        <p className="text-2xl font-bold" style={{ color: textColor }}>
          {formatCurrency(valor)}
        </p>
      </div>

      {/* Formulário do cartão */}
      <div className="space-y-4">
        {/* Número do cartão */}
        <div className="space-y-2">
          <Label htmlFor="cardNumber" style={{ color: textColor }}>
            Número do cartão
          </Label>
          <div className="relative">
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className="pl-10"
              style={{ 
                borderColor: `${primaryColor}30`,
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            />
            <CreditCard 
              className="h-4 w-4 absolute left-3 top-3" 
              style={{ color: primaryColor }}
            />
            {cardData.number && (
              <span 
                className="absolute right-3 top-3 text-xs font-medium"
                style={{ color: primaryColor }}
              >
                {getCardBrand(cardData.number)}
              </span>
            )}
          </div>
        </div>

        {/* Nome no cartão */}
        <div className="space-y-2">
          <Label htmlFor="cardName" style={{ color: textColor }}>
            Nome no cartão
          </Label>
          <div className="relative">
            <Input
              id="cardName"
              type="text"
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              value={cardData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="pl-10"
              style={{ 
                borderColor: `${primaryColor}30`,
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            />
            <User 
              className="h-4 w-4 absolute left-3 top-3" 
              style={{ color: primaryColor }}
            />
          </div>
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry" style={{ color: textColor }}>
              Validade
            </Label>
            <div className="relative">
              <Input
                id="expiry"
                type="text"
                placeholder="MM/AA"
                value={cardData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
                className="pl-10"
                style={{ 
                  borderColor: `${primaryColor}30`,
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
              <Calendar 
                className="h-4 w-4 absolute left-3 top-3" 
                style={{ color: primaryColor }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cvv" style={{ color: textColor }}>
              CVV
            </Label>
            <div className="relative">
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                className="pl-10"
                style={{ 
                  borderColor: `${primaryColor}30`,
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
              <Lock 
                className="h-4 w-4 absolute left-3 top-3" 
                style={{ color: primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Parcelamento */}
        <div className="space-y-2">
          <Label style={{ color: textColor }}>
            Parcelamento
          </Label>
          <Select value={cardData.installments} onValueChange={(value) => handleInputChange('installments', value)}>
            <SelectTrigger 
              style={{ 
                borderColor: `${primaryColor}30`,
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            >
              <SelectValue placeholder="Escolha o parcelamento" />
            </SelectTrigger>
            <SelectContent 
              className="z-50"
              style={{ 
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid #e2e8f0'
              }}
            >
              {generateInstallmentOptions().map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  }}
                  className="hover:bg-gray-100 focus:bg-gray-100"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão de pagamento */}
      <Button
        onClick={handlePayment}
        disabled={!isFormValid() || isProcessing}
        className="w-full"
        style={{ 
          backgroundColor: isFormValid() && !isProcessing ? primaryColor : '#94a3b8',
          color: 'white'
        }}
      >
        {isProcessing ? (
          "Processando pagamento..."
        ) : (
          `Pagar ${formatCurrency(valor)}`
        )}
      </Button>

      {/* Informações de segurança */}
      <div 
        className="p-4 rounded-lg"
        style={{ backgroundColor: `${primaryColor}05` }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="h-4 w-4" style={{ color: primaryColor }} />
          <span className="font-medium text-sm" style={{ color: textColor }}>
            Pagamento Seguro
          </span>
        </div>
        <p className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
          Seus dados são protegidos com criptografia de ponta a ponta. 
          Não armazenamos informações do cartão.
        </p>
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
        Escolher outro método
      </Button>
    </div>
  );
};

export default CreditCardPayment;