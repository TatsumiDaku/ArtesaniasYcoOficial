'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, MapPin, Rss, MessageSquare, Star, ShoppingBag, Store, Mail, Copy, Check, CalendarDays } from 'lucide-react';
import imageUrl from '@/utils/imageUrl';

const ProductCard = ({ product }) => (
    <Link href={`/products/${product.id}`} className="block group">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border h-full">
            <div className="relative h-48">
                {product.images && product.images[0] && product.images[0].startsWith('/uploads') ? (
                    <img
                        src={imageUrl(product.images[0]) || '/static/placeholder.png'}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                    />
                ) : (
                <Image
                    src={imageUrl(product.images && product.images[0]) || '/static/placeholder.png'}
                    alt={product.name}
                    fill
                    className="rounded-t-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                />
                )}
            </div>
            <div className="p-4">
                <h3 className="font-pacifico text-amber-700 font-bold text-lg truncate group-hover:text-primary drop-shadow-[0_1.5px_1.5px_rgba(30,30,30,0.18)]">{product.name}</h3>
                {product.category_name && (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-3 py-1 mb-2 mt-1">
                    {product.category_name}
                  </span>
                )}
                <p className="text-gray-700 font-bold mt-2">
                  ${new Intl.NumberFormat('es-CO').format(product.price)} <span className="text-xs font-semibold text-gray-500">COP</span>
                </p>
            </div>
        </div>
    </Link>
);

const ReviewCard = ({ review }) => (
    <div className="flex items-start space-x-4">
        <div className="relative w-12 h-12 flex-shrink-0">
            <Image
                src={imageUrl(review.user_avatar) || '/static/default-avatar.png'}
                alt={review.user_name}
                width={48}
                height={48}
                className="rounded-full"
                priority
            />
        </div>
        <div className="flex-grow">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">{review.user_name}</h4>
                <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-bold">{typeof review.rating === 'number' ? review.rating.toFixed(1) : (review.rating != null && !isNaN(Number(review.rating)) ? Number(review.rating).toFixed(1) : 'N/A')}</span>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{review.comment}&rdquo;</p>
            <p className="text-xs text-right text-gray-400 mt-2">En: <Link href={`/products/${review.product_id}`} className="font-semibold hover:underline">{review.product_name}</Link></p>
        </div>
    </div>
);

export default function ShopDetailPage() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();

    const [shopData, setShopData] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsPagination, setProductsPagination] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsPagination, setReviewsPagination] = useState(null);
    const [blogComments, setBlogComments] = useState([]);
    const [newsComments, setNewsComments] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [blogs, setBlogs] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState({ products: false, reviews: false });
    const [activeTab, setActiveTab] = useState('products');
    const [visibleReviews, setVisibleReviews] = useState(5);
    const [copied, setCopied] = useState(false);
    const [visibleArtisanReviews, setVisibleArtisanReviews] = useState(5);

    const fetchData = useCallback(async (shopId) => {
        if (!shopId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/shops/${shopId}`);
            const { shop, products, reviews, blogs } = response.data;
            setShopData(shop);
            setProducts(products.data);
            setProductsPagination(products.pagination);
            setReviews(reviews.data);
            setReviewsPagination(reviews.pagination);
            setBlogs(blogs?.data || blogs || []);
        } catch (error) {
            console.error("Error fetching shop details:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(id);
        // Obtener comentarios de blogs del artesano
        if (id) {
            api.get(`/blogs/by-author/comments?author_id=${id}`)
                .then(res => setBlogComments(res.data.comments || []))
                .catch(() => setBlogComments([]));
            // Obtener comentarios de noticias del artesano
            api.get(`/news/comments/by-user/${id}`)
                .then(res => setNewsComments(res.data.comments || []))
                .catch(() => setNewsComments([]));
        }
    }, [fetchData, id]);

    useEffect(() => {
        // Normalizar ambos arrays para tener un campo 'type' y 'created_at' comparable
        const normalizedProductReviews = reviews.map(r => ({
            ...r,
            type: 'product',
            created_at: r.created_at ? new Date(r.created_at) : new Date(0)
        }));
        const normalizedBlogComments = blogComments.map(c => ({
            ...c,
            type: 'blog',
            created_at: c.created_at ? new Date(c.created_at) : new Date(0)
        }));
        const normalizedNewsComments = newsComments.map(c => ({
            ...c,
            type: 'news',
            created_at: c.created_at ? new Date(c.created_at) : new Date(0)
        }));
        // Mezclar y ordenar por fecha descendente
        const combined = [...normalizedProductReviews, ...normalizedBlogComments, ...normalizedNewsComments]
            .sort((a, b) => b.created_at - a.created_at);
        setAllReviews(combined);
    }, [reviews, blogComments, newsComments]);

    const loadMore = useCallback(async (type) => {
        let currentPage, totalPages, setter, currentData;
        
        switch(type) {
            case 'products':
                currentPage = productsPagination.page;
                totalPages = productsPagination.pages;
                setter = setProducts;
                currentData = products;
                break;
            case 'reviews':
                currentPage = reviewsPagination.page;
                totalPages = reviewsPagination.pages;
                setter = setReviews;
                currentData = reviews;
                break;
            default: return;
        }

        if (currentPage >= totalPages) return;

        setIsLoadingMore(prev => ({ ...prev, [type]: true }));
        try {
            const nextPage = currentPage + 1;
            const response = await api.get(`/shops/${id}?${type}Page=${nextPage}`);
            const newData = response.data[type].data;
            setter([...currentData, ...newData]);

            // Update pagination for the specific type
            switch(type) {
                case 'products': setProductsPagination(response.data.products.pagination); break;
                case 'reviews': setReviewsPagination(response.data.reviews.pagination); break;
            }
        } catch (error) {
            console.error(`Error fetching more ${type}:`, error);
        } finally {
            setIsLoadingMore(prev => ({ ...prev, [type]: false }));
        }
    }, [id, products, productsPagination, reviews, reviewsPagination]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!shopData) {
        return <div className="text-center py-20">No se encontró la tienda.</div>;
    }

    // Mostrar mensaje personalizado si la tienda no está activa
    if (shopData.status && shopData.status !== 'active') {
        let msg = '';
        if (shopData.status === 'pending') msg = 'Esta tienda está pendiente de aprobación y aún no es pública.';
        else if (shopData.status === 'rejected') msg = 'Esta tienda ha sido rechazada y no está disponible.';
        else if (shopData.status === 'banned') msg = 'Esta tienda ha sido baneada y no está disponible.';
        else msg = 'Esta tienda no está disponible.';
        return <div className="text-center py-20 text-orange-700 font-semibold text-xl">{msg}</div>;
    }

    return (
        <div className="bg-gray-100">
            <div className="container mx-auto px-4 pt-6">
                <button
                    type="button"
                    className="mb-6 px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow"
                    onClick={() => router.back()}
                >
                    Volver a tiendas
                </button>
            </div>
            {/* Header section */}
            <div className="relative w-full h-64 md:h-80 flex items-end justify-center bg-gray-200">
                {shopData.shop_header_image && shopData.shop_header_image.startsWith('/uploads') ? (
                    <img
                        src={imageUrl(shopData.shop_header_image)}
                        alt={`Cabecera de ${shopData.nickname}`}
                        className="absolute inset-0 w-full h-full object-cover object-center rounded-b-2xl"
                        style={{ zIndex: 1 }}
                    />
                ) : (
                    <Image
                        src={shopData.shop_header_image ? imageUrl(shopData.shop_header_image) : '/static/shop-header-default.png'}
                        alt={`Cabecera de ${shopData.nickname}`}
                        fill
                        className="absolute inset-0 w-full h-full object-cover object-center rounded-b-2xl"
                        style={{ zIndex: 1 }}
                    />
                )}
                {/* Avatar centrado y sobresaliente */}
                <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 z-20 flex flex-col items-center">
                    {shopData.avatar && shopData.avatar.startsWith('/uploads') ? (
                        <img
                            src={imageUrl(shopData.avatar)}
                            alt={`Avatar de ${shopData.nickname}`}
                            width={128}
                            height={128}
                            className="rounded-full border-4 border-white shadow-lg bg-white object-cover w-32 h-32"
                            style={{ objectPosition: 'center' }}
                        />
                    ) : (
                        <Image
                            src={imageUrl(shopData.avatar) || '/static/default-avatar.png'}
                            alt={`Avatar de ${shopData.nickname}`}
                            width={128}
                            height={128}
                            className="rounded-full border-4 border-white shadow-lg bg-white object-cover w-32 h-32"
                            style={{ objectPosition: 'center' }}
                        />
                    )}
                    <h1 className="mt-4 text-2xl md:text-3xl font-bold font-pacifico text-amber-700 drop-shadow-[0_2px_2px_rgba(30,30,30,0.35)] text-center">
                        {shopData.nickname}
                    </h1>
                    {shopData.shop_tagline && (
                        <p className="text-lg text-gray-700 font-semibold drop-shadow-md bg-white/80 rounded-xl px-3 py-1 inline-block mt-1 text-center">
                            {shopData.shop_tagline}
                        </p>
                    )}
                </div>
            </div>
            <div className="h-20" /> {/* Espacio para el overlap del avatar */}

            {/* Main content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 rounded-2xl shadow-xl border border-amber-100">
                            <h2 className="text-lg font-bold text-amber-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Rss className="w-5 h-5 text-orange-400" /> Sobre la tienda
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">{shopData.artisan_story || 'Este artesano aún no ha compartido su historia.'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl shadow-xl border border-blue-100">
                            <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-400" /> Ubicación
                            </h2>
                            <div className="flex items-center text-gray-700 mb-2">
                                <MapPin className="w-5 h-5 mr-2 text-indigo-400" />
                                <span>{shopData.city}, {shopData.state}, {shopData.country}</span>
                            </div>
                            {shopData.professional_email && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mail className="w-5 h-5 text-indigo-500" />
                                        <span className="font-semibold text-indigo-700 text-base">Contáctame directamente</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-white/80 border border-indigo-200 rounded-xl shadow-sm">
                                        <Mail className="w-5 h-5 text-indigo-500" />
                                        <span className="font-semibold text-indigo-700 text-sm break-all">{shopData.professional_email}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(shopData.professional_email);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 1500);
                                            }}
                                            className="ml-2 p-1 rounded hover:bg-indigo-100 transition-colors"
                                            title="Copiar correo al portapapeles"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-indigo-500" />}
                                        </button>
                                        {copied && <span className="ml-1 text-xs text-green-600 font-semibold">¡Copiado!</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right content area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4 font-pacifico text-amber-700">Productos</h2>
                            {products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.map(p => <ProductCard key={p.id} product={p} />)}
                                    </div>
                                    {productsPagination && productsPagination.page < productsPagination.pages && (
                                        <div className="mt-6 text-center">
                                            <button onClick={() => loadMore('products')} disabled={isLoadingMore.products} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60">
                                                {isLoadingMore.products ? <Loader2 className="animate-spin" /> : 'Ver más productos'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : <div className="flex flex-col items-center py-8 text-gray-400"><ShoppingBag className="w-12 h-12 mb-2" /><p>Este artesano no tiene productos en venta actualmente.</p></div>}
                        </div>

                        {/* Contenedor de Blogs del Artesano */}
                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-100 mt-8">
                            <h2 className="text-2xl font-bold mb-4 font-pacifico text-amber-700">Blogs</h2>
                            {blogs && blogs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blogs.map(blog => {
                                        // Soportar categories como string, array de strings u objetos
                                        let isEventCategory = false;
                                        if (typeof blog.categories === 'string') {
                                            isEventCategory = blog.categories.toLowerCase() === 'eventos';
                                        } else if (Array.isArray(blog.categories)) {
                                            isEventCategory = blog.categories.some(cat =>
                                                (typeof cat === 'string' && cat.toLowerCase() === 'eventos') ||
                                                (cat && typeof cat === 'object' && (cat.name || '').toLowerCase() === 'eventos')
                                            );
                                        }
                                        const isEvent = (blog.event_start && blog.event_end && blog.event_address) || isEventCategory;
                                        return (
                                            <Link key={blog.id} href={`/blog/${blog.id}`} className={`block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border ${isEvent ? 'border-l-8 border-blue-400' : 'border-yellow-100'}`}>
                                                {blog.image_url_1 && (
                                                    <div className="relative">
                                                        <Image src={imageUrl(blog.image_url_1)} alt={blog.title} width={400} height={160} className="w-full h-40 object-contain bg-white" unoptimized />
                                                        {isEvent && (
                                                            <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold px-3 py-1 rounded-full shadow text-xs flex items-center gap-1 z-10">
                                                                <CalendarDays className="w-4 h-4" /> Evento
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <h3 className={`font-pacifico text-amber-700 font-bold text-lg mb-1 line-clamp-2 drop-shadow-[0_1.5px_1.5px_rgba(30,30,30,0.18)] ${isEvent ? 'flex items-center gap-2' : ''}`}>{isEvent && <CalendarDays className="w-5 h-5" />} {blog.title}</h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {blog.author_avatar && <Image src={imageUrl(blog.author_avatar)} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full" unoptimized />}
                                                        <span className="text-sm font-semibold text-gray-700">{blog.author_name}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                                                    <p className="text-gray-600 line-clamp-2 mt-2">{blog.content}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 text-gray-400">
                                    <span className="mb-2">No hay blogs publicados por este artesano.</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-100 mt-8">
                            <h2 className="text-2xl font-bold mb-4 font-pacifico text-amber-700">Últimas Reseñas</h2>
                            {allReviews.filter(r => r.type === 'product' || r.type === 'blog').length > 0 ? (
                                <>
                                    <div className="space-y-6">
                                        {allReviews.filter(r => r.type === 'product' || r.type === 'blog').slice(0, visibleReviews).map(r => (
                                            r.type === 'product' ? (
                                                <div key={`product-${r.id}`} className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-xl p-4 shadow border border-blue-100">
                                                    <ReviewCard review={r} />
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                        <span>
                                                            Publicado el {r.created_at ? r.created_at.toLocaleDateString() : 'Fecha desconocida'}
                                                        </span>
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2 text-xs font-bold">Producto</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={`blog-${r.id}`} className="bg-gradient-to-br from-white via-orange-50 to-yellow-50 rounded-xl p-4 shadow border border-orange-100">
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative w-12 h-12 flex-shrink-0">
                                                            <Image
                                                                src={imageUrl(r.user_avatar) || '/static/default-avatar.png'}
                                                                alt={r.user_name}
                                                                width={48}
                                                                height={48}
                                                                className="rounded-full"
                                                                priority
                                                            />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-semibold">{r.user_name}</h4>
                                                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-2 text-xs font-bold">Blog</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{r.comment}&rdquo;</p>
                                                            <p className="text-xs text-right text-gray-400 mt-2">En: <Link href={`/blog/${r.blog_id}`} className="font-semibold hover:underline">{r.blog_title}</Link></p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                        <span>
                                                            Publicado el {r.created_at ? r.created_at.toLocaleDateString() : 'Fecha desconocida'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    {allReviews.filter(r => r.type === 'product' || r.type === 'blog').length > visibleReviews && (
                                        <div className="mt-6 text-center">
                                            <button
                                                onClick={() => setVisibleReviews(v => Math.min(v + 5, allReviews.length))}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                Ver más reseñas
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : <div className="flex flex-col items-center py-8 text-gray-400"><MessageSquare className="w-12 h-12 mb-2" /><p>Este artesano aún no ha recibido reseñas ni ha comentado blogs.</p></div>}
                        </div>

                        {/* Reseñas del artesano en noticias */}
                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-100 mt-8">
                            <h2 className="text-2xl font-bold mb-4 font-pacifico text-amber-700">Últimas Reseñas del Artesano</h2>
                            {allReviews.filter(r => r.type === 'news' || (r.type === 'blog' && String(r.blog_author_id) !== String(id))).length > 0 ? (
                                <>
                                <div className="space-y-6">
                                    {allReviews.filter(r => r.type === 'news' || (r.type === 'blog' && String(r.blog_author_id) !== String(id))).slice(0, visibleArtisanReviews).map(r => (
                                        r.type === 'news' ? (
                                            <div key={`news-${r.id}`} className="bg-gradient-to-br from-white via-pink-50 to-red-50 rounded-xl p-4 shadow border border-pink-100">
                                                <div className="flex items-start gap-4">
                                                    <div className="relative w-12 h-12 flex-shrink-0">
                                                        <Image
                                                            src={imageUrl(r.user_avatar) || '/static/default-avatar.png'}
                                                            alt={r.user_name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full"
                                                            priority
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold">{r.user_name}</h4>
                                                            <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full ml-2 text-xs font-bold">Noticia</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{r.comment}&rdquo;</p>
                                                        <p className="text-xs text-right text-gray-400 mt-2">En: <Link href={`/news/${r.news_id}`} className="font-semibold hover:underline">{r.news_title}</Link></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                    <span>
                                                        Publicado el {r.created_at ? r.created_at.toLocaleDateString() : 'Fecha desconocida'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={`blog-${r.id}`} className="bg-gradient-to-br from-white via-orange-50 to-yellow-50 rounded-xl p-4 shadow border border-orange-100">
                                                <div className="flex items-start gap-4">
                                                    <div className="relative w-12 h-12 flex-shrink-0">
                                                        <Image
                                                            src={imageUrl(r.user_avatar) || '/static/default-avatar.png'}
                                                            alt={r.user_name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full"
                                                            priority
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold">{r.user_name}</h4>
                                                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-2 text-xs font-bold">Blog</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{r.comment}&rdquo;</p>
                                                        <p className="text-xs text-right text-gray-400 mt-2">En: <Link href={`/blog/${r.blog_id}`} className="font-semibold hover:underline">{r.blog_title}</Link></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                    <span>
                                                        Publicado el {r.created_at ? r.created_at.toLocaleDateString() : 'Fecha desconocida'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                                {allReviews.filter(r => r.type === 'news' || (r.type === 'blog' && String(r.blog_author_id) !== String(id))).length > visibleArtisanReviews && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setVisibleArtisanReviews(v => Math.min(v + 5, allReviews.length))}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            Ver más reseñas
                                        </button>
                                    </div>
                                )}
                                </>
                            ) : <div className="flex flex-col items-center py-8 text-gray-400"><MessageSquare className="w-12 h-12 mb-2" /><p>Este artesano aún no ha comentado noticias ni blogs ajenos.</p></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 