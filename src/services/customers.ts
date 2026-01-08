import { apiService } from './api';
import {
  CustomerCreate,
  CustomerUpdate,
  CustomerResponse,
  EstablishmentListQueryParams,
} from '../types/api';

class CustomersService {
  private basePath = '/customers';

  /**
   * Create a new customer
   * @param customerData Customer creation data
   * @returns Created customer
   */
  async create(customerData: CustomerCreate): Promise<CustomerResponse> {
    try {
      const response = await apiService.post<CustomerResponse>(
        `${this.basePath}/`,
        customerData
      );
      return response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * List customers for a specific establishment
   * @param params Query parameters including establishment_id and optional search
   * @returns Array of customers
   */
  async list(params: EstablishmentListQueryParams): Promise<CustomerResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('establishment_id', params.establishment_id.toString());
      
      if (params.skip !== undefined) {
        queryParams.append('skip', params.skip.toString());
      }
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.search !== undefined && params.search.trim() !== '') {
        queryParams.append('search', params.search.trim());
      }

      const response = await apiService.get<CustomerResponse[]>(
        `${this.basePath}/?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error listing customers:', error);
      throw error;
    }
  }

  /**
   * Get all customers for an establishment (fetches all pages)
   * @param establishmentId Establishment ID
   * @returns Array of all customers
   */
  async getAllForEstablishment(establishmentId: number): Promise<CustomerResponse[]> {
    try {
      // For now, just get all without pagination
      // In the future, this could implement automatic pagination
      return await this.list({ establishment_id: establishmentId });
    } catch (error) {
      console.error(`Error getting all customers for establishment ${establishmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific customer by ID
   * @param customerId Customer ID
   * @returns Customer details
   */
  async getById(customerId: number): Promise<CustomerResponse> {
    try {
      const response = await apiService.get<CustomerResponse>(
        `${this.basePath}/${customerId}`
      );
      return response;
    } catch (error) {
      console.error(`Error getting customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Update a customer
   * @param customerId Customer ID to update
   * @param updateData Customer update data
   * @returns Updated customer
   */
  async update(customerId: number, updateData: CustomerUpdate): Promise<CustomerResponse> {
    try {
      const response = await apiService.put<CustomerResponse>(
        `${this.basePath}/${customerId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(`Error updating customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Search customers by name, email, phone, or document
   * @param establishmentId Establishment ID
   * @param searchTerm Search term
   * @returns Array of matching customers
   */
  async search(establishmentId: number, searchTerm: string): Promise<CustomerResponse[]> {
    try {
      return await this.list({
        establishment_id: establishmentId,
        search: searchTerm,
      });
    } catch (error) {
      console.error(`Error searching customers for establishment ${establishmentId}:`, error);
      throw error;
    }
  }
}

export const customersService = new CustomersService();
