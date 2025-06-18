import Link from 'next/link';
import UserMenu from './UserMenu';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Artesanías</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-orange-600 transition-colors">Productos</Link>
            <Link href="/categories" className="text-gray-700 hover:text-orange-600 transition-colors">Categorías</Link>
            <Link href="/cart" className="text-gray-700 hover:text-orange-600 transition-colors">Carrito</Link>
          </nav>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold">Artesanías</span>
          </div>
          <p className="text-gray-400">&copy; 2025 Artesanías. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 