import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ProductList from '@/components/products/ProductList';

const ProductsPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm leading-loose">
                Descubre Tesoros
            </h1>
          <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto">
            Explora una colección única de artesanías hechas con pasión y dedicación.
          </p>
        </header>

        <Suspense fallback={<LoadingSpinner />}>
          <ProductList />
        </Suspense>
        
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
  </div>
);

export default ProductsPage; 