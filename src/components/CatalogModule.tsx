import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  X,
  Layers,
  Check,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { Product, ProductVariant } from '../types/pos';

interface CatalogModuleProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

const SAMPLE_IMAGES = [
  { label: 'Café / Bebidas', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
  { label: 'Panadería / Postres', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
  { label: 'Sandwich / Comida', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80' },
  { label: 'Ensaladas / Bowls', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
  { label: 'Jugos / Aguas', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80' },
  { label: 'Pastel / Tartas', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80' },
  { label: 'Snacks / Botanas', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
  { label: 'Accesorios / Varios', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80' },
];

export const CatalogModule: React.FC<CatalogModuleProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onUpdateStock,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for add/edit product
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Alimentos');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [image, setImage] = useState(SAMPLE_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Variant helper states
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('');

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSku(`ART-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Alimentos');
    setSalePrice('');
    setCostPrice('');
    setStock('20');
    setLowStockThreshold('5');
    setImage(SAMPLE_IMAGES[0].url);
    setDescription('');
    setHasVariants(false);
    setVariants([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setSalePrice(p.salePrice.toString());
    setCostPrice(p.costPrice.toString());
    setStock(p.stock.toString());
    setLowStockThreshold(p.lowStockThreshold.toString());
    setImage(p.image);
    setDescription(p.description || '');
    setHasVariants(!!p.hasVariants);
    setVariants(p.variants ? [...p.variants] : []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    const vPrice = parseFloat(newVariantPrice) || parseFloat(salePrice) || 0;
    const vStock = parseInt(newVariantStock, 10) || 10;
    const newV: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newVariantName.trim(),
      price: vPrice,
      stock: vStock,
    };
    setVariants([...variants, newV]);
    setNewVariantName('');
    setNewVariantPrice('');
    setNewVariantStock('');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedSalePrice = parseFloat(salePrice) || 0;
    const parsedCostPrice = parseFloat(costPrice) || 0;
    const parsedStock = parseInt(stock, 10) || 0;
    const parsedThreshold = parseInt(lowStockThreshold, 10) || 5;

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim() || `SKU-${Date.now()}`,
      category: category.trim() || 'General',
      salePrice: parsedSalePrice,
      costPrice: parsedCostPrice,
      stock: parsedStock,
      lowStockThreshold: parsedThreshold,
      image: image || SAMPLE_IMAGES[0].url,
      description: description.trim(),
      hasVariants: hasVariants && variants.length > 0,
      variants: hasVariants ? variants : undefined,
    };

    onSaveProduct(productData);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'Todos' || p.category === filterCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    let matchesStock = true;
    if (filterStockStatus === 'low') {
      matchesStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
    } else if (filterStockStatus === 'out') {
      matchesStock = p.stock <= 0;
    }

    return matchesCategory && matchesSearch && matchesStock;
  });

  return (
    <div className="max-w-7xl mx-auto w-full p-3 sm:p-6 space-y-4 pb-24 lg:pb-8">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Catálogo e Inventario
          </h2>
          <p className="text-xs text-slate-500">
            {products.length} productos registrados • Control de stock simple
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'Todos' ? 'Todas las Categorías' : c}
              </option>
            ))}
          </select>

          {/* Stock status filter */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setFilterStockStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterStockStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStockStatus('low')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterStockStatus === 'low'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Bajo Stock
            </button>
            <button
              onClick={() => setFilterStockStatus('out')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterStockStatus === 'out'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Agotados
            </button>
          </div>
        </div>
      </div>

      {/* Product Table & Responsive Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 p-6">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Sin productos coincidentes</p>
            <p className="text-xs text-slate-400 mt-1">
              Modifica los filtros o añade un nuevo producto al catálogo
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría / SKU</th>
                  <th className="py-3 px-4">Precio Venta</th>
                  <th className="py-3 px-4">Costo / Margen</th>
                  <th className="py-3 px-4">Stock Actual</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredProducts.map((prod) => {
                  const isOut = prod.stock <= 0;
                  const isLow = !isOut && prod.stock <= prod.lowStockThreshold;
                  const margin =
                    prod.salePrice > 0
                      ? (((prod.salePrice - prod.costPrice) / prod.salePrice) * 100).toFixed(0)
                      : '0';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition">
                      {/* Product Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.name}</span>
                            {prod.hasVariants && prod.variants && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                                <Layers className="w-3 h-3" />
                                {prod.variants.length} variantes
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{prod.category}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{prod.sku}</span>
                      </td>

                      {/* Sale price */}
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        ${prod.salePrice.toFixed(2)}
                      </td>

                      {/* Cost price & Margin */}
                      <td className="py-3 px-4">
                        <span className="text-slate-600 block">${prod.costPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {margin}% margen
                        </span>
                      </td>

                      {/* Stock with quick inline editor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                            <button
                              onClick={() => onUpdateStock(prod.id, Math.max(0, prod.stock - 1))}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span
                              className={`px-3 py-1 text-xs font-bold ${
                                isOut
                                  ? 'text-rose-600 bg-rose-50'
                                  : isLow
                                  ? 'text-amber-700 bg-amber-50'
                                  : 'text-slate-800'
                              }`}
                            >
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                          {isOut ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                              Agotado
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Bajo stock
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar producto"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar producto "${prod.name}"?`)) {
                                onDeleteProduct(prod.id);
                              }
                            }}
                            title="Eliminar producto"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Product Image Selection & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Foto del Producto</label>
                <div className="flex items-start gap-3">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer w-fit transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto desde tu dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Quick Preset Selector */}
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">
                        O selecciona foto de galería rápida:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {SAMPLE_IMAGES.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImage(sample.url)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${
                              image === sample.url
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {sample.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Café Espresso Doble"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="BEB-101"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Category, Sale Price, Cost Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    placeholder="Bebidas, Alimentos..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio de Venta ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="45.00"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio de Costo ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="15.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock and Low Stock Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Inicial (Unidades)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alerta de Stock Bajo (Mínimo)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasVariantsCheckbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label
                      htmlFor="hasVariantsCheckbox"
                      className="text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      Este producto tiene variantes (Tallas, Sabores, Medidas)
                    </label>
                  </div>
                </div>

                {hasVariants && (
                  <div className="space-y-3 pt-2">
                    {/* List of existing variants */}
                    {variants.length > 0 && (
                      <div className="space-y-1.5">
                        {variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                          >
                            <span className="font-bold text-slate-800">{v.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-emerald-700">
                                ${v.price.toFixed(2)}
                              </span>
                              <span className="text-slate-500">Stock: {v.stock}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new variant inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Nombre (ej. Grande)"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
                      />
                      <input
                        type="number"
                        placeholder="Precio ($)"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
