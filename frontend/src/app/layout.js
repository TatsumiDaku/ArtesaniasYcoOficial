import "./globals.css";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Toaster } from "react-hot-toast";
import PendingApprovalModal from "@/components/ui/PendingApprovalModal";

export const metadata = {
  title: "Artesanías de mi Tierra",
  description: "Plataforma de e-commerce para artesanos locales.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Toaster position="top-right" />
              <PendingApprovalModal />
              <Layout>
                {children}
              </Layout>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
