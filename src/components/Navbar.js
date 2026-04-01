'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/diseases', label: '病种分类' },
  { href: '/posts', label: '社区讨论' },
  { href: '/about', label: '关于我们' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          罕见病社区
        </Link>
        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={pathname === item.href ? styles.active : styles.link}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
