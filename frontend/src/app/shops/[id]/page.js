'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, MapPin, Rss, MessageSquare, Star, ShoppingBag, Store, Mail, Copy, Check } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const ProductCard = ({ product }) => (
    <Link href={`/products/${product.id}`} className="block group">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border h-full">
            <div className="relative h-48">
                <Image
                    src={getImageUrl(product.images && product.images[0]) || '/static/placeholder.png'}
                    alt={product.name}
                    fill
                    className="rounded-t-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                />
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary">{product.name}</h3>
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
                src={getImageUrl(review.user_avatar) || '/static/default-avatar.png'}
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
    const [allReviews, setAllReviews] = useState([]);
    const [blogs, setBlogs] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState({ products: false, reviews: false });
    const [activeTab, setActiveTab] = useState('products');
    const [visibleReviews, setVisibleReviews] = useState(5);
    const [copied, setCopied] = useState(false);

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
        }
    }, [fetchData, id]);

    // Mezclar y ordenar reseñas y comentarios por fecha
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
        // Mezclar y ordenar por fecha descendente
        const combined = [...normalizedProductReviews, ...normalizedBlogComments]
            .sort((a, b) => b.created_at - a.created_at);
        setAllReviews(combined);
    }, [reviews, blogComments]);

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
            <div className="relative h-64 md:h-80 w-full">
                {getImageUrl(shopData.shop_header_image) && (
                    <Image
                        src={getImageUrl(shopData.shop_header_image)}
                        alt={`Cabecera de ${shopData.nickname}`}
                        layout="fill"
                        objectFit="cover"
                        priority
                        sizes="100vw"
                        className="z-0"
                    />
                )}
                <div className="absolute inset-0 flex items-end p-8 z-20">
                    <div className="flex items-center gap-6">
                        <div className="relative w-28 h-28 md:w-36 md:h-36 border-4 border-white/80 rounded-full shadow-2xl bg-white/40">
                            <Image
                                src={getImageUrl(shopData.avatar)}
                                alt={`Avatar de ${shopData.nickname}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full"
                                priority
                                sizes="144px"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm tracking-wide">
                                    {shopData.nickname}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/30 text-orange-700 font-semibold rounded-full text-xs shadow border border-orange-200">
                                    <Store className="w-4 h-4" /> Artesano
                                </span>
                            </div>
                            {shopData.shop_tagline && (
                                <p className="text-lg text-white/90 font-semibold drop-shadow-md bg-black/20 rounded-xl px-3 py-1 inline-block mt-1">
                                    {shopData.shop_tagline}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow">Productos</h2>
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
                            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent drop-shadow">Blogs</h2>
                            {blogs && blogs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blogs.map(blog => (
                                        <Link key={blog.id} href={`/blog/${blog.id}`} className="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-yellow-100">
                                            {blog.image_url_1 && (
                                                <Image src={getImageUrl(blog.image_url_1)} alt={blog.title} width={400} height={160} className="w-full h-40 object-cover" />
                                            )}
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-orange-700 line-clamp-2 mb-1">{blog.title}</h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {blog.author_avatar && <Image src={getImageUrl(blog.author_avatar)} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full" />}
                                                    <span className="text-sm font-semibold text-gray-700">{blog.author_name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                                                <p className="text-gray-600 line-clamp-2 mt-2">{blog.content}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 text-gray-400">
                                    <span className="mb-2">No hay blogs publicados por este artesano.</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-100 mt-8">
                            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow">Últimas Reseñas</h2>
                            {allReviews.length > 0 ? (
                                <>
                                    <div className="space-y-6">
                                        {allReviews.slice(0, visibleReviews).map(r => (
                                            r.type === 'product' ? (
                                                <div key={`product-${r.id}`} className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-xl p-4 shadow border border-blue-100">
                                                    <ReviewCard review={r} />
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                        <span>
                                                            Publicado el {r.created_at ? r.created_at.toLocaleDateString() : 'Fecha desconocida'}
                                                        </span>
                                                        {r.type === 'product' && (
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2 text-xs font-bold">Producto</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={`blog-${r.id}`} className="bg-gradient-to-br from-white via-orange-50 to-yellow-50 rounded-xl p-4 shadow border border-orange-100">
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative w-12 h-12 flex-shrink-0">
                                                            <Image
                                                                src={getImageUrl(r.user_avatar) || '/static/default-avatar.png'}
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
                                    {allReviews.length > visibleReviews && (
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
                            ) : <div className="flex flex-col items-center py-8 text-gray-400"><MessageSquare className="w-12 h-12 mb-2" /><p>Este artesano aún no ha recibido reseñas.</p></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 