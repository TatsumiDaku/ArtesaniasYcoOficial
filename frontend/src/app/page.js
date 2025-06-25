'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';
import ProductCard from '@/components/products/ProductCard';
import { ChevronRight, Sparkles, Gift, Globe, Leaf } from 'lucide-react';

const HomePage = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const [latestRes, topRatedRes] = await Promise.all([
          api.get('/products', { params: { limit: 8 } }), // Orden por defecto es created_at
          api.get('/products', { params: { limit: 8, sortBy: 'rating' } })
        ]);
        setLatestProducts(latestRes.data.products);
        setTopRatedProducts(topRatedRes.data.products);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError('No se pudieron cargar los productos destacados. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center text-white bg-black">
          <Image 
              src="/static/artesanias-Inicio.jpg"
              alt="Fondo de artesanías colombianas"
              fill
              className="object-cover opacity-60"
              priority
          />
          <div className="relative z-10 text-center px-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-pacifico bg-gradient-to-r from-amber-200 via-white to-orange-200 bg-clip-text text-transparent drop-shadow-2xl mb-4 py-4 animate-fade-in-down">
                  El Alma de la Tierra en tus Manos
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-6 animate-fade-in-up animation-delay-300">
                  Descubre piezas únicas que narran la historia de nuestra cultura. Conecta con el corazón de la tradición.
              </p>
               <div className="w-24 h-px bg-white/50 mx-auto mb-8 animate-fade-in-up animation-delay-500"></div>
              <Link 
                href="/products" 
                className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg font-bold px-10 py-4 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-700"
              >
                  Explorar la Colección
              </Link>
          </div>
      </section>
      
      {/* Novedades Section */}
      <ProductSection 
        title="Novedades"
        subtitle="Lo último de nuestros artesanos"
        products={latestProducts}
        loading={loading}
        error={error}
        link="/products"
      />
      
      {/* Why Support Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="w-full md:w-1/3 flex justify-center text-amber-500">
              {/* Este icono puede ser reemplazado por una imagen */}
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hand-heart"><path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.7-2.9l-4.1 4.1c-.2.2-.5.2-.7 0L9 10.5 M18 22l-3-3-3 3"/><path d="M19 14c1.2 0 2.4-1.4 2.4-3s-1.2-3-2.4-3-2.4 1.4-2.4 3 1.2 3 2.4 3Z"/></svg>
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Un Legado en Cada Hilo</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Apoyar la artesanía colombiana es mucho más que una simple compra; es un acto de conservación cultural. Cada pieza que adquieres lleva consigo la historia, la dedicación y el alma de una familia artesana. Estás ayudando a preservar tradiciones ancestrales, a fomentar el comercio justo y a tejer un futuro más brillante para nuestras comunidades creativas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* From the Earth Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 max-w-6xl mx-auto">
            <div className="w-full md:w-1/3 flex justify-center text-green-600">
              <Leaf className="w-28 h-28" strokeWidth={1} />
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">De la Tierra a tus Manos</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nuestros artesanos trabajan en armonía con la naturaleza. Utilizan materiales locales y técnicas sostenibles para crear piezas que no solo son bellas, sino también respetuosas con nuestro entorno. Siente la textura de la madera, la calidez de la lana y la frescura del barro; siente la conexión con la tierra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mejor Valorados Section */}
      <ProductSection 
        title="Mejor Valorados"
        subtitle="Los favoritos de nuestra comunidad"
        products={topRatedProducts}
        loading={loading}
        error={error}
        link="/products?sortBy=rating"
      />

      {/* Authenticity Promise Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Más que un Producto, una Historia</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Cada objeto en nuestra tienda es una promesa de autenticidad. No hay dos piezas idénticas, porque cada una es moldeada por manos expertas que imprimen su carácter y pasión. Al elegir nuestros productos, te llevas a casa una pieza única, una historia que te espera para ser contada.
          </p>
        </div>
      </section>

      {/* New Section: Connect with the Creator */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hand-heart w-16 h-16 text-red-500 mx-auto mb-4"><path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.7-2.9l-4.1 4.1c-.2.2-.5.2-.7 0L9 10.5 M18 22l-3-3-3 3"/><path d="M19 14c1.2 0 2.4-1.4 2.4-3s-1.2-3-2.4-3-2.4 1.4-2.4 3 1.2 3 2.4 3Z"/></svg>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Conecta con el Creador</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Detrás de cada obra hay un rostro, una familia y un sueño. En nuestra plataforma, no solo compras un producto, estableces un puente directo con el artesano. Conoce sus talleres, sus inspiraciones y sé parte de una comunidad que valora el talento humano.
          </p>
        </div>
      </section>

      {/* Fair Trade Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Globe className="w-16 h-16 text-emerald-500 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Comercio Justo, Futuro Sostenible</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Creemos en un modelo que beneficia a todos. Cada compra apoya directamente a nuestros artesanos, garantizando una compensación justa que les permite prosperar. Juntos, fomentamos una economía creativa, sostenible y respetuosa con nuestras tradiciones y nuestro planeta.
          </p>
        </div>
      </section>

      {/* Unique Gift Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Gift className="w-16 h-16 text-blue-500 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">El Regalo Perfecto es Único</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            ¿Buscas un detalle que realmente signifique algo? Olvida lo masivo y elige lo magistral. Regala una pieza con alma, una obra irrepetible que demuestre a tus seres queridos lo especiales que son. Aquí encontrarás ese tesoro que no se encuentra en ningún otro lugar.
          </p>
        </div>
      </section>

       {/* Call to Action Section */}
      <section className="bg-amber-50 py-20">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">¿Eres un artesano?</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
                Únete a nuestra comunidad y comparte tu talento con el mundo. Ofrecemos una plataforma justa y herramientas para que crezcas.
            </p>
            <Link href="/register?role=artesano" className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out">
                Conviértete en Artesano
            </Link>
        </div>
      </section>

    </div>
  );
};

const ProductSection = ({ title, subtitle, products, loading, error, link }) => {
  if (error && (!products || products.length === 0)) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">{title}</h2>
            <p className="text-md text-gray-500 mt-1">{subtitle}</p>
          </div>
          <Link href={link} className="hidden sm:inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-semibold transition-colors">
            Ver todos <ChevronRight className="w-4 h-4"/>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay productos para mostrar en esta sección.</p>
        )}
      </div>
    </section>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
    <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

export default HomePage;
