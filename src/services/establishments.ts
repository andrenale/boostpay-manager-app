import { apiService } from './api';
import { 
  EstablishmentCreate, 
  EstablishmentUpdate, 
  EstablishmentResponse,
  ListQueryParams
} from '../types/api';

/**
 * Service class for handling establishment-related API operations
 * Follows the same patterns as ProductsService for consistency
 */
class EstablishmentsService {
  private basePath: string = '/establishments';

  /**
   * Get all establishments with pagination
   * @param params Query parameters for pagination
   * @returns List of establishments
   */
  async list(params?: ListQueryParams): Promise<EstablishmentResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = queryParams.toString() 
        ? `${this.basePath}/?${queryParams.toString()}`
        : `${this.basePath}/`;

      const response = await apiService.get<EstablishmentResponse[]>(url);
      return response;
    } catch (error) {
      console.error('Error fetching establishments:', error);
      throw error;
    }
  }

  /**
   * Get establishment by ID
   * @param establishmentId Establishment ID
   * @returns Establishment data
   */
  async getById(establishmentId: number): Promise<EstablishmentResponse> {
    try {
      const response = await apiService.get<EstablishmentResponse>(
        `${this.basePath}/${establishmentId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching establishment ${establishmentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new establishment
   * @param establishmentData Establishment creation data
   * @returns Created establishment
   */
  async create(establishmentData: EstablishmentCreate): Promise<EstablishmentResponse> {
    try {
      const response = await apiService.post<EstablishmentResponse>(
        this.basePath + '/',
        establishmentData
      );
      return response;
    } catch (error) {
      console.error('Error creating establishment:', error);
      throw error;
    }
  }

  /**
   * Update an establishment
   * @param establishmentId Establishment ID to update
   * @param updateData Establishment update data
   * @returns Updated establishment
   */
  async update(establishmentId: number, updateData: EstablishmentUpdate): Promise<EstablishmentResponse> {
    try {
      const response = await apiService.put<EstablishmentResponse>(
        `${this.basePath}/${establishmentId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(`Error updating establishment ${establishmentId}:`, error);
      throw error;
    }
  }

  /**
   * Partially update an establishment
   * @param establishmentId Establishment ID to update
   * @param updateData Establishment partial update data
   * @returns Updated establishment
   */
  async patch(establishmentId: number, updateData: Partial<EstablishmentUpdate>): Promise<EstablishmentResponse> {
    try {
      const response = await apiService.patch<EstablishmentResponse>(
        `${this.basePath}/${establishmentId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(`Error patching establishment ${establishmentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an establishment (superuser only according to API spec)
   * @param establishmentId Establishment ID to delete
   * @returns void
   */
  async delete(establishmentId: number): Promise<void> {
    try {
      await apiService.delete(`${this.basePath}/${establishmentId}`);
    } catch (error) {
      console.error(`Error deleting establishment ${establishmentId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const establishmentsService = new EstablishmentsService();