import { apiService } from './api';
import {
  ProductCreate,
  ProductUpdate,
  ProductResponse,
  EstablishmentListQueryParams,
  ListQueryParams,
} from '../types/api';

export class ProductsService {
  private readonly basePath = '/products';

  /**
   * Create a new product
   * @param productData Product creation data
   * @returns Created product
   */
  async create(productData: ProductCreate): Promise<ProductResponse> {
    try {
      const response = await apiService.post<ProductResponse>(
        `${this.basePath}/`,
        productData
      );
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * List products for a specific establishment
   * @param params Query parameters including establishment_id
   * @returns Array of products
   */
  async list(params: EstablishmentListQueryParams): Promise<ProductResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('establishment_id', params.establishment_id.toString());
      
      if (params.skip !== undefined) {
        queryParams.append('skip', params.skip.toString());
      }
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }

      const response = await apiService.get<ProductResponse[]>(
        `${this.basePath}/?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  }

  /**
   * Get a specific product by ID
   * @param productId Product ID
   * @returns Product details
   */
  async getById(productId: number): Promise<ProductResponse> {
    try {
      const response = await apiService.get<ProductResponse>(
        `${this.basePath}/${productId}`
      );
      return response;
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Update a product
   * @param productId Product ID to update
   * @param updateData Product update data
   * @returns Updated product
   */
  async update(productId: number, updateData: ProductUpdate): Promise<ProductResponse> {
    try {
      const response = await apiService.put<ProductResponse>(
        `${this.basePath}/${productId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Partially update a product
   * @param productId Product ID to update
   * @param updateData Product partial update data
   * @returns Updated product
   */
  async patch(productId: number, updateData: Partial<ProductUpdate>): Promise<ProductResponse> {
    try {
      const response = await apiService.patch<ProductResponse>(
        `${this.basePath}/${productId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(`Error patching product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to get all products for an establishment (handles pagination automatically)
   * @param establishmentId Establishment ID
   * @param limit Maximum number of products per request (default: 100)
   * @returns All products for the establishment
   */
  async getAllForEstablishment(establishmentId: number, limit: number = 100): Promise<ProductResponse[]> {
    const allProducts: ProductResponse[] = [];
    let skip = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        const products = await this.list({
          establishment_id: establishmentId,
          skip,
          limit,
        });

        allProducts.push(...products);
        
        // If we got fewer products than the limit, we've reached the end
        hasMore = products.length === limit;
        skip += products.length;
      }

      return allProducts;
    } catch (error) {
      console.error(`Error getting all products for establishment ${establishmentId}:`, error);
      throw error;
    }
  }

  /**
   * Search products by name or code (client-side filtering)
   * @param establishmentId Establishment ID
   * @param searchTerm Search term to match against name or code
   * @returns Filtered products
   */
  async search(establishmentId: number, searchTerm: string): Promise<ProductResponse[]> {
    try {
      const products = await this.getAllForEstablishment(establishmentId);
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return products.filter(product => 
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.code.toLowerCase().includes(lowerSearchTerm) ||
        product.description?.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error(`Error searching products for establishment ${establishmentId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a product code exists for an establishment
   * @param establishmentId Establishment ID
   * @param code Product code to check
   * @param excludeProductId Optional product ID to exclude from check (for updates)
   * @returns True if code exists, false otherwise
   */
  async codeExists(establishmentId: number, code: string, excludeProductId?: number): Promise<boolean> {
    try {
      const products = await this.getAllForEstablishment(establishmentId);
      
      return products.some(product => 
        product.code.toLowerCase() === code.toLowerCase() && 
        product.id !== excludeProductId
      );
    } catch (error) {
      console.error(`Error checking product code existence:`, error);
      throw error;
    }
  }

  /**
   * Get products by price range
   * @param establishmentId Establishment ID
   * @param minPrice Minimum price (inclusive)
   * @param maxPrice Maximum price (inclusive)
   * @returns Products within price range
   */
  async getByPriceRange(
    establishmentId: number, 
    minPrice: number, 
    maxPrice: number
  ): Promise<ProductResponse[]> {
    try {
      const products = await this.getAllForEstablishment(establishmentId);
      
      return products.filter(product => {
        const price = parseFloat(product.price);
        return price >= minPrice && price <= maxPrice;
      });
    } catch (error) {
      console.error(`Error getting products by price range:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const productsService = new ProductsService();