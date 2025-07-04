'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { RefreshCw, Search, X, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import ProductCard from '@/components/products/ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState(10);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const fetchProducts = useCallback(async (page = 1) => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      setLoading(true);
      setProducts([]); // Clear previous results on new filter/search
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await api.get('/products', { 
        params: { search: searchTerm, category: categoryId, page, limit: 12 } 
      });
      setProducts(prev => isInitialLoad ? res.data.products : [...prev, ...res.data.products]);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
      console.error(err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [searchTerm, categoryId]);


  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    // Fetch categories only once
    const fetchCategories = async () => {
      try {
        const categoriesRes = await api.get('/products/categories');
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);
  
  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      fetchProducts(pagination.page + 1);
    }
  };
  
  const handleRefresh = () => {
    router.push(pathname);
  };

  const handleSearchChange = (e) => {
    router.push(`${pathname}?${createQueryString('search', e.target.value)}`);
  };

  const handleClearSearch = () => {
    router.push(`${pathname}?${createQueryString('search', '')}`);
  };

  const handleCategoryClick = (id) => {
    router.push(`${pathname}?${createQueryString('category', id)}`);
  };
  
  return (
    <>
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 mb-8 rounded-xl shadow-md">
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                )}
            </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button 
                onClick={() => handleCategoryClick('')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${!categoryId ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg' : 'bg-white hover:shadow-md'}`}
            >
                Todas
            </button>
            {categories.slice(0, visibleCategories).map(category => (
                <button 
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${categoryId === String(category.id) ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg' : 'bg-white hover:shadow-md'}`}
                >
                    {category.name}
                </button>
            ))}
            {categories.length > visibleCategories && (
                 <button 
                    onClick={() => setVisibleCategories(categories.length)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    Ver más...
                </button>
            )}
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            </div>
        ) : error ? (
            <div className="text-center text-red-500">{error}</div>
        ) : (
            <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 overflow-x-auto">
                    {products.length > 0 ? (
                        products.filter(product => product.status === 'active').map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <h3 className="text-2xl font-semibold text-gray-700">No se encontraron productos</h3>
                            <p className="text-gray-500 mt-2">Intenta cambiar tu búsqueda o filtros.</p>
                            <button onClick={handleRefresh} className="mt-4 btn btn-primary">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
                 {pagination && pagination.page < pagination.pages && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Cargando...
                                </>
                            ) : (
                                'Cargar Más Productos'
                            )}
                        </button>
                    </div>
                )}
            </>
        )}
    </>
  )
}

export default ProductList; 