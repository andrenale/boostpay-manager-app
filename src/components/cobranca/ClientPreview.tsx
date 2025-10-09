import React, { useState, useEffect } from "react";
import { Smartphone, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import PixPayment from "./PixPayment";
import CreditCardPayment from "./CreditCardPayment";
import ClientRegistrationForm from "./ClientRegistrationForm";

type Customization = {
  logo?: string;
  companyName: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  productImage?: string;
};

interface ClientPreviewProps {
  customization: Customization;
  valor: string;
  descricao: string;
  requiresRegistration?: boolean;
  previewMode?: boolean;
}

const ClientPreview: React.FC<ClientPreviewProps> = ({ customization, valor, descricao, requiresRegistration = false, previewMode = false }) => {
  // No modo preview, sempre mostrar a tela de seleção, mesmo quando requiresRegistration = true
  const initialState = previewMode ? 'selection' : (requiresRegistration ? 'registration' : 'selection');
  const [paymentMethod, setPaymentMethod] = useState<'registration' | 'selection' | 'pix' | 'creditcard'>(initialState);
  
  // No modo preview com requiresRegistration, simular dados do cliente
  const simulatedClientData = previewMode && requiresRegistration ? {
    nome: "João Silva",
    cpfCnpj: "123.456.789-00",
    email: "joao@email.com"
  } : null;
  
  const [clientData, setClientData] = useState<any>(simulatedClientData);

  useEffect(() => {
    console.log('ClientPreview effect - paymentMethod changed to:', paymentMethod);
  }, [paymentMethod]);

  const handlePaymentMethodSelect = (method: 'pix' | 'creditcard') => {
    console.log('Payment method selected:', method);
    setPaymentMethod(method);
  };

  const handleBackToSelection = () => {
    console.log('Back to selection');
    if (requiresRegistration && !clientData) {
      setPaymentMethod('registration');
    } else {
      setPaymentMethod('selection');
    }
  };

  const handleClientRegistration = (data: any) => {
    console.log('Client registered:', data);
    setClientData(data);
    setPaymentMethod('selection');
  };

  return (
    <div
      className="relative border border-gray-200 rounded-xl shadow-lg overflow-hidden max-w-md mx-auto"
      style={{ backgroundColor: customization.backgroundColor }}
    >
      {/* Cabeçalho simulado do mobile */}
      <header className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
        <span className="text-xs text-gray-500">pay.boostpay.com.br</span>
        <div className="w-6" />
      </header>

      {/* Conteúdo da página do cliente */}
      <main className="p-6 space-y-6">
        {paymentMethod === 'registration' ? (
          <ClientRegistrationForm
            primaryColor={customization.primaryColor}
            textColor={customization.textColor}
            onSubmit={handleClientRegistration}
            showBackButton={false}
          />
        ) : paymentMethod === 'selection' ? (
          <>
            {/* Logo e título */}
            <section className="text-center">
              {customization.logo ? (
                <img
                  src={customization.logo}
                  alt="Logo da empresa"
                  className="w-12 h-12 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  <span className="text-white font-bold text-lg">
                    {customization.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h2 className="text-lg font-semibold" style={{ color: customization.textColor }}>
                {customization.companyName}
              </h2>
              <p className="text-sm opacity-70" style={{ color: customization.textColor }}>
                {customization.subtitle}
              </p>
            </section>

            {/* Imagem do produto (se definida) */}
            {customization.productImage && (
              <section className="text-center">
                <img
                  src={customization.productImage}
                  alt="Produto/Serviço"
                  className="w-24 h-24 rounded-lg mx-auto object-cover"
                />
              </section>
            )}

            {/* Dados do cliente registrado */}
            {clientData && (
              <section
                className="rounded-lg p-4 space-y-3 border-l-4"
                style={{ 
                  backgroundColor: `${customization.primaryColor}10`,
                  borderLeftColor: customization.primaryColor
                }}
              >
                <div className="text-center">
                  <p className="text-xs opacity-70" style={{ color: customization.textColor }}>
                    Cliente
                  </p>
                  <p className="text-sm font-medium" style={{ color: customization.textColor }}>
                    {clientData.nome}
                  </p>
                  <p className="text-xs opacity-70" style={{ color: customization.textColor }}>
                    {clientData.cpfCnpj} • {clientData.email}
                  </p>
                </div>
              </section>
            )}

            {/* Informações do pagamento */}
            <section
              className="rounded-lg p-4 space-y-3"
              style={{ backgroundColor: `${customization.primaryColor}10` }}
            >
              <div className="text-center">
                <p className="text-sm opacity-70" style={{ color: customization.textColor }}>
                  Valor a pagar
                </p>
                <p className="text-2xl font-bold" style={{ color: customization.textColor }}>
                  {formatCurrency(valor)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-70" style={{ color: customization.textColor }}>
                  Descrição
                </p>
                <p className="text-sm font-medium" style={{ color: customization.textColor }}>
                  {descricao}
                </p>
              </div>
            </section>

            {/* Botões de pagamento */}
            <section className="space-y-3">
              <button
                onClick={() => {
                  console.log('PIX button clicked');
                  handlePaymentMethodSelect('pix');
                }}
                className="w-full text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors hover:opacity-90"
                style={{ backgroundColor: customization.primaryColor }}
              >
                <Smartphone className="h-4 w-4" />
                <span>Pagar com PIX</span>
              </button>
              <button
                onClick={() => {
                  console.log('Credit card button clicked');
                  handlePaymentMethodSelect('creditcard');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                style={{ color: customization.textColor }}
              >
                <CreditCard className="h-4 w-4" />
                <span>Cartão de Crédito</span>
              </button>
            </section>

            {/* Informações de segurança */}
            <footer className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs opacity-60" style={{ color: customization.textColor }}>
                🔒 Pagamento protegido por criptografia
              </p>
            </footer>
          </>
        ) : paymentMethod === 'pix' ? (
          <PixPayment
            valor={valor}
            descricao={descricao}
            primaryColor={customization.primaryColor}
            textColor={customization.textColor}
            onBack={handleBackToSelection}
          />
        ) : paymentMethod === 'creditcard' ? (
          <CreditCardPayment
            valor={valor}
            descricao={descricao}
            primaryColor={customization.primaryColor}
            textColor={customization.textColor}
            onBack={handleBackToSelection}
          />
        ) : null}
      </main>
    </div>
  );
};

export default ClientPreview;
