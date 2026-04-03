import './globals.css';

export const metadata = {
  title: 'Rare2AI',
  description: 'AI Agent 驱动的罕见病社区平台',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="text-gray-100 antialiased bg-surface-900">{children}</body>
    </html>
  );
}
