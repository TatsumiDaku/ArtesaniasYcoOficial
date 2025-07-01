'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';
import ProductCard from '@/components/products/ProductCard';
import { ChevronRight, Sparkles, Gift, Globe, Leaf, Newspaper, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const [latestRes, topRatedRes, newsRes] = await Promise.all([
          api.get('/products', { params: { limit: 8 } }),
          api.get('/products', { params: { limit: 8, sortBy: 'rating' } }),
          api.get('/news?order=recent&limit=6')
        ]);
        setLatestProducts(latestRes.data.products);
        setTopRatedProducts(topRatedRes.data.products);
        // Obtener categorías para cada noticia
        const newsWithCategories = await Promise.all(newsRes.data.map(async (n) => {
          try {
            const catRes = await api.get(`/news/${n.id}/categories`);
            return { ...n, categories: catRes.data };
          } catch {
            return { ...n, categories: [] };
          }
        }));
        setNews(newsWithCategories);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError('No se pudieron cargar los productos o noticias. Por favor, intenta de nuevo más tarde.');
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
              src="/static/INCIOPAGE.webp"
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
      
      {/* Noticias Destacadas */}
      <section className="py-16 bg-gradient-to-r from-blue-50 via-pink-50 to-yellow-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <Newspaper className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700">Noticias y Cultura</h2>
          </div>
          {/* Carrusel en móviles, grid en desktop */}
          <div className="flex md:hidden gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {news.map(n => {
              const isEvent = n.categories && n.categories.some(cat => cat.name.toLowerCase().includes('evento'));
              return (
                <div key={n.id} className="min-w-[85vw] max-w-xs shadow-lg overflow-hidden flex flex-col h-full snap-center" style={{background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px) saturate(1.5)'}}>
                  <div className="relative w-full">
                    <img
                      src={n.main_image.startsWith('/') ? n.main_image : `/uploads/news/${n.main_image}`}
                      alt={n.title}
                      className="w-full h-36 object-contain bg-white"
                    />
                    {/* CHIP DE CATEGORÍA ROBUSTO */}
                    {(() => {
                      // 1. categories: array de objetos con name
                      if (Array.isArray(n.categories) && n.categories.length > 0 && n.categories[0].name) {
                        const cat = n.categories[0];
                        const isEvento = cat.name.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{cat.name}</span>
                        );
                      }
                      // 2. category: string
                      if (typeof n.category === 'string' && n.category.length > 0) {
                        const isEvento = n.category.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{n.category}</span>
                        );
                      }
                      // 3. category: objeto con name
                      if (n.category && typeof n.category === 'object' && n.category.name) {
                        const isEvento = n.category.name.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{n.category.name}</span>
                        );
                      }
                      // 4. tags: array de strings
                      if (Array.isArray(n.tags) && n.tags.length > 0) {
                        const tag = n.tags[0];
                        const isEvento = tag.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{tag}</span>
                        );
                      }
                      // Si no hay nada, mostrar Sin categoría
                      return <span className="absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg bg-gray-800 text-white">Sin categoría</span>;
                    })()}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-amber-700 font-pacifico mb-1 line-clamp-2">{n.title}</h3>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {n.categories && n.categories.length > 0 && n.categories.map(cat => (
                        <span key={cat.id} className={`px-2 py-0.5 rounded text-xs font-semibold ${cat.name.toLowerCase().includes('evento') ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>{cat.name}</span>
                      ))}
                    </div>
                    {n.content_blocks && n.content_blocks.length > 0 && (
                      <p className="text-gray-600 text-md mb-4 line-clamp-3">{n.content_blocks[0].slice(0, 140)}{n.content_blocks[0].length > 140 ? '...' : ''}</p>
                    )}
                    <div className="mt-auto pt-2">
                      <Link href={`/news/${n.id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-all">Leer noticia <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {news.map(n => {
              const isEvent = n.categories && n.categories.some(cat => cat.name.toLowerCase().includes('evento'));
              return (
                <div key={n.id} className="shadow-lg overflow-hidden flex flex-col h-full" style={{background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px) saturate(1.5)'}}>
                  <div className="relative w-full">
                    <img
                      src={n.main_image.startsWith('/') ? n.main_image : `/uploads/news/${n.main_image}`}
                      alt={n.title}
                      className="w-full h-36 object-contain bg-white"
                    />
                    {/* CHIP DE CATEGORÍA ROBUSTO */}
                    {(() => {
                      // 1. categories: array de objetos con name
                      if (Array.isArray(n.categories) && n.categories.length > 0 && n.categories[0].name) {
                        const cat = n.categories[0];
                        const isEvento = cat.name.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{cat.name}</span>
                        );
                      }
                      // 2. category: string
                      if (typeof n.category === 'string' && n.category.length > 0) {
                        const isEvento = n.category.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{n.category}</span>
                        );
                      }
                      // 3. category: objeto con name
                      if (n.category && typeof n.category === 'object' && n.category.name) {
                        const isEvento = n.category.name.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{n.category.name}</span>
                        );
                      }
                      // 4. tags: array de strings
                      if (Array.isArray(n.tags) && n.tags.length > 0) {
                        const tag = n.tags[0];
                        const isEvento = tag.toLowerCase().includes('evento');
                        return (
                          <span className={`absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg ${isEvento ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>{tag}</span>
                        );
                      }
                      // Si no hay nada, mostrar Sin categoría
                      return <span className="absolute top-2 right-2 z-20 px-3 py-1 rounded text-xs font-bold shadow-lg bg-gray-800 text-white">Sin categoría</span>;
                    })()}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-amber-700 font-pacifico mb-1 line-clamp-2">{n.title}</h3>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {n.categories && n.categories.length > 0 && n.categories.map(cat => (
                        <span key={cat.id} className={`px-2 py-0.5 rounded text-xs font-semibold ${cat.name.toLowerCase().includes('evento') ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>{cat.name}</span>
                      ))}
                    </div>
                    {n.content_blocks && n.content_blocks.length > 0 && (
                      <p className="text-gray-600 text-md mb-4 line-clamp-3">{n.content_blocks[0].slice(0, 140)}{n.content_blocks[0].length > 140 ? '...' : ''}</p>
                    )}
                    <div className="mt-auto pt-2">
                      <Link href={`/news/${n.id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-all">Leer noticia <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/news" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg text-lg transition-all">
              Ver todas las noticias <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
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
        carouselMobile
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

const ProductSection = ({ title, subtitle, products, loading, error, link, carouselMobile }) => {
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
          carouselMobile ? (
            <div className="flex sm:hidden gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              {products.map(product => (
                <div key={product.id} className="min-w-[85vw] max-w-xs snap-center">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : null
        ) : null}
        {/* Grid para desktop */}
        {(!loading && products.length > 0) && (
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {(!loading && products.length === 0) && (
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
