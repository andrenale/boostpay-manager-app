import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Image as ImageIcon, X } from "lucide-react";
import { BoostCard, BoostCardContent } from "@/components/ui/boost-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  createdAt: Date;
}

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);

  // Carregar produtos do localStorage
  useEffect(() => {
    const produtosSalvos = localStorage.getItem('boost-produtos');
    if (produtosSalvos) {
      const produtosParseados = JSON.parse(produtosSalvos);
      // Converter as datas de string para Date
      const produtosComDatas = produtosParseados.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
      setProducts(produtosComDatas);
    } else {
      // Produtos iniciais mock
      const produtosIniciais: Product[] = [
        {
          id: "prod_FXZtYydpFLYqNa",
          name: "cerveja",
          description: "",
          price: 10.00,
          createdAt: new Date("2025-09-25T22:21:00"),
        },
        {
          id: "prod_Q26E6ckXuJCoWB",
          name: "coloca",
          description: "",
          price: 20.00,
          createdAt: new Date("2025-09-25T22:21:00"),
        },
      ];
      setProducts(produtosIniciais);
      localStorage.setItem('boost-produtos', JSON.stringify(produtosIniciais));
    }
  }, []);

  // Filtrar produtos
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          setEditingProduct({ ...editingProduct, imageUrl });
        } else {
          setNewProduct({ ...newProduct, imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (isEdit: boolean = false) => {
    if (isEdit && editingProduct) {
      setEditingProduct({ ...editingProduct, imageUrl: undefined });
    } else {
      setNewProduct({ ...newProduct, imageUrl: "" });
    }
  };

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const productToAdd: Product = {
      id: newProduct.id || `prod_${Math.random().toString(36).substring(2, 15)}`,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl || undefined,
      createdAt: new Date(),
    };

    const novosProdutos = [productToAdd, ...products];
    setProducts(novosProdutos);
    localStorage.setItem('boost-produtos', JSON.stringify(novosProdutos));
    
    setIsCreateModalOpen(false);
    setNewProduct({ id: "", name: "", description: "", price: "", imageUrl: "" });
    
    toast({
      title: "Produto criado",
      description: "O produto foi criado com sucesso",
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    const produtosAtualizados = products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    );
    setProducts(produtosAtualizados);
    localStorage.setItem('boost-produtos', JSON.stringify(produtosAtualizados));
    
    setIsEditModalOpen(false);
    setEditingProduct(null);
    
    toast({
      title: "Produto atualizado",
      description: "O produto foi atualizado com sucesso",
    });
  };

  const handleDeleteProduct = (id: string) => {
    const produtosFiltrados = products.filter(p => p.id !== id);
    setProducts(produtosFiltrados);
    localStorage.setItem('boost-produtos', JSON.stringify(produtosFiltrados));
    
    toast({
      title: "Produto excluído",
      description: "O produto foi excluído com sucesso",
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

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
                      {product.createdAt.toLocaleDateString('pt-BR', {
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
                          onClick={() => handleDeleteProduct(product.id)}
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
              <Label htmlFor="productId" className="text-boost-text-primary">
                Id do Produto
              </Label>
              <Input
                id="productId"
                placeholder="Id do produto..."
                value={newProduct.id}
                onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
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
              {newProduct.imageUrl ? (
                <div className="relative">
                  <img
                    src={newProduct.imageUrl}
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
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
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
                {editingProduct.imageUrl ? (
                  <div className="relative">
                    <img
                      src={editingProduct.imageUrl}
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
    </div>
  );
};

export default Produtos;
