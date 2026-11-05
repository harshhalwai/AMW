import { useState, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
import { Products, type Product } from "../../services/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section, StatCard, StatusBadge, EmptyState } from "@/components/ui-bits";
import {
  Package, Search, Plus, Filter, Tag, AlertTriangle, Layers,
  IndianRupee, Check, Pencil, Trash2, ShieldCheck, Star, Sparkles, X, ChevronRight, LayoutGrid, List
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/utils";

const CATEGORIES: Array<"All" | Product["category"]> = ["All", "Mobile", "Accessory", "Spare Part", "Gadget"];

export function ProductsList() {
  const { session } = useAuth();
  const isOwner = session?.role === "owner";
  const [q, setQ] = useState("");
  const [selectedCat, setSelectedCat] = useState<"All" | Product["category"]>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [tick, setTick] = useState(0);

  // Dialog state
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Mobile");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [warranty, setWarranty] = useState("");
  const [badge, setBadge] = useState("");
  const [specsInput, setSpecsInput] = useState("");
  const [image, setImage] = useState("");

  const allProducts = Products.all();

  const filtered = useMemo(() => {
    let list = allProducts;
    if (selectedCat !== "All") {
      list = list.filter(p => p.category === selectedCat);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          (p.sku && p.sku.toLowerCase().includes(s))
      );
    }
    return list;
  }, [allProducts, selectedCat, q, tick]);

  // Inventory KPI calculations
  const totalStockCount = allProducts.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = allProducts.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = allProducts.filter(p => p.stock === 0).length;

  const openNewModal = () => {
    setIsNew(true);
    setEditing(null);
    setName("");
    setBrand("");
    setCategory("Mobile");
    setSku(`AMW-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrice("");
    setOriginalPrice("");
    setStock("10");
    setWarranty("1 Year Warranty");
    setBadge("");
    setSpecsInput("");
    setImage("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80");
    setDialogOpen(true);
  };

  const openEditModal = (p: Product) => {
    setIsNew(false);
    setEditing(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setSku(p.sku || "");
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setStock(String(p.stock));
    setWarranty(p.warranty || "");
    setBadge(p.badge || "");
    setSpecsInput(p.specs ? p.specs.join(", ") : "");
    setImage(p.image || "");
    setDialogOpen(true);
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !price) {
      toast.error("Please fill required fields (Name, Brand, Price)");
      return;
    }

    const priceNum = Number(price);
    const stockNum = Math.max(0, parseInt(stock, 10) || 0);
    const specsArray = specsInput
      ? specsInput.split(",").map(s => s.trim()).filter(Boolean)
      : ["Genuine Product", "Tested Quality"];

    const updated: Product = {
      id: editing?.id || `PROD-${Date.now().toString().slice(-5)}`,
      sku: sku.trim() || `AMW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      brand: brand.trim(),
      category,
      price: priceNum,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: stockNum,
      rating: editing?.rating || 4.8,
      reviewsCount: editing?.reviewsCount || 1,
      image: image.trim() || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      badge: badge.trim() || undefined,
      specs: specsArray,
      inStock: stockNum > 0,
      warranty: warranty.trim() || "Standard Shop Warranty",
    };

    Products.upsert(updated);
    toast.success(isNew ? "New product added to inventory" : "Product updated successfully");
    setDialogOpen(false);
    setTick(t => t + 1);
  };

  const handleDelete = (p: Product) => {
    if (!confirm(`Are you sure you want to remove "${p.name}" from inventory?`)) return;
    Products.remove(p.id);
    toast.success("Product removed from inventory");
    setTick(t => t + 1);
  };

  const adjustStock = (id: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    Products.updateStock(id, next);
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Inventory & Products
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
            Product & Spare Parts Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time stock controls, replacement parts inventory, and mobile merchandise
          </p>
        </div>

        {isOwner && (
          <Button onClick={openNewModal} className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl">
            <Plus className="size-4 mr-1.5" /> Add New Item
          </Button>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Catalog Items"
          value={allProducts.length}
          icon={<Package className="size-5" />}
          accent="primary"
          sub="Active SKU items"
        />
        <StatCard
          label="Total Stock Units"
          value={totalStockCount}
          icon={<Layers className="size-5" />}
          accent="success"
          sub="In-store inventory"
        />
        <StatCard
          label="Inventory Value"
          value={`₹${totalInventoryValue.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="size-5" />}
          accent="primary"
          sub="Valuation at retail"
        />
        <StatCard
          label="Low / Out of Stock"
          value={`${lowStockCount + outOfStockCount}`}
          icon={<AlertTriangle className="size-5" />}
          accent={lowStockCount + outOfStockCount > 0 ? "warning" : "success"}
          sub={`${lowStockCount} low · ${outOfStockCount} out`}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3 rounded-2xl border border-border/80">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by product name, brand, SKU..."
            className="pl-9 bg-secondary/50 border-border/60 focus-visible:ring-[#FF5733] rounded-xl text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="size-4 text-muted-foreground shrink-0 ml-1 hidden sm:block" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap",
                selectedCat === cat
                  ? "bg-[#FF5733] text-white border-[#FF5733] shadow-elegant"
                  : "bg-secondary/40 text-muted-foreground border-border/70 hover:text-white hover:border-border"
              )}
            >
              {cat}
            </button>
          ))}

          <div className="hidden lg:flex items-center border border-border/70 rounded-xl p-0.5 bg-secondary/40 ml-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-lg", viewMode === "grid" ? "bg-card text-white shadow-sm" : "text-muted-foreground")}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn("p-1.5 rounded-lg", viewMode === "table" ? "bg-card text-white shadow-sm" : "text-muted-foreground")}
              title="Table View"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Grid or Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search query or selected category filter."
          action={
            <Button variant="outline" size="sm" onClick={() => { setQ(""); setSelectedCat("All"); }}>
              Reset Filters
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(product => {
            const isLow = product.stock > 0 && product.stock <= 5;
            const isOut = product.stock === 0;
            return (
              <div
                key={product.id}
                className="group relative rounded-2xl border border-border/80 bg-card p-4 hover:border-[#FF5733]/50 transition-all duration-300 flex flex-col justify-between shadow-card hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-secondary mb-3 border border-border/60">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF5733] text-white shadow-md">
                        {product.badge}
                      </span>
                    )}
                    <span className="absolute top-2.5 right-2.5">
                      <StatusBadge status={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"} />
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    <span>{product.brand}</span>
                    <span>•</span>
                    <span className="text-[#FF784E]">{product.category}</span>
                    {product.sku && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{product.sku}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#FF784E] transition-colors line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-black text-white font-mono">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through font-mono">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {product.specs && product.specs.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {product.specs.slice(0, 3).map((spec, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-secondary/80 border border-border/60 text-muted-foreground">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Stock:</span>
                    <span className={cn("text-xs font-bold font-mono px-2 py-0.5 rounded", isOut ? "bg-red-500/15 text-red-400" : isLow ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400")}>
                      {product.stock} units
                    </span>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustStock(product.id, product.stock, -1)}
                        className="size-7 rounded-lg border border-border/80 bg-secondary/60 hover:bg-[#FF5733]/20 hover:border-[#FF5733] text-white text-xs font-bold grid place-items-center"
                        title="Reduce stock"
                      >
                        -
                      </button>
                      <button
                        onClick={() => adjustStock(product.id, product.stock, 1)}
                        className="size-7 rounded-lg border border-border/80 bg-secondary/60 hover:bg-[#FF5733]/20 hover:border-[#FF5733] text-white text-xs font-bold grid place-items-center"
                        title="Add stock"
                      >
                        +
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="size-7 rounded-lg border border-border/80 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-white grid place-items-center ml-1"
                        title="Edit details"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="size-7 rounded-lg border border-border/80 bg-secondary/60 hover:bg-red-500/20 hover:border-red-500 text-muted-foreground hover:text-red-400 grid place-items-center"
                        title="Delete product"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/60 border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map(p => {
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock === 0;
                  return (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="size-10 rounded-lg object-cover bg-secondary border border-border/60 shrink-0" />
                          <div>
                            <div className="font-bold text-white line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-muted-foreground">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-muted-foreground">{p.category}</td>
                      <td className="p-3.5 font-mono text-xs">{p.sku || "—"}</td>
                      <td className="p-3.5 font-bold font-mono text-white">₹{p.price.toLocaleString("en-IN")}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"} />
                          <span className="font-mono text-xs text-muted-foreground font-semibold">({p.stock})</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isOwner && (
                            <>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-white"
                                title="Edit"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p)}
                                className="p-1.5 rounded-lg border border-border hover:bg-red-500/20 hover:border-red-500 text-muted-foreground hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/90 rounded-2xl p-6 w-full max-w-xl shadow-elegant max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="size-5 text-[#FF5733]" />
                {isNew ? "Add New Inventory Product" : "Edit Product Details"}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="p-1 text-muted-foreground hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-4 pt-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Brand *</Label>
                  <Input
                    required
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Apple, Samsung, OnePlus"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-card px-3 text-xs text-white"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="Accessory">Accessory</option>
                    <option value="Spare Part">Spare Part</option>
                    <option value="Gadget">Gadget</option>
                  </select>
                </div>
                <div>
                  <Label>SKU / Barcode</Label>
                  <Input
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="e.g. AMW-APL-15"
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label>Badge / Tag</Label>
                  <Input
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="e.g. OEM Grade, Bestseller"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Selling Price (₹) *</Label>
                  <Input
                    required
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="4999"
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label>Original MRP (₹)</Label>
                  <Input
                    type="number"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    placeholder="5999"
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label>Stock Quantity *</Label>
                  <Input
                    required
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    placeholder="10"
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label>Warranty Duration</Label>
                <Input
                  value={warranty}
                  onChange={e => setWarranty(e.target.value)}
                  placeholder="e.g. 90 Days Replacement / 1 Year Official"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Key Specifications (comma-separated)</Label>
                <Input
                  value={specsInput}
                  onChange={e => setSpecsInput(e.target.value)}
                  placeholder="e.g. 256GB, Super Retina OLED, 48MP Camera"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#FF5733] hover:bg-[#FF784E] text-white">
                  {isNew ? "Save Product" : "Update Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

