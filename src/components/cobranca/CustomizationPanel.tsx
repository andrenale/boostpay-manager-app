import React from "react";
import { BoostButton } from "@/components/ui/boost-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Palette, Type } from "lucide-react";

export type Customization = {
  logo?: string;
  companyName: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  productImage?: string;
};

interface CustomizationPanelProps {
  customization: Customization;
  handleCustomizationChange: (field: keyof Customization, value: string) => void;
  logoInputRef: React.RefObject<HTMLInputElement>;
  productImageRef: React.RefObject<HTMLInputElement>;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleProductImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  customization,
  handleCustomizationChange,
  logoInputRef,
  productImageRef,
  handleLogoUpload,
  handleProductImageUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Identidade Visual */}
      <Card className="border border-boost-border bg-boost-bg-primary">
        <CardHeader>
          <CardTitle className="text-boost-text-primary flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Identidade Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de Logo */}
          <div>
            <Label htmlFor="logo-upload" className="text-boost-text-primary">
              Logo da Empresa
            </Label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="w-16 h-16 border border-boost-border rounded-lg flex items-center justify-center overflow-hidden">
                {customization.logo ? (
                  <img src={customization.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-boost-text-secondary" />
                )}
              </div>
              <BoostButton
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Logo
              </BoostButton>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Cores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-boost-text-primary">Cor de Fundo</Label>
              <div className="mt-2 flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-boost-border"
                  style={{ backgroundColor: customization.backgroundColor }}
                />
                <Input
                  type="color"
                  value={customization.backgroundColor}
                  onChange={(e) => handleCustomizationChange("backgroundColor", e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={customization.backgroundColor}
                  onChange={(e) => handleCustomizationChange("backgroundColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-boost-text-primary">Cor do Texto</Label>
              <div className="mt-2 flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-boost-border"
                  style={{ backgroundColor: customization.textColor }}
                />
                <Input
                  type="color"
                  value={customization.textColor}
                  onChange={(e) => handleCustomizationChange("textColor", e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={customization.textColor}
                  onChange={(e) => handleCustomizationChange("textColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-boost-text-primary">Cor Principal</Label>
              <div className="mt-2 flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-boost-border"
                  style={{ backgroundColor: customization.primaryColor }}
                />
                <Input
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange("primaryColor", e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange("primaryColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Cobrança */}
      <Card className="border border-boost-border bg-boost-bg-primary">
        <CardHeader>
          <CardTitle className="text-boost-text-primary flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Conteúdo da Cobrança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título e Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name" className="text-boost-text-primary">
                Nome da Empresa
              </Label>
              <Input
                id="company-name"
                value={customization.companyName}
                onChange={(e) => handleCustomizationChange("companyName", e.target.value)}
                placeholder="Ex: Minha Empresa"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="subtitle" className="text-boost-text-primary">
                Subtítulo
              </Label>
              <Input
                id="subtitle"
                value={customization.subtitle}
                onChange={(e) => handleCustomizationChange("subtitle", e.target.value)}
                placeholder="Ex: Pagamento Seguro"
                className="mt-2"
              />
            </div>
          </div>

          {/* Upload de Imagem do Produto */}
          <div>
            <Label htmlFor="product-image" className="text-boost-text-primary">
              Imagem do Produto/Serviço
            </Label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="w-16 h-16 border border-boost-border rounded-lg flex items-center justify-center overflow-hidden">
                {customization.productImage ? (
                  <img src={customization.productImage} alt="Produto" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-boost-text-secondary" />
                )}
              </div>
              <BoostButton
                variant="outline"
                onClick={() => productImageRef.current?.click()}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Imagem
              </BoostButton>
              {customization.productImage && (
                <BoostButton
                  variant="ghost"
                  onClick={() => handleCustomizationChange("productImage", "")}
                  className="text-red-500 hover:text-red-600"
                >
                  Remover
                </BoostButton>
              )}
              <input
                ref={productImageRef}
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationPanel;
