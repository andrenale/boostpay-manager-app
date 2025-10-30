import { apiService } from './api';

// Types based on the OpenAPI documentation
export interface DocumentUploadRequest {
  title: string;
  filename: string;
  content_type: string;
  file_size?: number;
}

export interface DocumentUploadResponse {
  document_id: number;
  upload_url: string;
  upload_fields: Record<string, string>;
  s3_key: string;
  expires_in: number;
}

export interface DocumentUploadConfirmation {
  etag: string;
  file_size?: number;
}

export interface DocumentResponse {
  id: number;
  title: string;
  s3_key: string;
  s3_bucket: string;
  s3_etag: string | null;
  file_type: string;
  file_size: number | null;
  original_filename: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  download_url?: string | null;
}

/**
 * Request a presigned upload URL for direct S3 upload
 */
export const requestUploadUrl = async (request: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
  return await apiService.post<DocumentUploadResponse>('/documents/upload/request', request);
};

/**
 * Upload file directly to S3 using presigned URL
 */
export const uploadFileToS3 = async (
  uploadUrl: string,
  uploadFields: Record<string, string>,
  file: File
): Promise<{ etag: string }> => {
  const formData = new FormData();
  
  // Add all the required fields from the presigned URL
  Object.entries(uploadFields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Add the file last (required by S3)
  formData.append('file', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Extract ETag from response headers
  const etag = response.headers.get('ETag')?.replace(/"/g, '') || '';
  
  return { etag };
};

/**
 * Confirm upload completion to validate and update document record
 */
export const confirmUploadCompletion = async (
  documentId: number,
  confirmation: DocumentUploadConfirmation
): Promise<DocumentResponse> => {
  return await apiService.post<DocumentResponse>(
    `/documents/${documentId}/confirm-upload`,
    confirmation
  );
};

/**
 * Get download URL for a document
 */
export const getDocumentDownloadUrl = async (
  documentId: number,
  expiration_time?: number
): Promise<{ download_url: string }> => {
  const params = expiration_time ? `?expiration_time=${expiration_time}` : '';
  return await apiService.get<{ download_url: string }>(
    `/documents/${documentId}/download${params}`
  );
};

/**
 * Complete file upload process: request URL, upload to S3, and confirm
 */
export const uploadFile = async (
  file: File,
  title: string
): Promise<DocumentResponse> => {
  try {
    // Step 1: Request upload URL
    const uploadRequest: DocumentUploadRequest = {
      title,
      filename: file.name,
      content_type: file.type,
      file_size: file.size,
    };

    const uploadResponse = await requestUploadUrl(uploadRequest);

    // Step 2: Upload to S3
    const s3Response = await uploadFileToS3(
      uploadResponse.upload_url,
      uploadResponse.upload_fields,
      file
    );

    // Step 3: Confirm upload
    const confirmation: DocumentUploadConfirmation = {
      etag: s3Response.etag,
      file_size: file.size,
    };

    const document = await confirmUploadCompletion(uploadResponse.document_id, confirmation);

    return document;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

/**
 * Helper function to get file type from filename
 */
export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Helper function to validate file before upload
 */
export const validateFile = (file: File, maxSizeInMB: number = 5): { isValid: boolean; error?: string } => {
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { isValid: false, error: `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB` };
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de arquivo não permitido. Use PDF, JPG, PNG, GIF, DOC ou DOCX.' };
  }

  return { isValid: true };
};