import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BoostInput } from "@/components/ui/boost-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Building2, 
  MapPin, 
  Upload, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingSteps } from "@/hooks/useOnboardingSteps";
import { 
  useCurrentEstablishment, 
  useUpdateCurrentEstablishment,
  useCreateEstablishment 
} from "@/hooks/useEstablishments";
import { EstablishmentUpdate, EstablishmentCreate, EstablishmentType } from "@/types/api";
import { handleApiError } from "@/services/api";
import { uploadFile, validateFile } from "@/services/documentUpload";

type AccountType = "juridica" | "fisica";

interface OnboardingData {
  accountType?: AccountType;
  
  // API fields (matching EstablishmentUpdate)
  identification_document_number?: string; // CNPJ or CPF
  legal_representative_document_number?: string; // CPF do representante
  legal_representative_birth_date?: string; // Data de nascimento do representante
  legal_representative_phone?: string; // Celular do representante
  company_name?: string; // Nome da empresa
  trade_name?: string; // Nome fantasia
  business_segment?: string; // Segmento
  website?: string;
  activity_description?: string; // Descrição da atividade
  postal_code?: string; // CEP
  state?: string; // Estado
  city?: string; // Cidade
  street?: string; // Logradouro
  number?: string; // Número
  complement?: string; // Complemento
  neighborhood?: string; // Bairro
  identification_document_file_url?: string;
  address_proof_file_url?: string;
  articles_of_incorporation_file_url?: string;
  
  // Form-specific fields (not API fields)
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  aceitaTermos?: boolean;
  
  // Document information (stored after upload)
  contratoSocial?: { file: File; documentId?: number; url?: string; uploading?: boolean; error?: boolean };
  rgRepresentante?: { file: File; documentId?: number; url?: string; uploading?: boolean; error?: boolean };
  cpfDocumento?: { file: File; documentId?: number; url?: string; uploading?: boolean; error?: boolean };
  comprovanteEndereco?: { file: File; documentId?: number; url?: string; uploading?: boolean; error?: boolean };

  // Shared fields for both account types
  telefone?: string; // Shared phone field for both juridica and fisica
  dataNascimento?: string; // Shared birth date field for both types
  
  // Legacy field mappings for backwards compatibility
  cnpj?: string; // Maps to identification_document_number
  cpfRepresentante?: string; // Maps to legal_representative_document_number
  dataNascimentoRepresentante?: string; // Maps to legal_representative_birth_date
  celularRepresentante?: string; // Maps to legal_representative_phone
  cpf?: string; // Maps to identification_document_number (for pessoa física)
  celular?: string; // For pessoa física phone
  nomeEmpresa?: string; // Maps to company_name
  nomeFantasia?: string; // Maps to trade_name
  segmento?: string; // Maps to business_segment
  descricaoAtividade?: string; // Maps to activity_description
  cep?: string; // Maps to postal_code
  estado?: string; // Maps to state
  logradouro?: string; // Maps to street
  numero?: string; // Maps to number
  bairro?: string; // Maps to neighborhood
  cidade?: string; // Maps to city
  complemento?: string; // Maps to complement
}

const steps = [
  { id: 1, title: "Dados da conta", icon: User },
  { id: 2, title: "Dados do negócio", icon: Building2 },
  { id: 3, title: "Endereço", icon: MapPin },
  { id: 4, title: "Carregar documentos", icon: Upload },
  { id: 5, title: "Confirmação", icon: CheckCircle },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountTypeSetByUser, setAccountTypeSetByUser] = useState(false);
  const [showDateValidation, setShowDateValidation] = useState(false);
  const [hasAutoDetectedInitialStep, setHasAutoDetectedInitialStep] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    accountType: undefined as any,
    nomeEmpresa: "",
    segmento: "",
    descricaoAtividade: "",
    cep: "",
    estado: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
    // Shared fields for both account types
    identification_document_number: "", // Shared document field (CPF/CNPJ)
    telefone: "", // Shared phone field
    dataNascimento: "", // Shared birth date field
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use the step detection hook
  const { isStepCompleted, determineCurrentStep, checkAllDocumentsUploaded } = useOnboardingSteps(data);

  // API hooks for establishment data
  const {
    data: currentEstablishment,
    isLoading: establishmentLoading,
    error: establishmentError,
    refetch: refetchEstablishment,
  } = useCurrentEstablishment();

  const updateEstablishmentMutation = useUpdateCurrentEstablishment({
    onSuccess: () => {
      toast({
        title: "✅ Dados atualizados com sucesso!",
        description: "As informações do estabelecimento foram salvas.",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar dados",
        description: handleApiError(error),
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const createEstablishmentMutation = useCreateEstablishment({
    onSuccess: () => {
      toast({
        title: "✅ Estabelecimento criado com sucesso!",
        description: "Seu estabelecimento foi criado e os dados foram salvos.",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar estabelecimento",
        description: handleApiError(error),
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Load existing establishment data and handle initial setup
  useEffect(() => {
    const timer = setTimeout(() => {
      // If we have establishment data, populate the form
      if (currentEstablishment && !establishmentLoading) {
        // Determine account type based on establishment type or document length
        let detectedAccountType: AccountType | undefined = undefined;
        if (currentEstablishment.type) {
          // Use API type if available
          detectedAccountType = currentEstablishment.type === EstablishmentType.BUSINESS ? "juridica" : "fisica";
        } else if (currentEstablishment.identification_document_number) {
          // Fallback to document length detection
          const docLength = currentEstablishment.identification_document_number.replace(/\D/g, '').length;
          detectedAccountType = docLength === 14 ? "juridica" : "fisica";
        }

        setData(prev => ({
          ...prev,
          // Set account type from establishment data only if user hasn't manually selected one
          accountType: accountTypeSetByUser ? prev.accountType : (prev.accountType || detectedAccountType),
          
          // Map API fields to form fields
          identification_document_number: currentEstablishment.identification_document_number,
          legal_representative_document_number: currentEstablishment.legal_representative_document_number || undefined,
          legal_representative_birth_date: currentEstablishment.legal_representative_birth_date || undefined,
          legal_representative_phone: currentEstablishment.legal_representative_phone || undefined,
          company_name: currentEstablishment.company_name || undefined,
          trade_name: currentEstablishment.trade_name || undefined,
          business_segment: currentEstablishment.business_segment || undefined,
          website: currentEstablishment.website || undefined,
          activity_description: currentEstablishment.activity_description || undefined,
          postal_code: currentEstablishment.postal_code || undefined,
          state: currentEstablishment.state || undefined,
          city: currentEstablishment.city || undefined,
          street: currentEstablishment.street || undefined,
          number: currentEstablishment.number || undefined,
          complement: currentEstablishment.complement || undefined,
          neighborhood: currentEstablishment.neighborhood || undefined,
          identification_document_file_url: currentEstablishment.identification_document_file_url || undefined,
          address_proof_file_url: currentEstablishment.address_proof_file_url || undefined,
          articles_of_incorporation_file_url: currentEstablishment.articles_of_incorporation_file_url || undefined,
          
          // Legacy field mappings for existing UI
          cnpj: detectedAccountType === "juridica" ? formatCNPJ(currentEstablishment.identification_document_number || '') : undefined,
          cpf: detectedAccountType === "fisica" ? formatCPF(currentEstablishment.identification_document_number || '') : undefined,
          cpfRepresentante: currentEstablishment.legal_representative_document_number ? formatCPF(currentEstablishment.legal_representative_document_number) : undefined,
          // Shared fields
          telefone: currentEstablishment.legal_representative_phone ? formatPhone(currentEstablishment.legal_representative_phone) : undefined,
          dataNascimento: currentEstablishment.legal_representative_birth_date ? convertDateFromAPI(currentEstablishment.legal_representative_birth_date) : undefined,
          
          // Legacy fields for compatibility
          dataNascimentoRepresentante: currentEstablishment.legal_representative_birth_date ? convertDateFromAPI(currentEstablishment.legal_representative_birth_date) : undefined,
          celularRepresentante: detectedAccountType === "juridica" && currentEstablishment.legal_representative_phone ? formatPhone(currentEstablishment.legal_representative_phone) : undefined,
          celular: detectedAccountType === "fisica" && currentEstablishment.legal_representative_phone ? formatPhone(currentEstablishment.legal_representative_phone) : undefined,
          nomeEmpresa: currentEstablishment.company_name || "",
          nomeFantasia: currentEstablishment.trade_name || undefined,
          segmento: currentEstablishment.business_segment || "",
          descricaoAtividade: currentEstablishment.activity_description || "",
          cep: currentEstablishment.postal_code || "",
          estado: currentEstablishment.state || "",
          logradouro: currentEstablishment.street || "",
          numero: currentEstablishment.number || "",
          bairro: currentEstablishment.neighborhood || "",
          cidade: currentEstablishment.city || "",
          complemento: currentEstablishment.complement || undefined,
        }));

        // Reconstruct document objects from API nested document data
        const reconstructDocumentObject = (documentSummary: any) => {
          if (!documentSummary) return null;
          
          // Create a mock File object with the original filename
          const mockFile = new File([""], documentSummary.original_filename, {
            type: documentSummary.file_type,
          });
          
          return {
            file: mockFile,
            documentId: documentSummary.id,
            url: undefined, // We don't need the URL anymore since we have document IDs
            uploading: false,
            error: false,
          };
        };

        // Map nested documents back to form document objects based on account type
        if (detectedAccountType === "juridica") {
          // For juridica (business):
          // - articles_of_incorporation_document maps to contratoSocial
          // - identification_document maps to rgRepresentante  
          // - address_proof_document maps to comprovanteEndereco
          if (currentEstablishment.articles_of_incorporation_document) {
            updateData("contratoSocial", reconstructDocumentObject(currentEstablishment.articles_of_incorporation_document));
          }
          if (currentEstablishment.identification_document) {
            updateData("rgRepresentante", reconstructDocumentObject(currentEstablishment.identification_document));
          }
          if (currentEstablishment.address_proof_document) {
            updateData("comprovanteEndereco", reconstructDocumentObject(currentEstablishment.address_proof_document));
          }
        } else if (detectedAccountType === "fisica") {
          // For fisica (personal):
          // - identification_document maps to cpfDocumento
          // - address_proof_document maps to comprovanteEndereco
          if (currentEstablishment.identification_document) {
            updateData("cpfDocumento", reconstructDocumentObject(currentEstablishment.identification_document));
          }
          if (currentEstablishment.address_proof_document) {
            updateData("comprovanteEndereco", reconstructDocumentObject(currentEstablishment.address_proof_document));
          }
        }
        
        // If we loaded a valid account type from API, mark it as set by user to prevent overwrites
        if (detectedAccountType && !accountTypeSetByUser) {
          setAccountTypeSetByUser(true);
        }
      }

      setIsLoading(false);
      
    }, 100);
    return () => clearTimeout(timer);
  }, [currentEstablishment, establishmentLoading]);

  // Separate useEffect for step detection that runs after data is loaded
  useEffect(() => {
    // Only run step detection after loading is complete
    if (isLoading) return;

    // Automatically determine which step should be active based on completed data
    // Only use URL step parameter if specifically provided, otherwise use auto-detection
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= 5) {
        setCurrentStep(stepNumber);
      } else {
        // Invalid step parameter, use auto-detection
        const appropriateStep = determineCurrentStep();
        setCurrentStep(appropriateStep);
      }
    } else if (!hasAutoDetectedInitialStep) {
      // No step parameter and haven't auto-detected yet, use auto-detection for initial load
      const appropriateStep = determineCurrentStep();
      console.log('Auto-detecting step:', appropriateStep, 'Current data:', data);
      setCurrentStep(appropriateStep);
      setHasAutoDetectedInitialStep(true);
    }
  }, [isLoading, searchParams, hasAutoDetectedInitialStep, determineCurrentStep, data]);

  // Debounced date validation
  useEffect(() => {
    if (data.dataNascimento && data.dataNascimento.length > 0) {
      const timer = setTimeout(() => {
        setShowDateValidation(true);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setShowDateValidation(false);
      };
    } else {
      setShowDateValidation(false);
    }
  }, [data.dataNascimento]);

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Function to convert form data to API format
  const convertToApiFormat = (formData: OnboardingData): EstablishmentUpdate => {
    // Clean and convert identification document number (shared field for both CPF and CNPJ)
    const cleanedIdentificationDoc = formData.identification_document_number ? 
      formData.identification_document_number.replace(/\D/g, '') : undefined;
    
    // Clean CPF representative document - only for BUSINESS type, null for PERSONAL type
    let cleanedRepresentativeDoc: string | null | undefined = undefined;
    if (formData.accountType === "juridica" && formData.cpfRepresentante) {
      cleanedRepresentativeDoc = formData.cpfRepresentante.replace(/\D/g, '');
    } else if (formData.accountType === "fisica") {
      cleanedRepresentativeDoc = null;
    }
    
    // Convert account type to establishment type enum
    let establishmentType: EstablishmentType | undefined = undefined;
    if (formData.accountType === "juridica") {
      establishmentType = EstablishmentType.BUSINESS;
    } else if (formData.accountType === "fisica") {
      establishmentType = EstablishmentType.PERSONAL;
    }
    
    // Convert dates to API format - use shared field first, then fallback to legacy fields
    let convertedBirthDate: string | undefined;
    if (formData.dataNascimento) {
      convertedBirthDate = convertDateToAPI(formData.dataNascimento);
    } else if (formData.dataNascimentoRepresentante) {
      convertedBirthDate = convertDateToAPI(formData.dataNascimentoRepresentante);
    } else if (formData.legal_representative_birth_date) {
      convertedBirthDate = convertDateToAPI(formData.legal_representative_birth_date);
    }

    // Clean phone number - use shared field first, then fallback to legacy fields
    let cleanedPhoneNumber: string | undefined = undefined;
    const phoneNumber = formData.telefone || formData.celularRepresentante || formData.celular || formData.legal_representative_phone;
    if (phoneNumber) {
      cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    }

    // Map document IDs based on your specification
    let identificationDocumentId: number | null | undefined = undefined;
    let addressProofDocumentId: number | null | undefined = undefined;
    let articlesOfIncorporationDocumentId: number | null | undefined = undefined;

    if (formData.accountType === "juridica") {
      // For juridica (business):
      // - contratoSocial maps to articles_of_incorporation_document_id
      // - rgRepresentante maps to identification_document_id
      // - comprovanteEndereco maps to address_proof_document_id
      articlesOfIncorporationDocumentId = formData.contratoSocial?.documentId || null;
      identificationDocumentId = formData.rgRepresentante?.documentId || null;
      addressProofDocumentId = formData.comprovanteEndereco?.documentId || null;
    } else if (formData.accountType === "fisica") {
      // For fisica (personal):
      // - cpfDocumento maps to identification_document_id
      // - comprovanteEndereco maps to address_proof_document_id
      identificationDocumentId = formData.cpfDocumento?.documentId || null;
      addressProofDocumentId = formData.comprovanteEndereco?.documentId || null;
      articlesOfIncorporationDocumentId = null; // Not applicable for personal accounts
    }

    const result: any = {
      identification_document_number: cleanedIdentificationDoc,
      type: establishmentType,
      legal_representative_document_number: cleanedRepresentativeDoc,
      legal_representative_birth_date: convertedBirthDate,
      legal_representative_phone: cleanedPhoneNumber,
      company_name: formData.nomeEmpresa || formData.company_name,
      trade_name: formData.nomeFantasia || formData.trade_name,
      business_segment: formData.segmento || formData.business_segment,
      website: formData.website,
      activity_description: formData.descricaoAtividade || formData.activity_description,
      postal_code: formData.cep || formData.postal_code,
      state: formData.estado || formData.state,
      city: formData.cidade || formData.city,
      street: formData.logradouro || formData.street,
      number: formData.numero || formData.number,
      complement: formData.complemento || formData.complement,
      neighborhood: formData.bairro || formData.neighborhood,
    };

    // Only include document IDs when they have actual values
    if (identificationDocumentId) {
      result.identification_document_id = identificationDocumentId;
    }
    if (addressProofDocumentId) {
      result.address_proof_document_id = addressProofDocumentId;
    }
    if (articlesOfIncorporationDocumentId) {
      result.articles_of_incorporation_document_id = articlesOfIncorporationDocumentId;
    }

    return result;
  };

  const getStepRelevantFields = (step: number, formData: OnboardingData): Partial<EstablishmentUpdate> => {
    const apiData = convertToApiFormat(formData);
    
    switch (step) {
      case 1:
        // Step 1: Account/Personal data
        return {
          identification_document_number: apiData.identification_document_number,
          type: apiData.type,
          legal_representative_document_number: apiData.legal_representative_document_number,
          legal_representative_birth_date: apiData.legal_representative_birth_date,
          legal_representative_phone: apiData.legal_representative_phone,
        };
      case 2:
        // Step 2: Business data
        return {
          company_name: apiData.company_name,
          trade_name: apiData.trade_name,
          business_segment: apiData.business_segment,
          website: apiData.website,
          activity_description: apiData.activity_description,
        };
      case 3:
        // Step 3: Address data
        return {
          postal_code: apiData.postal_code,
          state: apiData.state,
          city: apiData.city,
          street: apiData.street,
          number: apiData.number,
          complement: apiData.complement,
          neighborhood: apiData.neighborhood,
        };
      case 4:
        // Step 4: Documents (only document IDs, no file URLs)
        return {
          identification_document_id: apiData.identification_document_id,
          address_proof_document_id: apiData.address_proof_document_id,
          articles_of_incorporation_document_id: apiData.articles_of_incorporation_document_id,
        };
      default:
        // Full data for step 5 or completion
        return apiData;
    }
  };

  const saveDataToAPI = async (step?: number) => {
    try {
      let apiData: Partial<EstablishmentUpdate>;
      
      if (step) {
        // Send only step-relevant fields
        apiData = getStepRelevantFields(step, data);
      } else {
        // Send all data (for completion)
        apiData = convertToApiFormat(data);
      }

      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(apiData).filter(([_, value]) => value !== undefined)
      ) as EstablishmentUpdate;
      

      
      if (currentEstablishment) {
        // Update existing establishment
        await updateEstablishmentMutation.mutateAsync(filteredData);
      } else {
        // Create new establishment - need at least identification_document_number
        const createData: EstablishmentCreate = {
          identification_document_number: filteredData.identification_document_number || '',
          ...filteredData
        };
        await createEstablishmentMutation.mutateAsync(createData);
      }
    } catch (error) {
      console.error('Error saving establishment data:', error);
      throw error;
    }
  };

  const nextStep = async () => {
    // Save data to API when advancing through steps with meaningful data
    const hasBasicData = data.identification_document_number || data.cnpj || data.cpf || data.nomeEmpresa;
    const hasDocuments = data.contratoSocial || data.rgRepresentante || data.cpfDocumento || data.comprovanteEndereco;
    
    if (currentStep <= 4 && (hasBasicData || (currentStep === 4 && hasDocuments))) {
      try {
        await saveDataToAPI(currentStep);
      } catch (error) {
        // Don't block navigation on save errors, but show toast
        console.error('Failed to save data:', error);
      }
    }
    
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      // Update URL with step parameter
      navigate(`/onboarding?step=${newStep}`, { replace: true });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      // Update URL with step parameter
      navigate(`/onboarding?step=${newStep}`, { replace: true });
    }
  };

  const handleBackToStart = () => {
    // Always go back to dashboard - account type can now be changed within step 1
    navigate("/");
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Save final data to API
      await saveDataToAPI();
      
      // Check if all documents are uploaded
      const allDocumentsUploaded = checkAllDocumentsUploaded;
      
      if (allDocumentsUploaded) {
        toast({
          title: "✅ Cadastro Finalizado com Sucesso!",
          description: "Seus dados e documentos foram enviados para análise. Nossa equipe revisará todas as informações e você receberá uma resposta por email em até 3 dias úteis. Agradecemos pela confiança!",
          duration: 5000,
        });
      } else {
        toast({
          title: "✅ Cadastro Atualizado com Sucesso!",
          description: "Suas informações foram salvas! Ainda há documentos pendentes que precisam ser enviados. Você encontrará um lembrete na tela inicial para completar o envio.",
          duration: 5000,
        });
      }
      
      // Navigate back to dashboard after successful save
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Erro ao salvar dados",
        description: "Houve um problema ao salvar suas informações. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (field: string, file: File | null) => {
    if (!file) {
      updateData(field, null);
      return;
    }

    // Validate file before upload
    const validation = validateFile(file, 5);
    if (!validation.isValid) {
      toast({
        title: "Erro no arquivo",
        description: validation.error,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Set uploading state and clear any previous error
    updateData(field, { file, uploading: true, error: false });

    try {
      // Get document title based on field
      const getDocumentTitle = (fieldName: string) => {
        switch (fieldName) {
          case 'contratoSocial': return 'Contrato Social / CNPJ';
          case 'rgRepresentante': return 'RG/CNH do Representante';
          case 'cpfDocumento': return 'RG ou CNH';
          case 'comprovanteEndereco': return 'Comprovante de Endereço';
          default: return 'Documento';
        }
      };

      // Upload file using API
      const document = await uploadFile(file, getDocumentTitle(field));

      // Update data with successful upload
      updateData(field, {
        file,
        documentId: document.id,
        url: document.download_url || `${document.s3_bucket}/${document.s3_key}`,
        uploading: false,
        error: false
      });

      toast({
        title: "✅ Arquivo enviado com sucesso!",
        description: `${getDocumentTitle(field)} foi enviado e está sendo processado.`,
        duration: 3000,
      });

      // Check if all documents are now uploaded
      setTimeout(() => {
        const allDocsComplete = checkAllDocumentsUploaded;
        if (allDocsComplete) {
          localStorage.setItem('allDocumentsCompleted', 'true');
          toast({
            title: "✅ Todos os Documentos Enviados!",
            description: "Parabéns! Todos os documentos obrigatórios foram enviados com sucesso. O lembrete na tela inicial será removido automaticamente.",
            duration: 5000,
          });
        }
      }, 100);

    } catch (error) {
      console.error('File upload failed:', error);
      
      // Set error state while keeping file info for retry
      updateData(field, { file, uploading: false, error: true });
      
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar o arquivo. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const openFileSelector = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // Helper function to get file status display
  const getFileStatusDisplay = (docData: any, fieldName?: string) => {
    if (!docData) return null;
    
    if (docData.uploading) {
      return <p className="text-xs text-blue-600 mt-1">📤 Enviando...</p>;
    }
    
    if (docData.error) {
      return (
        <p 
          className="text-xs text-red-600 mt-1 cursor-pointer hover:text-red-700 hover:underline" 
          onClick={() => fieldName && handleFileUpload(fieldName, docData.file)}
        >
          ❌ Erro no envio - Clique para tentar novamente
        </p>
      );
    }
    
    if (docData.documentId || docData.url) {
      return <p className="text-xs text-green-600 mt-1">✓ {docData.file.name}</p>;
    }
    
    // Fallback - should not happen with new logic
    return <p className="text-xs text-gray-600 mt-1">Aguardando envio...</p>;
  };

  // Função para formatar data no input (DD/MM/AAAA)
  const formatDateInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para validar data
  const isValidDate = (dateString: string) => {
    if (dateString.length !== 10) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year &&
           year >= 1900 && 
           year <= new Date().getFullYear() &&
           date <= new Date();
  };

  // Função para converter data DD/MM/YYYY para YYYY-MM-DD
  const convertDateToAPI = (dateString: string): string | undefined => {
    if (!dateString || dateString.length !== 10) return undefined;
    
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return undefined;
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Função para converter data YYYY-MM-DD para DD/MM/YYYY
  const convertDateFromAPI = (dateString: string): string => {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return '';
    
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  };

  // Função para aplicar máscara CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  // Função para aplicar máscara CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  // Função para aplicar máscara telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };
  // Função para verificar se os documentos foram enviados
  const getDocumentStatus = () => {
    if (data.accountType === "juridica") {
      const hasContratoSocial = !!data.contratoSocial;
      const hasRgRepresentante = !!data.rgRepresentante;
      const hasComprovanteEndereco = !!data.comprovanteEndereco;
      const allDocumentsSent = hasContratoSocial && hasRgRepresentante && hasComprovanteEndereco;
      
      return {
        status: allDocumentsSent ? "Enviados com sucesso" : "Pendente",
        color: allDocumentsSent ? "text-green-600" : "text-amber-600",
        validation: allDocumentsSent ? "Aguardando análise" : "Aguardando envio",
        validationColor: allDocumentsSent ? "text-amber-600" : "text-red-600"
      };
    } else {
      const hasCpfDocumento = !!data.cpfDocumento;
      const hasComprovanteEndereco = !!data.comprovanteEndereco;
      const allDocumentsSent = hasCpfDocumento && hasComprovanteEndereco;
      
      return {
        status: allDocumentsSent ? "Enviados com sucesso" : "Pendente", 
        color: allDocumentsSent ? "text-green-600" : "text-amber-600",
        validation: allDocumentsSent ? "Aguardando análise" : "Aguardando envio",
        validationColor: allDocumentsSent ? "text-amber-600" : "text-red-600"
      };
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Dados da Conta</h2>
              <p className="text-boost-text-secondary">Selecione o tipo de conta e insira os dados para iniciar o seu cadastro.</p>
            </div>

            {/* Account Type Selection */}
            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-boost-text-primary">Tipo de Conta</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      updateData("accountType", "juridica");
                      setAccountTypeSetByUser(true);
                      // Clear the shared document field when changing type
                      updateData("identification_document_number", "");
                    }}
                    className={`p-4 border rounded-lg transition-colors text-center space-y-2 ${
                      data.accountType === "juridica" 
                        ? "border-boost-accent bg-boost-accent/10 text-boost-accent"
                        : "border-boost-border hover:border-boost-accent"
                    }`}
                  >
                    <Building2 className="h-6 w-6 mx-auto" />
                    <div>
                      <div className="font-medium">Pessoa Jurídica</div>
                      <div className="text-xs opacity-70">CNPJ</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      updateData("accountType", "fisica");
                      setAccountTypeSetByUser(true);
                      // Clear the shared document field when changing type
                      updateData("identification_document_number", "");
                    }}
                    className={`p-4 border rounded-lg transition-colors text-center space-y-2 ${
                      data.accountType === "fisica" 
                        ? "border-boost-accent bg-boost-accent/10 text-boost-accent"
                        : "border-boost-border hover:border-boost-accent"
                    }`}
                  >
                    <User className="h-6 w-6 mx-auto" />
                    <div>
                      <div className="font-medium">Pessoa Física</div>
                      <div className="text-xs opacity-70">CPF</div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields - Show when account type is selected */}
            {data.accountType && (
              <Card className="border-boost-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-medium text-boost-text-primary">Dados Pessoais</h3>

                  {data.accountType === "juridica" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="identification_document_number">CNPJ</Label>
                        <BoostInput
                          id="identification_document_number"
                          placeholder="00.000.000/0000-00"
                          value={data.identification_document_number ? formatCNPJ(data.identification_document_number) : ""}
                          onChange={(e) => {
                            const formatted = formatCNPJ(e.target.value);
                            updateData("identification_document_number", formatted);
                          }}
                          maxLength={18}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpfRepresentante">CPF do representante legal</Label>
                        <BoostInput
                          id="cpfRepresentante"
                          placeholder="000.000.000-00"
                          value={data.cpfRepresentante || ""}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            updateData("cpfRepresentante", formatted);
                          }}
                          maxLength={14}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de nascimento do representante legal</Label>
                        <BoostInput
                          id="dataNascimento"
                          placeholder="DD/MM/AAAA"
                          icon={<Calendar className="h-4 w-4" />}
                          value={data.dataNascimento || ""}
                          onChange={(e) => {
                            const formatted = formatDateInput(e.target.value);
                            updateData("dataNascimento", formatted);
                          }}
                          maxLength={10}
                        />
                        {data.dataNascimento && showDateValidation && !isValidDate(data.dataNascimento) && (
                          <p className="text-xs text-red-500">
                            Digite uma data válida no formato DD/MM/AAAA
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Celular do representante legal</Label>
                        <BoostInput
                          id="telefone"
                          placeholder="(00) 00000-0000"
                          value={data.telefone || ""}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            updateData("telefone", formatted);
                          }}
                          maxLength={15}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="identification_document_number_pf">CPF</Label>
                        <BoostInput
                          id="identification_document_number_pf"
                          placeholder="000.000.000-00"
                          value={data.identification_document_number ? formatCPF(data.identification_document_number) : ""}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            updateData("identification_document_number", formatted);
                          }}
                          maxLength={14}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de nascimento</Label>
                        <BoostInput
                          id="dataNascimento"
                          placeholder="DD/MM/AAAA"
                          icon={<Calendar className="h-4 w-4" />}
                          value={data.dataNascimento || ""}
                          onChange={(e) => {
                            const formatted = formatDateInput(e.target.value);
                            updateData("dataNascimento", formatted);
                          }}
                          maxLength={10}
                        />
                        {data.dataNascimento && showDateValidation && !isValidDate(data.dataNascimento) && (
                          <p className="text-xs text-red-500">
                            Digite uma data válida no formato DD/MM/AAAA
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Celular</Label>
                        <BoostInput
                          id="telefone"
                          placeholder="(00) 00000-0000"
                          value={data.telefone || ""}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            updateData("telefone", formatted);
                          }}
                          maxLength={15}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Dados do Negócio</h2>
              <p className="text-boost-text-secondary">Informe os dados da sua empresa ou atividade profissional.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-boost-text-primary">Dados do Negócio</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <BoostInput
                    id="nomeEmpresa"
                    placeholder="Nome da sua empresa"
                    value={data.nomeEmpresa}
                    onChange={(e) => updateData("nomeEmpresa", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia (opcional)</Label>
                  <BoostInput
                    id="nomeFantasia"
                    placeholder="Nome fantasia"
                    value={data.nomeFantasia || ""}
                    onChange={(e) => updateData("nomeFantasia", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segmento">Segmento</Label>
                  <Select value={data.segmento} onValueChange={(value) => updateData("segmento", value)}>
                    <SelectTrigger className="boost-input">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="comercio">Comércio</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (opcional)</Label>
                  <BoostInput
                    id="website"
                    placeholder="https://www.seusite.com"
                    value={data.website || ""}
                    onChange={(e) => updateData("website", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricaoAtividade">Descrição da Atividade</Label>
                  <Textarea
                    id="descricaoAtividade"
                    placeholder="Descreva brevemente a atividade da empresa"
                    className="boost-input min-h-[100px] resize-none"
                    value={data.descricaoAtividade}
                    onChange={(e) => updateData("descricaoAtividade", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Endereço</h2>
              <p className="text-boost-text-secondary">Cadastre o endereço principal da sua empresa ou residência.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-boost-text-primary">Endereço</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <BoostInput
                    id="cep"
                    placeholder="00000-000"
                    value={data.cep}
                    onChange={(e) => updateData("cep", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <BoostInput
                      id="cidade"
                      placeholder="São Paulo"
                      value={data.cidade}
                      onChange={(e) => updateData("cidade", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <BoostInput
                      id="estado"
                      placeholder="SP"
                      value={data.estado}
                      onChange={(e) => updateData("estado", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <BoostInput
                    id="logradouro"
                    placeholder="Rua, Avenida, etc."
                    value={data.logradouro}
                    onChange={(e) => updateData("logradouro", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <BoostInput
                      id="numero"
                      placeholder="123"
                      value={data.numero}
                      onChange={(e) => updateData("numero", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <BoostInput
                      id="complemento"
                      placeholder="Apto 101"
                      value={data.complemento || ""}
                      onChange={(e) => updateData("complemento", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <BoostInput
                      id="bairro"
                      placeholder="Centro"
                      value={data.bairro}
                      onChange={(e) => updateData("bairro", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Banner para acesso direto via documentos pendentes */}
            {searchParams.get('step') === '4' && (
              <div className="bg-boost-bg-secondary border border-boost-border rounded-lg p-4 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-boost-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="h-4 w-4 text-boost-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-boost-text-primary mb-1">
                      Envio de Documentos Pendentes
                    </h4>
                    <p className="text-xs text-boost-text-secondary">
                      Complete o envio dos documentos necessários para finalizar a validação da sua conta.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Carregar Documentos</h2>
              <p className="text-boost-text-secondary">Envie os documentos necessários para validação da conta.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-boost-accent" />
                  <h3 className="text-lg font-medium text-boost-text-primary">Carregar Documentos</h3>
                </div>

                <div className="bg-boost-accent/10 border border-boost-accent/20 rounded-lg p-4">
                  <h4 className="font-medium text-boost-text-primary mb-2">Documentos Necessários</h4>
                  <p className="text-sm text-boost-text-secondary mb-3">Para validar sua conta, envie os documentos abaixo:</p>
                  <ul className="text-sm text-boost-text-primary space-y-1">
                    {data.accountType === "juridica" ? (
                      <>
                        <li>• Contrato Social ou CNPJ</li>
                        <li>• RG/CNH do representante legal</li>
                        <li>• CPF do representante legal</li>
                        <li>• Comprovante de endereço da empresa</li>
                      </>
                    ) : (
                      <>
                        <li>• RG ou CNH</li>
                        <li>• CPF</li>
                        <li>• Comprovante de endereço</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-4">
                  {data.accountType === "juridica" ? (
                    <>
                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">Contrato Social / CNPJ</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="contratoSocial"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("contratoSocial", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("contratoSocial")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.contratoSocial && getFileStatusDisplay(data.contratoSocial, "contratoSocial")}
                      </div>

                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">RG/CNH do Representante</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="rgRepresentante"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("rgRepresentante", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("rgRepresentante")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.rgRepresentante && getFileStatusDisplay(data.rgRepresentante, "rgRepresentante")}
                      </div>

                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">Comprovante de Endereço</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="comprovanteEndereco"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("comprovanteEndereco", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("comprovanteEndereco")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.comprovanteEndereco && getFileStatusDisplay(data.comprovanteEndereco, "comprovanteEndereco")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">RG ou CNH</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="cpfDocumento"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("cpfDocumento", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("cpfDocumento")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.cpfDocumento && getFileStatusDisplay(data.cpfDocumento, "cpfDocumento")}
                      </div>

                      <div className="border-2 border-dashed border-boost-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-boost-text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-boost-text-primary">Comprovante de Endereço</p>
                        <p className="text-xs text-boost-text-secondary">PDF, JPG ou PNG até 5MB</p>
                        <input
                          id="comprovanteEnderecoPF"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload("comprovanteEndereco", file);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => openFileSelector("comprovanteEnderecoPF")}
                        >
                          Selecionar arquivo
                        </Button>
                        {data.comprovanteEndereco && getFileStatusDisplay(data.comprovanteEndereco, "comprovanteEndereco")}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        <strong>Análise Rápida e Segura</strong>
                      </p>
                      <p className="text-sm text-blue-700">
                        Seus documentos serão analisados com segurança pela nossa equipe especializada. 
                        O processo de validação leva até 3 dias úteis, e você receberá uma notificação 
                        por email assim que sua conta estiver aprovada e pronta para uso.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-boost-text-primary">Confirmação</h2>
              <p className="text-boost-text-secondary">Revise todas as informações antes de finalizar o cadastro.</p>
            </div>

            <Card className="border-boost-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium text-boost-text-primary">Confirmação dos Dados</h3>
                </div>

                {/* Status dos documentos */}
                <div className={`border rounded-lg p-4 ${checkAllDocumentsUploaded ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} animate-fade-in`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {checkAllDocumentsUploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Upload className="h-5 w-5 text-blue-600" />
                    )}
                    <h4 className="font-medium">
                      {checkAllDocumentsUploaded ? 'Documentos Enviados' : 'Documentos Pendentes'}
                    </h4>
                  </div>
                  
                  <p className={`text-sm ${checkAllDocumentsUploaded ? 'text-green-700' : 'text-blue-700'}`}>
                    {checkAllDocumentsUploaded 
                      ? 'Todos os documentos obrigatórios foram enviados com sucesso! Seus dados estão prontos para análise.'
                      : 'Você pode criar sua conta agora e enviar os documentos pendentes posteriormente. Um lembrete será exibido na tela inicial para completar o envio quando desejar.'
                    }
                  </p>
                  
                  {/* Lista de status dos documentos */}
                  <div className="mt-3 space-y-1">
                    {data.accountType === "juridica" ? (
                      <>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.contratoSocial?.documentId ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-amber-400"></div>
                          }
                          <span className={data.contratoSocial?.documentId ? 'text-green-700' : 'text-blue-700'}>
                            Contrato Social ou CNPJ
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.rgRepresentante?.documentId ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.rgRepresentante?.documentId ? 'text-green-700' : 'text-blue-700'}>
                            RG/CNH do representante legal
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.comprovanteEndereco?.documentId ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.comprovanteEndereco?.documentId ? 'text-green-700' : 'text-blue-700'}>
                            Comprovante de endereço da empresa
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.cpfDocumento?.documentId ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.cpfDocumento?.documentId ? 'text-green-700' : 'text-blue-700'}>
                            RG ou CNH
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.comprovanteEndereco?.documentId ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            <div className="h-3 w-3 rounded-full border border-blue-400"></div>
                          }
                          <span className={data.comprovanteEndereco?.documentId ? 'text-green-700' : 'text-blue-700'}>
                            Comprovante de endereço
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Próximos Passos:</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Após finalizar o cadastro, nossa equipe analisará seus dados e documentos. 
                    Você receberá uma resposta por email em até 3 dias úteis com o status da sua conta.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Tipo de Conta</h4>
                    <p className="text-sm text-boost-text-secondary">
                      {data.accountType === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"}
                    </p>
                  </div>

                  {data.accountType === "juridica" ? (
                    <div className="border border-boost-border rounded-lg p-4">
                      <h4 className="font-medium text-boost-text-primary mb-3">Dados da Conta</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-boost-text-secondary">CNPJ:</span>
                          <p className="font-medium">{data.identification_document_number ? formatCNPJ(data.identification_document_number) : data.cnpj}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">CPF do Representante:</span>
                          <p className="font-medium">{data.cpfRepresentante}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Data de Nascimento:</span>
                          <p className="font-medium">{data.dataNascimentoRepresentante || "-"}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Celular:</span>
                          <p className="font-medium">{data.telefone}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-boost-border rounded-lg p-4">
                      <h4 className="font-medium text-boost-text-primary mb-3">Dados da Conta</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-boost-text-secondary">CPF:</span>
                          <p className="font-medium">{data.identification_document_number ? formatCPF(data.identification_document_number) : data.cpf}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Data de Nascimento:</span>
                          <p className="font-medium">{data.dataNascimento || "-"}</p>
                        </div>
                        <div>
                          <span className="text-boost-text-secondary">Celular:</span>
                          <p className="font-medium">{data.telefone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Dados do Negócio</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-boost-text-secondary">Nome da Empresa:</span>
                        <p className="font-medium">{data.nomeEmpresa}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Segmento:</span>
                        <p className="font-medium">{data.segmento}</p>
                      </div>
                      {data.website && (
                        <div>
                          <span className="text-boost-text-secondary">Website:</span>
                          <p className="font-medium">{data.website}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-boost-text-secondary">Descrição da Atividade:</span>
                        <p className="font-medium">{data.descricaoAtividade}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Endereço</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-boost-text-secondary">CEP:</span>
                        <p className="font-medium">{data.cep}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Logradouro:</span>
                        <p className="font-medium">{data.logradouro}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Número:</span>
                        <p className="font-medium">{data.numero}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Bairro:</span>
                        <p className="font-medium">{data.bairro}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Cidade:</span>
                        <p className="font-medium">{data.cidade}</p>
                      </div>
                      <div>
                        <span className="text-boost-text-secondary">Estado:</span>
                        <p className="font-medium">{data.estado}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-boost-border rounded-lg p-4">
                    <h4 className="font-medium text-boost-text-primary mb-3">Documentos</h4>
                    <div className="text-sm space-y-2">
                      {(() => {
                        const docStatus = getDocumentStatus();
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-boost-text-secondary">Status dos documentos:</span>
                              <span className={`font-medium ${docStatus.color}`}>{docStatus.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-boost-text-secondary">Validação:</span>
                              <span className={`font-medium ${docStatus.validationColor}`}>{docStatus.validation}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-boost-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-boost-text-primary font-bold text-2xl">LB</span>
          </div>
          <p className="text-boost-text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-boost-bg-primary flex">
      {/* Sidebar */}
      <div className="w-80 bg-boost-bg-primary border-r border-boost-border p-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-boost-text-primary font-bold text-2xl">LB</span>
          </div>
          <div className="space-y-1">
            <Progress value={(currentStep / 5) * 100} className="h-2" />
            <p className="text-sm text-boost-text-secondary">Etapa {currentStep} de 5</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-boost-accent/10 text-boost-accent"
                    : isCompleted
                    ? "text-boost-text-primary"
                    : "text-boost-text-secondary"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-boost-accent text-white"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-boost-bg-tertiary text-boost-text-secondary"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* Botão Voltar para Tela Principal */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 text-boost-text-secondary hover:text-boost-text-primary hover:bg-boost-bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para tela principal</span>
              </Button>
            </div>

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleBackToStart}
                  className="flex items-center space-x-2 text-boost-text-secondary hover:text-boost-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar ao dashboard</span>
                </Button>
              )}

              {currentStep < 5 ? (
                <Button 
                  onClick={nextStep} 
                  className="flex items-center space-x-2"
                  disabled={
                    !data.accountType && currentStep === 1
                  }
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting}
                  className={`${
                    checkAllDocumentsUploaded 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white flex items-center space-x-2 disabled:opacity-70 transition-all duration-300`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {checkAllDocumentsUploaded ? 'Finalizar Cadastro' : 'Criar Conta'}
                      </span>
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}