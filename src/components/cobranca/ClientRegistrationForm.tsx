import React, { useState } from "react";
import { ArrowLeft, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ClientType = 'pf' | 'pj';

interface ClientData {
  tipo: ClientType;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
}

interface ClientRegistrationFormProps {
  primaryColor: string;
  textColor: string;
  onSubmit: (clientData: ClientData) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({
  primaryColor,
  textColor,
  onSubmit,
  onBack,
  showBackButton = true
}) => {
  const [clientData, setClientData] = useState<ClientData>({
    tipo: 'pf',
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: ''
  });

  const [errors, setErrors] = useState<Partial<ClientData>>({});

  const validateForm = () => {
    const newErrors: Partial<ClientData> = {};

    if (!clientData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!clientData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = clientData.tipo === 'pf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
    }

    if (!clientData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(clientData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(clientData);
    }
  };

  const formatDocument = (value: string, type: ClientType) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'pf') {
      // Formato CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formato: (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleInputChange = (field: keyof ClientData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpfCnpj') {
      formattedValue = formatDocument(value, clientData.tipo);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setClientData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        {showBackButton && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: textColor }} />
          </button>
        )}
        <div>
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>
            Cadastro do Cliente
          </h3>
          <p className="text-sm opacity-70" style={{ color: textColor }}>
            Preencha seus dados para continuar
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Cliente */}
        <div className="space-y-3">
          <Label className="text-sm font-medium" style={{ color: textColor }}>
            Tipo de Cliente:
          </Label>
          <RadioGroup
            value={clientData.tipo}
            onValueChange={(value: ClientType) => {
              setClientData(prev => ({
                ...prev,
                tipo: value,
                cpfCnpj: '' // Limpar documento ao trocar tipo
              }));
            }}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pf" id="pf" />
              <Label htmlFor="pf" className="flex items-center space-x-2 cursor-pointer">
                <User className="h-4 w-4" style={{ color: textColor }} />
                <span style={{ color: textColor }}>Pessoa Física</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pj" id="pj" />
              <Label htmlFor="pj" className="flex items-center space-x-2 cursor-pointer">
                <Building2 className="h-4 w-4" style={{ color: textColor }} />
                <span style={{ color: textColor }}>Pessoa Jurídica</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Nome Completo */}
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium" style={{ color: textColor }}>
            {clientData.tipo === 'pf' ? 'Nome Completo' : 'Razão Social'} *
          </Label>
          <Input
            id="nome"
            type="text"
            placeholder={clientData.tipo === 'pf' ? 'Digite seu nome completo' : 'Digite a razão social da empresa'}
            value={clientData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className={`w-full ${errors.nome ? 'border-red-500' : ''}`}
            style={{ 
              backgroundColor: 'white', 
              color: '#1f2937',
              border: '1px solid #d1d5db'
            }}
          />
          {errors.nome && (
            <p className="text-sm text-red-500">{errors.nome}</p>
          )}
        </div>

        {/* CPF/CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cpfCnpj" className="text-sm font-medium" style={{ color: textColor }}>
            {clientData.tipo === 'pf' ? 'CPF' : 'CNPJ'} *
          </Label>
          <Input
            id="cpfCnpj"
            type="text"
            placeholder={clientData.tipo === 'pf' ? 'Digite seu CPF (000.000.000-00)' : 'Digite o CNPJ (00.000.000/0000-00)'}
            value={clientData.cpfCnpj}
            onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
            maxLength={clientData.tipo === 'pf' ? 14 : 18}
            className={`w-full ${errors.cpfCnpj ? 'border-red-500' : ''}`}
            style={{ 
              backgroundColor: 'white', 
              color: '#1f2937',
              border: '1px solid #d1d5db'
            }}
          />
          {errors.cpfCnpj && (
            <p className="text-sm text-red-500">{errors.cpfCnpj}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium" style={{ color: textColor }}>
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Digite seu melhor e-mail"
            value={clientData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full ${errors.email ? 'border-red-500' : ''}`}
            style={{ 
              backgroundColor: 'white', 
              color: '#1f2937',
              border: '1px solid #d1d5db'
            }}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-sm font-medium" style={{ color: textColor }}>
            Telefone (opcional)
          </Label>
          <Input
            id="telefone"
            type="tel"
            placeholder="Digite seu telefone com DDD"
            value={clientData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            maxLength={15}
            className="w-full"
            style={{ 
              backgroundColor: 'white', 
              color: '#1f2937',
              border: '1px solid #d1d5db'
            }}
          />
        </div>

        {/* Botão de continuar */}
        <Button
          type="submit"
          className="w-full text-white font-medium py-3 rounded-lg transition-colors hover:opacity-90 mt-6"
          style={{ backgroundColor: primaryColor }}
        >
          Continuar para Pagamento
        </Button>
      </form>
    </div>
  );
};

export default ClientRegistrationForm;