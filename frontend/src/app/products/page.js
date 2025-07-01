import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ProductList from '@/components/products/ProductList';

const ProductsPage = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm leading-loose mb-2">
            Descubre Tesoros
          </h1>
          <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto mb-4">
            Explora una colección única de artesanías hechas con pasión y dedicación.
          </p>
          <div className="bg-gradient-to-r from-amber-100 to-pink-100 text-orange-700 rounded-xl px-6 py-4 shadow flex flex-col items-center gap-2 font-semibold text-lg mt-2 max-w-2xl mx-auto">
            <span className="italic text-base md:text-lg">
              &quot;De manos que sueñan, nacen formas y colores,<br/>
              cada pieza un suspiro, cada trazo una canción.<br/>
              Aquí la tierra y el alma se encuentran,<br/>
              y en cada objeto vive un pedazo de corazón.&quot;
            </span>
          </div>
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