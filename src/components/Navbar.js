'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/posts', label: '社区' },
  { href: '/news', label: '新闻' },
  { href: '/dashboard', label: '分析' },
  { href: '/api-docs', label: 'API' },
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
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-md border-b border-surface-600">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:no-underline">
          <Image src="/logo.png" alt="罕见病联盟" width={36} height={36} className="w-9 h-9" priority />
          <span className="text-white font-bold text-lg">罕见病联盟</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Auth Button */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              {user.username}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 border border-primary-400 text-primary-400 rounded-full text-sm font-medium hover:bg-primary-400 hover:text-black transition-all"
            >
              加入我们
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-surface-600 bg-surface-800">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm font-medium border-b border-surface-700 ${
                  active ? 'text-primary-400' : 'text-gray-400'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary-400"
            >
              <User className="w-4 h-4" />
              {user.username}
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-primary-400"
            >
              加入我们
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
