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
import CookieNotification from '@/components/ui/CookieNotification';

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
      {/* Fuentes personalizadas gestionadas por next/font/google en la App Router. Eliminada carga manual para evitar warning. */}
      <body>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Toaster position="bottom-right" reverseOrder={false} />
              <PendingApprovalModal />
              <CookieNotification />
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
