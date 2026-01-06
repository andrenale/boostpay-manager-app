import { useMemo } from 'react';
import { EstablishmentStatus } from '@/types/api';

interface OnboardingData {
  accountType?: "juridica" | "fisica";
  identification_document_number?: string;
  cpfRepresentante?: string;
  dataNascimento?: string;
  telefone?: string;
  nomeEmpresa?: string;
  segmento?: string;
  descricaoAtividade?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  contratoSocial?: { documentId?: number };
  rgRepresentante?: { documentId?: number };
  cpfDocumento?: { documentId?: number };
  comprovanteEndereco?: { documentId?: number };
}

export const useOnboardingSteps = (data: OnboardingData, establishmentStatus?: EstablishmentStatus | null) => {
  // Function to check if all required documents are uploaded
  const checkAllDocumentsUploaded = useMemo(() => {
    if (data.accountType === "juridica") {
      return !!(
        data.contratoSocial?.documentId && 
        data.rgRepresentante?.documentId && 
        data.comprovanteEndereco?.documentId
      );
    } else if (data.accountType === "fisica") {
      return !!(
        data.cpfDocumento?.documentId && 
        data.comprovanteEndereco?.documentId
      );
    }
    return false;
  }, [data.accountType, data.contratoSocial, data.rgRepresentante, data.cpfDocumento, data.comprovanteEndereco]);

  // Function to check if a specific step is completed
  const isStepCompleted = useMemo(() => {
    return (stepNumber: number): boolean => {
      switch (stepNumber) {
        case 1: // Account data
          if (!data.accountType) return false;
          
          // Check if basic identification is filled
          const hasIdentification = !!(data.identification_document_number && data.identification_document_number.trim());
          const hasPhone = !!(data.telefone && data.telefone.trim());
          const hasBirthDate = !!(data.dataNascimento && data.dataNascimento.trim());
          
          if (data.accountType === "juridica") {
            const hasCpfRepresentante = !!(data.cpfRepresentante && data.cpfRepresentante.trim());
            return hasIdentification && hasCpfRepresentante && hasBirthDate && hasPhone;
          } else {
            return hasIdentification && hasBirthDate && hasPhone;
          }
          
        case 2: // Business data - only check essential fields
          const hasCompanyName = !!(data.nomeEmpresa && data.nomeEmpresa.trim());
          const hasSegment = !!(data.segmento && data.segmento.trim());
          const hasDescription = !!(data.descricaoAtividade && data.descricaoAtividade.trim());
          return hasCompanyName && hasSegment && hasDescription;
          
        case 3: // Address data - check all required address fields
          const hasCep = !!(data.cep && data.cep.trim());
          const hasCity = !!(data.cidade && data.cidade.trim());
          const hasState = !!(data.estado && data.estado.trim());
          const hasStreet = !!(data.logradouro && data.logradouro.trim());
          const hasNumber = !!(data.numero && data.numero.trim());
          const hasNeighborhood = !!(data.bairro && data.bairro.trim());
          return hasCep && hasCity && hasState && hasStreet && hasNumber && hasNeighborhood;
          
        case 4: // Documents - check if all required documents are uploaded
          return checkAllDocumentsUploaded;
          
        case 5: // Confirmation - always accessible once reached
          return true;
          
        default:
          return false;
      }
    };
  }, [data, checkAllDocumentsUploaded]);

  // Function to determine the appropriate step to show
  const determineCurrentStep = useMemo(() => {
    return (): number => {
      // Always start with step 1 if no account type is selected
      if (!data.accountType) {
        return 1;
      }
      
      // Check steps 1-4 to find the first incomplete one
      for (let step = 1; step <= 4; step++) {
        if (!isStepCompleted(step)) {
          return step;
        }
      }
      
      // If all steps 1-4 are complete, go to step 5 (confirmation)
      return 5;
    };
  }, [data.accountType, isStepCompleted]);

  return {
    isStepCompleted,
    determineCurrentStep,
    checkAllDocumentsUploaded,
    isWaitingApproval: establishmentStatus === EstablishmentStatus.WAITING_APPROVAL
  };
};