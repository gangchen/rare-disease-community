'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X, User, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/diseases', label: '病种分类' },
  { href: '/posts', label: '社区讨论' },
  { href: '/about', label: '关于我们' },
  { href: '/api-docs', label: 'API 文档' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }

    function onStorage() {
      const s = localStorage.getItem('user');
      setUser(s ? JSON.parse(s) : null);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Re-check on route change
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-primary-700 font-bold text-lg hover:no-underline">
          <Heart className="w-6 h-6 fill-primary-400 text-primary-600" />
          <span>罕见病社区</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500 hover:text-primary-700 hover:bg-primary-50/50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Auth Links */}
          <li className="ml-2 pl-2 border-l border-gray-200">
            {user ? (
              <Link
                href="/profile"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/profile'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-primary-700 hover:bg-primary-50/50'
                }`}
              >
                <User className="w-4 h-4" />
                {user.username}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                登录
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-500 hover:text-primary-600"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-primary-100 bg-white">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm font-medium border-b border-gray-50 ${
                  active ? 'text-primary-700 bg-primary-50' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {/* Mobile Auth Link */}
          {user ? (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary-600 border-b border-gray-50"
            >
              <User className="w-4 h-4" />
              {user.username}
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary-600 border-b border-gray-50"
            >
              <LogIn className="w-4 h-4" />
              登录 / 注册
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
