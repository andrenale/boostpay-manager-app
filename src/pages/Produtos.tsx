import { useState, useRef, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Image as ImageIcon, X, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { BoostCard, BoostCardContent } from "@/components/ui/boost-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { 
  useAllCurrentEstablishmentProducts, 
  useCreateCurrentEstablishmentProduct, 
  useUpdateProduct,
  useDeleteCurrentEstablishmentProduct,
  useCurrentEstablishmentProductSearch,
  PRODUCTS_QUERY_KEYS 
} from "@/hooks/useProducts";
import { useEstablishment } from "@/hooks/useEstablishment";
import { ProductResponse, ProductCreate, ProductUpdate } from "@/types/api";
import { handleApiError } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

// Form state interfaces for better type safety

interface ProductFormState {
  code: string;
  name: string;
  description: string;
  price: string;
  product_photo_url: string;
}

interface EditingProductState extends Omit<ProductResponse, 'price'> {
  price: string | number; // Allow string for form input
}

interface DeleteConfirmation {
  isOpen: boolean;
  product: ProductResponse | null;
}

const Produtos = () => {
  // Component state
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProductState | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    product: null,
  });
  
  // Form state
  const [newProduct, setNewProduct] = useState<ProductFormState>({
    code: "",
    name: "",
    description: "",
    price: "",
    product_photo_url: "",
  });
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const queryClient = useQueryClient();
  const { establishmentId, isLoading: establishmentLoading } = useEstablishment();
  
  // API hooks for products
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch: refetchProducts 
  } = useAllCurrentEstablishmentProducts({
    enabled: !!establishmentId,
  });

  // Search functionality - use API search for better performance
  const shouldSearch = searchTerm.length >= 2;
  const { 
    data: searchResults,
    isLoading: searchLoading 
  } = useCurrentEstablishmentProductSearch(searchTerm, {
    enabled: shouldSearch,
  });

  // Determine which products to display
  const displayedProducts = useMemo(() => {
    if (shouldSearch) {
      return searchResults || [];
    }
    return products;
  }, [shouldSearch, searchResults, products]);

  // Mutations
  const createProductMutation = useCreateCurrentEstablishmentProduct({
    onSuccess: (newProduct) => {
      // Reset form and close modal
      setIsCreateModalOpen(false);
      setNewProduct({
        code: "",
        name: "",
        description: "",
        price: "",
        product_photo_url: "",
      });

      // Force a refetch of products to ensure UI is updated
      refetchProducts();

      toast({
        title: "Produto criado",
        description: `O produto "${newProduct.name}" foi criado com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar produto",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useUpdateProduct({
    onSuccess: (updatedProduct) => {
      setIsEditModalOpen(false);
      setEditingProduct(null);
      
      // Force a refetch of products to ensure UI is updated
      refetchProducts();
      
      toast({
        title: "Produto atualizado",
        description: `O produto "${updatedProduct.name}" foi atualizado com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useDeleteCurrentEstablishmentProduct({
    onSuccess: () => {
      const { product } = deleteConfirmation;
      
      // Force a refetch of products to ensure UI is updated
      refetchProducts();
      
      toast({
        title: "Produto excluído",
        description: `O produto "${product?.name}" foi excluído com sucesso`,
      });
      setDeleteConfirmation({ isOpen: false, product: null });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir produto",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  // Loading and error states
  const loadingState = establishmentLoading || isLoading || (shouldSearch && searchLoading);
  const hasError = error && !establishmentLoading;

  // Event handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        if (isEdit && editingProduct) {
          setEditingProduct({ 
            ...editingProduct, 
            product_photo_url: imageUrl 
          });
        } else {
          setNewProduct({ 
            ...newProduct, 
            product_photo_url: imageUrl 
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (isEdit: boolean = false) => {
    if (isEdit && editingProduct) {
      setEditingProduct({ 
        ...editingProduct, 
        product_photo_url: null 
      });
    } else {
      setNewProduct({ 
        ...newProduct, 
        product_photo_url: "" 
      });
    }
  };

  const handleCreateProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price.trim() || !newProduct.code.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (código, nome e preço)",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(newProduct.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Erro",
        description: "O preço deve ser um número válido maior que zero",
        variant: "destructive",
      });
      return;
    }

    const productData: Omit<ProductCreate, 'establishment_id'> = {
      code: newProduct.code.trim(),
      name: newProduct.name.trim(),
      description: newProduct.description.trim() || undefined,
      price: priceValue,
      product_photo_url: newProduct.product_photo_url || undefined,
    };

    createProductMutation.mutate(productData);
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const priceValue = typeof editingProduct.price === 'string' 
      ? parseFloat(editingProduct.price) 
      : editingProduct.price;

    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Erro",
        description: "O preço deve ser um número válido maior que zero",
        variant: "destructive",
      });
      return;
    }

    const updateData: ProductUpdate = {
      code: editingProduct.code,
      name: editingProduct.name.trim(),
      description: editingProduct.description?.trim() || undefined,
      price: priceValue,
      product_photo_url: editingProduct.product_photo_url || undefined,
    };

    updateProductMutation.mutate({
      id: editingProduct.id,
      data: updateData,
    });
  };

  const handleDeleteProduct = (product: ProductResponse) => {
    setDeleteConfirmation({
      isOpen: true,
      product,
    });
  };

  const confirmDelete = () => {
    const { product } = deleteConfirmation;
    if (!product) return;

    deleteProductMutation.mutate(product.id);
  };

  const openEditModal = (product: ProductResponse) => {
    setEditingProduct({ 
      ...product,
      price: product.price.toString() // Convert price to string for form input
    });
    setIsEditModalOpen(true);
  };

  const resetCreateForm = () => {
    setNewProduct({
      code: "",
      name: "",
      description: "",
      price: "",
      product_photo_url: "",
    });
    setIsCreateModalOpen(false);
  };

  const resetEditForm = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  // Filter products based on search
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle loading and error states
  if (loadingState) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-boost-text-primary">Produtos</h1>
        <div className="flex items-center justify-center py-10">
          <div className="text-boost-text-secondary">Carregando produtos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-boost-text-primary">Produtos</h1>
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="text-red-500">Erro ao carregar produtos: {handleApiError(error)}</div>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() })}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-boost-text-primary">Produtos</h1>
      </div>

      {/* Search and Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-boost-text-secondary h-4 w-4" />
          <Input
            placeholder="Pesquisar por nome ou ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-boost-bg-secondary border-boost-border text-boost-text-primary"
          />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar produto
        </Button>
      </div>

      {/* Products Table */}
      <BoostCard className="bg-boost-bg-secondary border-boost-border">
        <BoostCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-boost-border">
                  <th className="text-left py-4 px-6 text-sm font-medium text-boost-text-secondary">
                    ID DO PRODUTO
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-boost-text-secondary">
                    NOME
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-boost-text-secondary">
                    PREÇO
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-boost-text-secondary">
                    DATA DE CRIAÇÃO
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-boost-text-secondary">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-boost-border hover:bg-boost-bg-tertiary/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-boost-text-primary font-mono text-sm">
                      {product.id}
                    </td>
                    <td className="py-4 px-6 text-boost-text-primary">
                      {product.name}
                    </td>
                    <td className="py-4 px-6 text-boost-text-primary font-semibold">
                      {formatCurrency(product.price)} <span className="text-boost-text-secondary text-xs">BRL</span>
                    </td>
                    <td className="py-4 px-6 text-boost-text-secondary">
                      {new Date(product.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(product)}
                          className="h-8 w-8 text-boost-text-secondary hover:text-boost-text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-boost-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-boost-text-secondary">
              {filteredProducts.length} Resultado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-boost-text-secondary">
              Página 1 de 1
            </p>
          </div>
        </BoostCardContent>
      </BoostCard>

      {/* Create Product Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-boost-bg-primary border-boost-border">
          <DialogHeader>
            <DialogTitle className="text-boost-text-primary">Criar Produto</DialogTitle>
            <DialogDescription className="text-boost-text-secondary">
              Preencha os campos abaixo para criar um novo produto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productCode" className="text-boost-text-primary">
                Código do Produto
              </Label>
              <Input
                id="productCode"
                placeholder="Código do produto..."
                value={newProduct.code}
                onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productName" className="text-boost-text-primary">
                Nome do Produto
              </Label>
              <Input
                id="productName"
                placeholder="Nome do produto..."
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productDescription" className="text-boost-text-primary">
                Descrição
              </Label>
              <Textarea
                id="productDescription"
                placeholder="Descrição do produto..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productPrice" className="text-boost-text-primary">
                Valor
              </Label>
              <Input
                id="productPrice"
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-boost-text-primary">
                Foto do Produto <span className="text-boost-text-secondary text-xs">(opcional)</span>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                className="hidden"
              />
              {newProduct.product_photo_url ? (
                <div className="relative">
                  <img
                    src={newProduct.product_photo_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-boost-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveImage(false)}
                    className="absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-boost-border text-boost-text-primary hover:bg-boost-bg-tertiary justify-start"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Adicionar foto
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-boost-border text-boost-text-primary hover:bg-boost-bg-tertiary"
            >
              Voltar
            </Button>
            <Button
              onClick={handleCreateProduct}
              disabled={!newProduct.name || !newProduct.price}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-boost-bg-primary border-boost-border">
          <DialogHeader>
            <DialogTitle className="text-boost-text-primary">Editar Produto</DialogTitle>
            <DialogDescription className="text-boost-text-secondary">
              Atualize as informações do produto.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editProductId" className="text-boost-text-primary">
                  Id do Produto
                </Label>
                <Input
                  id="editProductId"
                  placeholder="Id do produto..."
                  value={editingProduct.id}
                  disabled
                  className="bg-boost-bg-secondary border-boost-border text-boost-text-secondary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProductName" className="text-boost-text-primary">
                  Nome do Produto
                </Label>
                <Input
                  id="editProductName"
                  placeholder="Nome do produto..."
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProductDescription" className="text-boost-text-primary">
                  Descrição
                </Label>
                <Textarea
                  id="editProductDescription"
                  placeholder="Descrição do produto..."
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProductPrice" className="text-boost-text-primary">
                  Valor
                </Label>
                <Input
                  id="editProductPrice"
                  type="number"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="bg-boost-bg-secondary border-boost-border text-boost-text-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-boost-text-primary">
                  Foto do Produto <span className="text-boost-text-secondary text-xs">(opcional)</span>
                </Label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                {editingProduct.product_photo_url ? (
                  <div className="relative">
                    <img
                      src={editingProduct.product_photo_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-boost-border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImage(true)}
                      className="absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                    className="border-boost-border text-boost-text-primary hover:bg-boost-bg-tertiary justify-start"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Adicionar foto
                  </Button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-boost-border text-boost-text-primary hover:bg-boost-bg-tertiary"
            >
              Voltar
            </Button>
            <Button
              onClick={handleEditProduct}
              disabled={!editingProduct?.name || !editingProduct?.price}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(open) => !open && setDeleteConfirmation({ isOpen: false, product: null })}
      >
        <AlertDialogContent className="bg-boost-bg-secondary border-boost-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-boost-text-primary">
              Excluir Produto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-boost-text-secondary">
              Tem certeza que deseja excluir o produto "{deleteConfirmation.product?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-boost-bg-primary border-boost-border text-boost-text-primary hover:bg-boost-bg-hover">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Produtos;
