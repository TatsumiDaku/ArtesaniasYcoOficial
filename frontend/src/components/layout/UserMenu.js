'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useHasMounted } from '@/hooks/useHasMounted';
import { Heart, UserCircle } from 'lucide-react';
import imageUrl from '@/utils/imageUrl';

// Helper para unir clases
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const API_BASE_URL = process.env.NEXTlo_PUBLIC_API_URL || 'http://localhost:5000';

const UserMenu = () => {
  const auth = useAuth();
  const hasMounted = useHasMounted();

  if (!hasMounted || auth.loading) {
    return <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-md"></div>;
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center items-center gap-x-2 rounded-md px-3 py-2 text-sm font-semibold hover:text-primary">
          {auth.user ? (
            <>
              {/* Avatar del usuario */}
              {auth.user?.avatar && auth.user.avatar.startsWith('/uploads') ? (
                <img
                  src={imageUrl(auth.user.avatar)}
                  alt={auth.user.name || 'Avatar'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <Image
                  src={imageUrl(auth.user?.avatar) || '/static/default-avatar.png'}
                  alt={auth.user?.name || 'Avatar'}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                />
              )}
              {/* Muestra el nickname para artesanos, o el nombre para otros roles */}
              <span className="truncate max-w-[100px]">{auth.isArtisan ? auth.user.nickname : auth.user.name}</span>
              <ChevronDownIcon className="-mr-1 h-5 w-5" aria-hidden="true" />
            </>
          ) : (
            <>
              <UserCircle className="w-6 h-6 text-gray-400" />
              <span>Mi Cuenta</span>
            </>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {auth.user ? (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={
                        auth.isAdmin
                          ? '/admin/dashboard'
                          : auth.isArtisan
                          ? '/dashboard'
                          : '/dashboard'
                      }
                      className={classNames(
                        active ? 'bg-gray-100 text-text-primary' : 'text-text-secondary',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Mi Panel
                    </Link>
                  )}
                </Menu.Item>
                {auth.isArtisan && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/artisan/profile"
                        className={classNames(
                          active ? 'bg-gray-100 text-text-primary' : 'text-text-secondary',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Editar Perfil
                      </Link>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={auth.logout}
                      className={classNames(
                        active ? 'bg-gray-100 text-text-primary' : 'text-text-secondary',
                        'block w-full text-left px-4 py-2 text-sm'
                      )}
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/login"
                      className={classNames(
                        active ? 'bg-gray-100 text-text-primary' : 'text-text-secondary',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Iniciar Sesión
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/register"
                      className={classNames(
                        active ? 'bg-gray-100 text-text-primary' : 'text-text-secondary',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Registrarse
                    </Link>
                  )}
                </Menu.Item>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu; 