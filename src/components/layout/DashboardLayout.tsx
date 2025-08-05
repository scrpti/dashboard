'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  Menu,
  X,
  Bell,
  Search,
  User,
  ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard, 
      current: pathname === '/',
      badge: null
    },
    { 
      name: 'Facturas', 
      href: '/invoices', 
      icon: FileText, 
      current: pathname === '/invoices',
      badge: '12'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3, 
      current: pathname === '/analytics',
      badge: null
    },
    { 
      name: 'Proveedores', 
      href: '/suppliers', 
      icon: Users, 
      current: pathname === '/suppliers',
      badge: null
    },
    { 
      name: 'Configuración', 
      href: '/settings', 
      icon: Settings, 
      current: pathname === '/settings',
      badge: null
    },
  ];

  const userNavigation = [
    { name: 'Tu perfil', href: '#' },
    { name: 'Configuración', href: '#' },
    { name: 'Cerrar sesión', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gradient">
                  FacturIA
                </span>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Cerrar sidebar</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                            item.current
                              ? 'bg-primary-50 text-primary-700 shadow-sm'
                              : 'text-slate-700 hover:text-primary-700 hover:bg-slate-50'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 transition-colors ${
                              item.current ? 'text-primary-700' : 'text-slate-400 group-hover:text-primary-700'
                            }`}
                          />
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto min-w-max bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex items-center justify-center font-medium">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-slate-900">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="sr-only">Tu cuenta</span>
                    <span>Mi Empresa SL</span>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 shadow-sm">
          <div className="flex h-16 shrink-0 items-center">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gradient">
              FacturIA
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                          item.current
                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                            : 'text-slate-700 hover:text-primary-700 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 transition-colors ${
                            item.current ? 'text-primary-700' : 'text-slate-400 group-hover:text-primary-700'
                          }`}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto min-w-max bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex items-center justify-center font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-slate-900 border-t border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="sr-only">Tu cuenta</span>
                  <span className="flex-1">Mi Empresa SL</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Separador */}
          <div className="h-6 w-px bg-slate-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Barra de búsqueda */}
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Buscar
              </label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm bg-transparent"
                placeholder="Buscar facturas, proveedores..."
                type="search"
                name="search"
              />
            </form>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Botón de notificaciones */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative hover:bg-slate-100 rounded-md transition-colors"
              >
                <span className="sr-only">Ver notificaciones</span>
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  3
                </span>
              </button>

              {/* Separador */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" />

              {/* Menú de perfil */}
              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-slate-900">
                      Mi Empresa SL
                    </span>
                    <ChevronDown className="ml-2 h-5 w-5 text-slate-400" />
                  </span>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-slate-900/5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    {userNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-1 text-sm leading-6 text-slate-900 hover:bg-slate-50 transition-colors"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Overlay para cerrar menús al hacer clic fuera */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;