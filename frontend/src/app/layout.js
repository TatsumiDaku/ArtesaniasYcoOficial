import { Inter, Pacifico } from 'next/font/google';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import PendingApprovalModal from "@/components/ui/PendingApprovalModal";
import { Suspense } from 'react';
import PageLoader from '@/components/ui/PageLoader';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pacifico',
});

export const metadata = {
  title: 'Artesanías & Co',
  description: 'Conectando artesanos y amantes del arte. Descubre piezas únicas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${pacifico.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Toaster position="bottom-right" reverseOrder={false} />
              <PendingApprovalModal />
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  {children}
                </Suspense>
              </Layout>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
