'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { getProducts, getProductsByCategory, getProductsByBrand, Product, getImageUrl } from '@/lib/api/products';

const BRANCHES_LIST = [
  'All Branches',
  'Adama Branch',
  'Ayat Branch',
  'Bethel Branch',
  'Dire Dawa Branch',
  'Figa Branch',
  'Hawassa Branch',
  'Jemo Branch',
];

const COMMON_BRANDS = [
  'All Brands',
  'EPHARM (Ethiopian Pharm. Mfg.)',
  'Cadila Pharmaceuticals Ethiopia',
  'Julphar Pharmaceuticals',
  'Addis Pharmaceuticals Factory (APF)',
  'Novartis',
  'Sanofi',
  'GSK (GlaxoSmithKline)',
  'Pfizer',
  'AstraZeneca',
  'Denk Pharma Germany',
  'DKT Ethiopia',
  'Cipla',
  'Medreich',
  'Bayer',
  'CeraVe',
  'Neutrogena',
  'Gedeon Richter',
  'Johnson & Johnson',
  'Michu Health',
];

const COMMON_CATEGORIES = [
  'All Categories',
  'Medicine',
  'Supplement',
  'Cosmetic',
  'Medical Devices',
  'Personal Care',
  'Baby & Mother',
  'First Aid',
];

const getProductImageType = (name: string, category: string | null): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('syrup')) return 'syrup';
  if (nameLower.includes('tablet') || nameLower.includes('pill') || nameLower.includes('capsule') || nameLower.includes('tabletten')) return 'tablet';
  if (nameLower.includes('drop')) return 'drops';
  if (nameLower.includes('cream') || nameLower.includes('gel') || nameLower.includes('lotion') || nameLower.includes('balm') || nameLower.includes('gloss')) return 'cosmetic';
  if (nameLower.includes('spray')) return 'spray';
  if (nameLower.includes('device') || nameLower.includes('compressor') || nameLower.includes('nebulizer') || nameLower.includes('inhaler')) return 'device';

  // Fallback by category
  const catLower = (category ?? '').toLowerCase();
  if (catLower.includes('medicine')) return 'tablet';
  if (catLower.includes('cosmetic')) return 'cosmetic';
  if (catLower.includes('device')) return 'device';
  if (catLower.includes('personal')) return 'spray';
  if (catLower.includes('supplement')) return 'tablet';

  return 'generic';
};

const getProductBranches = (id: number): string[] => {
  const branches = [];
  if (id % 2 === 0) branches.push('Ayat Branch');
  if (id % 3 === 0) branches.push('Adama Branch');
  if (id % 5 === 0) branches.push('Hawassa Branch');
  if (id % 7 === 0) branches.push('Bethel Branch');
  if (id % 11 === 0) branches.push('Dire Dawa Branch');
  if (branches.length === 0) {
    branches.push('All Branches');
  }
  return branches;
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // API States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Category and Brand states synced with URL parameters
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlBrand = searchParams.get('brand') || '';

  // Local state for sidebar filters
  const [rxYes, setRxYes] = useState(false);
  const [rxNo, setRxNo] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (urlCategory) {
          const data = await getProductsByCategory(urlCategory);
          setProducts(data);
        } else if (urlBrand) {
          const data = await getProductsByBrand(urlBrand);
          setProducts(data);
        } else {
          const data = await getProducts();
          setProducts(data);
        }
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to connect to the products API.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [urlCategory, urlBrand]);

  // Sync category filter click or search input change
  useEffect(() => {
    // Scroll to top when url queries change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [urlCategory, urlSearch, urlBrand]);

  const handleBranchChange = (branch: string) => {
    if (branch === 'All Branches') {
      if (selectedBranches.includes('All Branches')) {
        setSelectedBranches([]);
      } else {
        setSelectedBranches(['All Branches']);
      }
      return;
    }

    setSelectedBranches((prev) => {
      const filtered = prev.filter((b) => b !== 'All Branches');
      if (filtered.includes(branch)) {
        return filtered.filter((b) => b !== branch);
      } else {
        return [...filtered, branch];
      }
    });
  };

  const handleClearFilters = () => {
    setRxYes(false);
    setRxNo(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedBranches([]);
    setSortBy('popularity');
    // Clear URL parameters
    router.push('/products');
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const isFav = prev.includes(id);
      if (isFav) {
        triggerToast('Removed item from your wishlist.');
        return prev.filter((wId) => wId !== id);
      } else {
        triggerToast('Added item to your wishlist!');
        return [...prev, id];
      }
    });
  };

  // Advanced Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query filter
      if (urlSearch) {
        const query = urlSearch.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = (product.brand ?? '').toLowerCase().includes(query);
        if (!matchesName && !matchesBrand) return false;
      }

      // 2. Category Dropdown filter
      if (urlCategory) {
        if ((product.category ?? '').toLowerCase() !== urlCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Brand Dropdown filter
      if (urlBrand) {
        if ((product.brand ?? '').toLowerCase() !== urlBrand.toLowerCase()) {
          return false;
        }
      }

      // 4. Prescription filter
      if (rxYes && !rxNo && !product.prescriptionRequired) return false;
      if (rxNo && !rxYes && product.prescriptionRequired) return false;

      // 5. Price Filter
      const priceVal = parseFloat(String(product.price)) || 0;
      if (minPrice && priceVal < parseFloat(minPrice)) return false;
      if (maxPrice && priceVal > parseFloat(maxPrice)) return false;

      // 6. Branches Filter
      const productBranches = getProductBranches(product.id);
      if (selectedBranches.length > 0 && !selectedBranches.includes('All Branches')) {
        const hasMatchingBranch = productBranches.some((branch) =>
          selectedBranches.includes(branch)
        );
        if (!hasMatchingBranch) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = parseFloat(String(a.price)) || 0;
      const priceB = parseFloat(String(b.price)) || 0;
      // Sorting
      if (sortBy === 'price-asc') {
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        return priceB - priceA;
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      // default: popularity (sort by id)
      return a.id - b.id;
    });
  }, [products, urlSearch, urlCategory, urlBrand, rxYes, rxNo, minPrice, maxPrice, selectedBranches, sortBy]);

  const renderProductIllustration = (type: string) => {
    const baseColor = 'flex items-center justify-center rounded-2xl w-full h-full relative';
    switch (type) {
      case 'syrup':
        return (
          <div className={`${baseColor} bg-emerald-50 text-emerald-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" />
            </svg>
          </div>
        );
      case 'tablet':
        return (
          <div className={`${baseColor} bg-blue-50 text-blue-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-10h.01M8 12h.01M16 12h.01M12 8h.01M12 16h.01" />
            </svg>
          </div>
        );
      case 'drops':
        return (
          <div className={`${baseColor} bg-teal-50 text-teal-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" />
            </svg>
          </div>
        );
      case 'cosmetic':
        return (
          <div className={`${baseColor} bg-purple-50 text-purple-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" />
            </svg>
          </div>
        );
      case 'device':
        return (
          <div className={`${baseColor} bg-amber-50 text-amber-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 3v2m6-2v2M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
        );
      case 'spray':
        return (
          <div className={`${baseColor} bg-pink-50 text-pink-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" />
            </svg>
          </div>
        );
      case 'generic':
      default:
        return (
          <div className={`${baseColor} bg-emerald-50 text-emerald-600`}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const renderProductImage = (product: Product) => {
    const fullImgUrl = getImageUrl(product.imageUrl);
    if (fullImgUrl) {
      return (
        <div className="w-full h-full relative">
          <img
            src={fullImgUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      );
    }
    const imageType = getProductImageType(product.name, product.category);
    return renderProductIllustration(imageType);
  };

  const renderProductAttributes = (attributes: any) => {
    if (!attributes || typeof attributes !== 'object') return null;
    const items = [];
    if (attributes.strength) items.push(`Strength: ${attributes.strength}`);
    if (attributes.dosage_form) items.push(`Form: ${attributes.dosage_form}`);
    if (attributes.spf) items.push(`SPF ${attributes.spf}`);
    if (attributes.shade) items.push(`Shade: ${attributes.shade}`);
    if (attributes.volume_ml) items.push(`${attributes.volume_ml}ml`);
    if (attributes.skin_type) items.push(`Skin: ${attributes.skin_type}`);
    if (attributes.flavor) items.push(`Flavor: ${attributes.flavor}`);

    if (items.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="text-[9px] font-bold text-gray-500 bg-neutral-50 border border-neutral-200/60 px-2 py-0.5 rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-brand-600 transition">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-400">Shop</span>
        <span>&gt;</span>
        <span className="text-brand-700">All Products</span>
      </nav>

      {/* Grid Layout: Left sidebar filters & right product listing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Sidebar Filters */}
        <aside className="space-y-6 lg:border-r lg:pr-6 border-gray-200 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin">
          <div className="flex items-center justify-between pb-3 border-b">
            <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <span>⚡</span>
              <span>Filters</span>
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 transition"
            >
              Clear All
            </button>
          </div>

          {/* Filter 1: Common Pharmacy Brands */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Shop by Brand</h3>
              {urlBrand && (
                <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded-full border border-brand-200">
                  {urlBrand}
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 space-y-1.5 text-xs">
              {COMMON_BRANDS.map((brandName) => {
                const isSelected = brandName === 'All Brands' ? !urlBrand : urlBrand === brandName;
                return (
                  <button
                    key={brandName}
                    type="button"
                    onClick={() => {
                      if (brandName === 'All Brands') {
                        router.push('/products');
                      } else {
                        router.push(`/products?brand=${encodeURIComponent(brandName)}`);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-600 text-white font-bold shadow-xs'
                        : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    <span className="truncate">{brandName}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 2: Categories */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CATEGORIES.map((cat) => {
                const isSelected = cat === 'All Categories' ? !urlCategory : urlCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      if (cat === 'All Categories') {
                        router.push('/products');
                      } else {
                        router.push(`/products?category=${encodeURIComponent(cat)}`);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 3: Prescription Required */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Prescription Required</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rxYes}
                  onChange={() => setRxYes(!rxYes)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-gray-300 transition"
                />
                <span>Rx Required</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rxNo}
                  onChange={() => setRxNo(!rxNo)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-gray-300 transition"
                />
                <span>Over-The-Counter (No Rx)</span>
              </label>
            </div>
          </div>

          {/* Filter 4: Price Range */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Price Range (ETB)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="MIN"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-gray-50/50"
              />
              <span className="text-gray-400 text-xs font-bold">-</span>
              <input
                type="number"
                placeholder="MAX"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Filter 5: Branches */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Branches Availability</h3>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 space-y-2 text-xs">
              {BRANCHES_LIST.map((branch) => (
                <label key={branch} className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      branch === 'All Branches'
                        ? selectedBranches.includes('All Branches')
                        : selectedBranches.includes(branch)
                    }
                    onChange={() => handleBranchChange(branch)}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-gray-300 transition"
                  />
                  <span className="truncate">{branch}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Catalog Listing */}
        <section className="lg:col-span-3 space-y-6">
          {/* List Toolbar header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Products</h1>
               {urlSearch && (
                 <p className="text-xs text-neutral-500 mt-1 font-semibold">
                   Showing results for: <span className="text-brand-700">&quot;{urlSearch}&quot;</span>
                 </p>
               )}
               {urlCategory && (
                 <p className="text-xs text-neutral-500 mt-1 font-semibold">
                   Category: <span className="text-brand-700">&quot;{urlCategory}&quot;</span>
                 </p>
               )}
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <label htmlFor="sort" className="text-xs font-bold text-gray-500 uppercase">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm rounded-lg border border-gray-300 bg-white px-3 py-1.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Active Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const isFav = wishlist.includes(String(product.id));
                const priceNum = parseFloat(String(product.price)) || 0;
                const productBranches = getProductBranches(product.id);
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col justify-between hover:shadow-xl transition duration-200"
                  >
                    <div>
                      {/* Product Illustration / Image Area */}
                      <Link href={`/products/${product.id}`} className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative shadow-inner bg-neutral-50 block">
                        {renderProductImage(product)}
                        {/* Rx Required Overlay */}
                        {product.prescriptionRequired && (
                          <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-red-200 shadow-sm z-10">
                            Rx Required
                          </span>
                        )}
                      </Link>
                      
                      {/* Product Title */}
                      <h3 className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition line-clamp-1">
                        <Link href={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      
                      {/* Brand Info */}
                      <p className="text-[11px] text-brand-600 font-semibold mt-0.5 uppercase tracking-wide">
                        {product.brand || 'Other'}
                      </p>

                      {/* Description snippet */}
                      {product.description && (
                        <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}

                      {/* Attributes Badges */}
                      {renderProductAttributes(product.attributes)}
                      
                      {/* Stock Indicator */}
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold">
                        {product.stock > 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60">
                            In Stock: {product.stock}
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100/60">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Sub-text details */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{productBranches.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-50 flex flex-col gap-3">
                      
                      {/* Pricing block */}
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 font-semibold uppercase">Price</span>
                          <span className="text-lg font-extrabold text-neutral-900 leading-none mt-0.5">
                            {priceNum.toFixed(2)} <span className="text-xs font-normal text-neutral-500">ETB</span>
                          </span>
                        </div>
                        
                        <div className="text-[10px] font-bold text-gray-500 bg-neutral-100 px-2 py-0.5 rounded uppercase">
                          {product.category || 'Medicine'}
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => {
                            addToCart({
                              id: String(product.id),
                              name: product.name,
                              price: priceNum,
                              prescriptionRequired: product.prescriptionRequired,
                              imageType: getProductImageType(product.name, product.category) as any,
                            });
                            triggerToast(`Added ${product.name.split(' ')[0]} to cart!`);
                          }}
                          className="flex-1 flex justify-center items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold py-2.5 text-xs transition shadow-sm shadow-brand-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add
                        </button>

                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 rounded-xl border hover:bg-neutral-50 transition active:scale-95 text-neutral-400 hover:text-neutral-600"
                          aria-label="Preview details"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        <button
                          onClick={() => toggleWishlist(String(product.id))}
                          className={`p-2 rounded-xl border transition active:scale-95 ${
                            isFav ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'text-neutral-400 hover:text-red-500 hover:bg-neutral-50'
                          }`}
                          aria-label="Add to wishlist"
                        >
                          <svg className="w-4.5 h-4.5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-gray-50/50">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800 mt-4">No Products Found</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                 We couldn&apos;t find any products matching your filters. Try search keywords or check other filter categories.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-xs transition"
              >
                Reset All Filters
              </button>
            </div>
          )
}
        </section>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Loading product catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
