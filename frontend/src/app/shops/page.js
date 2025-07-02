'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, Store, MapPin, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import imageUrl from '@/utils/imageUrl';

const ShopCard = ({ shop }) => {
    console.log('ShopCard:', shop);
    const defaultAvatar = '/static/default-avatar.png'; // Fallback image
    const defaultHeader = '/static/shop-header-default.png';
    const isFeatured = shop.featured || shop.is_featured;
    
    return (
        <Link href={`/shops/${shop.id}`} className="block group">
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                {isFeatured && (
                    <span className="absolute top-4 left-4 z-10 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-bold shadow text-xs">
                        ⭐ Tienda destacada
                    </span>
                )}
                <div className="relative w-full h-40">
                    {shop.shop_header_image ? (
                        <img
                            src={imageUrl(shop.shop_header_image)}
                            alt={`Cabecera de ${shop.nickname}`}
                            className="absolute inset-0 w-full h-full object-cover object-center z-0"
                        />
                    ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-200 via-pink-100 to-yellow-100 z-0" />
                    )}
                    {/* Avatar del artesano superpuesto */}
                    <div className="absolute bottom-2 left-2 z-10">
                        {shop.avatar && shop.avatar.startsWith('/uploads') ? (
                            <img
                                src={imageUrl(shop.avatar)}
                                alt={`Avatar de ${shop.nickname}`}
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-white shadow-md bg-white object-cover"
                            />
                        ) : (
                            <Image
                                src={imageUrl(shop.avatar) || defaultAvatar}
                                alt={`Avatar de ${shop.nickname}`}
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-white shadow-md bg-white object-cover"
                            />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-5 pointer-events-none"></div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-amber-700 font-pacifico truncate group-hover:text-primary transition-colors">
                        {shop.nickname}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 flex-grow">
                        {shop.shop_tagline || 'Artesanía con alma y corazón.'}
                    </p>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{shop.city || 'Ubicación'}, {shop.state || 'desconocida'}</span>
                    </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 mt-auto">
                    <div className="flex justify-end items-center text-primary text-sm font-semibold">
                        Ver tienda
                        <ChevronRight className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default function ShopsPage() {
    const PAGE_SIZE = 12;
    const [shops, setShops] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [order, setOrder] = useState('recent');

    const fetchShops = useCallback(async (pageNum) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/shops?page=${pageNum}&limit=12`);
            if (pageNum === 1) {
                setShops(response.data.data);
            } else {
                setShops(prev => [...prev, ...response.data.data]);
            }
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching shops:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch initial data
        fetchShops(1);
    }, [fetchShops]);

    const handleLoadMore = () => {
        if (pagination && page < pagination.pages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchShops(nextPage);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-50 via-pink-50 to-yellow-50 rounded-2xl shadow p-8 mb-10 flex flex-col items-center border border-gray-100">
                <h1 className="text-4xl md:text-5xl font-bold font-pacifico leading-[1.2] pb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2 text-center">Tiendas Artesanales</h1>
                <h2 className="text-lg md:text-xl text-gray-600 font-medium mb-2 text-center max-w-2xl">Descubre y apoya a los mejores artesanos. Explora tiendas únicas, conoce sus historias y encuentra productos auténticos hechos con pasión.</h2>
                <div className="bg-gradient-to-r from-blue-100 to-pink-100 text-blue-700 rounded-xl px-6 py-3 shadow flex items-center gap-3 font-semibold text-lg mt-2 text-center">
                    ¡Apoya el talento local y encuentra inspiración en cada tienda!
                </div>
            </section>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-gray-700">Todas las tiendas</h1>
                <div className="flex gap-2 flex-wrap items-center">
                    <select className="input" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}>
                        <option value="">Todas las categorías</option>
                        {/* Aquí puedes mapear categorías si existen */}
                    </select>
                    <button onClick={() => setOrder("recent")} className={`btn btn-ghost ${order === "recent" ? "bg-blue-100 text-blue-700" : ""}`}>Más recientes</button>
                    <button onClick={() => setOrder("popular")} className={`btn btn-ghost ${order === "popular" ? "bg-pink-100 text-pink-700" : ""}`}>Más populares</button>
                </div>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                </div>
            ) : shops.length === 0 ? (
                <div className="text-center text-indigo-400 py-8 text-xl font-semibold">No hay tiendas para mostrar en este momento.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shops.map((shop) => (
                            <ShopCard key={shop.id} shop={shop} />
                        ))}
                    </div>
                    <div className="flex justify-center mt-8 gap-2">
                        <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
                        <span className="px-4 py-2 rounded text-gray-700 font-semibold">Página {page}</span>
                        <button className="btn btn-ghost" disabled={shops.length < PAGE_SIZE} onClick={() => setPage(page + 1)}>Siguiente</button>
                    </div>
                </>
            )}
        </div>
    );
} 