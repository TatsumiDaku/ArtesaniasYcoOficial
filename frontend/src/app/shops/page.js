'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, Store, MapPin, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/utils/imageUrl';

const ShopCard = ({ shop }) => {
    const defaultAvatar = '/static/default-avatar.png'; // Fallback image
    
    return (
        <Link href={`/shops/${shop.id}`} className="block group">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out h-full flex flex-col overflow-hidden border border-gray-200/80">
                <div className="relative w-full h-40">
                     <Image
                        src={getImageUrl(shop.avatar) || defaultAvatar}
                        alt={`Avatar de ${shop.nickname}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
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
    const [shops, setShops] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

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
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent py-2">
                        Tiendas de Artesanos
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Explora los talleres y perfiles de nuestros talentosos artesanos. Cada tienda es una puerta a un mundo de creatividad y tradición.
                    </p>
                </div>

                {isLoading && shops.length === 0 ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : shops.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {shops.map((shop) => (
                               <ShopCard key={shop.id} shop={shop} />
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            {pagination && page < pagination.pages && (
                                 <button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="btn btn-primary btn-wide"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Cargar más tiendas'}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                         <Store className="mx-auto h-16 w-16 text-gray-400" />
                         <h3 className="mt-2 text-lg font-medium text-gray-900">No hay tiendas disponibles</h3>
                         <p className="mt-1 text-sm text-gray-500">Vuelve a intentarlo más tarde o contacta con nosotros si crees que es un error.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 