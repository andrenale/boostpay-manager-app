// Base types for common fields
export interface BaseEntity {
  id: number;
  created_at: string | null;
  updated_at: string | null;
}

// Validation Error (from FastAPI)
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Product Types
export interface ProductCreate {
  establishment_id: number;
  code: string; // max 32 chars, min 1
  name: string; // max 255 chars, min 1
  description?: string | null; // max 512 chars
  price: number | string; // number > 0 or decimal string pattern
  product_photo_url?: string | null; // URI format, max 2083 chars
}

export interface ProductUpdate {
  code?: string | null; // max 32 chars, min 1
  name?: string | null; // max 255 chars, min 1  
  description?: string | null; // max 512 chars
  price?: number | string | null; // number > 0 or decimal string pattern
  product_photo_url?: string | null; // URI format, max 2083 chars
}

export interface ProductResponse extends BaseEntity {
  establishment_id: number;
  code: string;
  name: string;
  description: string | null;
  price: string; // Always returned as string in decimal format
  product_photo_url: string | null;
}

// User Types
export interface UserCreate {
  email: string; // email format
  full_name: string; // max 255 chars, min 1
  is_active?: boolean; // default true
  password: string; // max 100 chars, min 8
}

export interface UserLogin {
  email: string; // email format
  password: string;
}

export interface UserUpdate {
  email?: string | null; // email format
  full_name?: string | null; // max 255 chars, min 1
  is_active?: boolean | null;
}

export interface UserResponse extends BaseEntity {
  email: string;
  full_name: string;
  is_active: boolean; // default true
  is_superuser: boolean;
}

// Authentication Types
export interface Token {
  access_token: string;
  token_type: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Customer Types
export interface CustomerCreate {
  establishment_id: number;
  name: string; // max 255 chars, min 1
  phone: string; // max 20 chars, min 8
  email?: string | null; // max 255 chars
  document_number: string; // max 32 chars, min 1
}

export interface CustomerUpdate {
  name?: string | null; // max 255 chars, min 1
  phone?: string | null; // max 20 chars, min 8
  email?: string | null; // max 255 chars
  document_number?: string | null; // max 32 chars, min 1
}

export interface CustomerResponse extends BaseEntity {
  establishment_id: number;
  name: string;
  phone: string;
  email: string | null;
  document_number: string;
}

// Transaction Types
export interface TransactionCreate {
  establishment_id: number;
  external_reference: string; // max 64 chars, min 1
  transaction_metadata?: Record<string, string> | null;
}

export interface TransactionUpdate {
  external_reference?: string | null; // max 64 chars, min 1
  transaction_metadata?: Record<string, string> | null;
}

export interface TransactionResponse extends BaseEntity {
  establishment_id: number;
  external_reference: string;
  transaction_metadata: Record<string, string> | null;
}

// Establishment Types
export interface EstablishmentCreate {
  identification_document_number: string; // max 32 chars, min 1 - Required field
  legal_representative_document_number?: string | null; // max 32 chars, min 1
  legal_representative_birth_date?: string | null; // date format
  legal_representative_phone?: string | null; // max 20 chars, min 8
  company_name?: string | null; // max 255 chars, min 1
  trade_name?: string | null; // max 255 chars
  business_segment?: string | null; // max 128 chars
  website?: string | null; // URI format, max 2083 chars
  activity_description?: string | null; // max 512 chars
  postal_code?: string | null; // max 16 chars, min 5
  state?: string | null; // max 64 chars, min 2
  city?: string | null; // max 128 chars, min 1
  street?: string | null; // max 128 chars, min 1
  number?: string | null; // max 16 chars, min 1
  complement?: string | null; // max 128 chars
  neighborhood?: string | null; // max 128 chars
  identification_document_file_url?: string | null; // URI format, max 2083 chars
  address_proof_file_url?: string | null; // URI format, max 2083 chars
  articles_of_incorporation_file_url?: string | null; // URI format, max 2083 chars
}

export interface EstablishmentResponse extends BaseEntity {
  identification_document_number: string;
  legal_representative_document_number?: string | null;
  legal_representative_birth_date?: string | null; // date format
  legal_representative_phone?: string | null;
  company_name?: string | null;
  trade_name?: string | null;
  business_segment?: string | null;
  website?: string | null;
  activity_description?: string | null;
  postal_code?: string | null;
  state?: string | null;
  city?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  identification_document_file_url?: string | null;
  address_proof_file_url?: string | null;
  articles_of_incorporation_file_url?: string | null;
}

export interface EstablishmentUpdate {
  identification_document_number?: string | null;
  legal_representative_document_number?: string | null;
  legal_representative_birth_date?: string | null;
  legal_representative_phone?: string | null;
  company_name?: string | null;
  trade_name?: string | null;
  business_segment?: string | null;
  website?: string | null;
  activity_description?: string | null;
  postal_code?: string | null;
  state?: string | null;
  city?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  identification_document_file_url?: string | null;
  address_proof_file_url?: string | null;
  articles_of_incorporation_file_url?: string | null;
}

// Document Types
export interface DocumentCreate {
  title: string; // max 255 chars, min 1
  content?: string | null;
}

export interface DocumentUpdate {
  title?: string | null; // max 255 chars, min 1
  content?: string | null;
}

export interface DocumentResponse extends BaseEntity {
  title: string;
  content: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  owner_id: number;
}

export interface DocumentWithOwner extends DocumentResponse {
  owner: UserResponse;
}

// File Upload Types
export interface FileUploadRequest {
  file: File;
  title: string;
  content?: string;
}

// API Response Wrapper (for consistency)
export interface ApiListResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  per_page?: number;
}

// Query Parameters
export interface ListQueryParams {
  skip?: number;
  limit?: number;
}

export interface EstablishmentQueryParams {
  establishment_id: number;
}

// Combined query params for establishment-specific endpoints
export interface EstablishmentListQueryParams extends ListQueryParams, EstablishmentQueryParams {}