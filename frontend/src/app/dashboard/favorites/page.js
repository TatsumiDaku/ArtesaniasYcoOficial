'use client';

import { useFavorites } from '@/context/FavoritesContext';
import ProductCard from '@/components/products/ProductCard';
import withAuthProtection from '@/components/auth/withAuthProtection';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites, loading, loadingMore, pagination, loadMoreFavorites } = useFavorites();

    if (loading && favorites.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center mb-8">
                <Heart className="w-8 h-8 mr-4 text-primary" />
                <h1 className="text-4xl font-black tracking-tight text-base-content">Mis Favoritos</h1>
            </div>

            {favorites.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favorites.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {pagination && pagination.page < pagination.pages && (
                        <div className="mt-10 text-center">
                            <button
                                onClick={loadMoreFavorites}
                                disabled={loadingMore}
                                className="btn btn-primary btn-wide"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Cargando...
                                    </>
                                ) : (
                                    'Cargar Más Favoritos'
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <Heart className="mx-auto h-24 w-24 text-base-content/10" />
                    <p className="text-lg text-base-content/70 mt-4 mb-6">Aún no tienes productos favoritos.</p>
                    <Link href="/products" className="btn btn-primary">
                        Descubrir Productos
                    </Link>
                </div>
            )}
        </div>
    );
};

export default withAuthProtection(FavoritesPage, ['cliente']); 