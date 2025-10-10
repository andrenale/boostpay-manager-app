import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  useAllCurrentEstablishmentProducts, 
  useCreateCurrentEstablishmentProduct 
} from '../hooks/useProducts';
import { useEstablishment } from '../hooks/useEstablishment';
import { ProductCreate } from '../types/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, Package, Plus, ArrowLeft } from 'lucide-react';

export const ProductsApiTest: React.FC = () => {
  const { isAuthenticated, isLoading, setHardcodedToken } = useAuth();
  const { 
    establishmentId, 
    establishments, 
    isLoading: establishmentLoading,
    switchEstablishment,
    hasMultipleEstablishments,
    currentRole 
  } = useEstablishment();
  const [token, setToken] = useState<string>('');
  const [newProduct, setNewProduct] = useState<Omit<ProductCreate, 'establishment_id'>>({
    code: '',
    name: '',
    description: '',
    price: 0,
  });

  // Products query using global establishment
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useAllCurrentEstablishmentProducts({
    enabled: isAuthenticated && !!establishmentId,
  });

  // Create product mutation using global establishment
  const createProductMutation = useCreateCurrentEstablishmentProduct({
    onSuccess: () => {
      setNewProduct({
        code: '',
        name: '',
        description: '',
        price: 0,
      });
    },
  });

  const handleSetToken = () => {
    if (token.trim()) {
      setHardcodedToken(token.trim());
    }
  };

  const handleCreateProduct = () => {
    if (newProduct.code && newProduct.name && newProduct.price) {
      createProductMutation.mutate({
        code: newProduct.code,
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: Number(newProduct.price),
      });
    }
  };

  if (isLoading || establishmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Products API Test</CardTitle>
            <CardDescription>
              Enter your API token to test the Products integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium mb-1">
                API Token
              </label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your API token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSetToken} 
              disabled={!token.trim()}
              className="w-full"
            >
              Connect to API
            </Button>
            <div className="pt-4 border-t">
              <Link to="/dev/api-tests">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to API Tests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dev/api-tests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Products API Test</h1>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Connected
        </Badge>
      </div>

      {/* Establishment Management */}
      <Card>
        <CardHeader>
          <CardTitle>Current Establishment</CardTitle>
          <CardDescription>
            {establishmentId ? `ID: ${establishmentId} | Role: ${currentRole}` : 'No establishment selected'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {hasMultipleEstablishments && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Switch to:</label>
                <select
                  value={establishmentId || ''}
                  onChange={(e) => switchEstablishment(Number(e.target.value))}
                  className="px-3 py-1 border rounded-md"
                >
                  {establishments?.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.id} ({est.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => refetchProducts()}
              disabled={productsLoading || !establishmentId}
            >
              Refresh Products
            </Button>
          </div>
          {!establishmentId && (
            <div className="mt-2 text-red-600 text-sm">
              ⚠️ No establishment ID available. Check your token or contact support.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Product */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <Input
                placeholder="Product code"
                value={newProduct.code}
                onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                placeholder="Product description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateProduct}
            disabled={createProductMutation.isPending || !newProduct.code || !newProduct.name || !establishmentId}
            className="w-full"
          >
            {createProductMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Product
          </Button>
          {createProductMutation.error && (
            <p className="text-sm text-red-600">
              Error: {createProductMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Products List
            {productsLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {establishmentId ? `Showing products for establishment ${establishmentId}` : 'No establishment selected'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsError && (
            <div className="text-red-600 p-4 bg-red-50 rounded-md mb-4">
              <strong>Error:</strong> {productsError.message}
            </div>
          )}
          
          {products && products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found for this establishment.
            </div>
          )}

          {products && products.length > 0 && (
            <div className="space-y-2">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      Code: {product.code} • ID: {product.id}
                    </div>
                    {product.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {product.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      ${product.price}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(product.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};