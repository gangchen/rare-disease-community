import './globals.css';

export const metadata = {
  title: '罕见病联盟 - Rare Disease Alliance',
  description: '罕见病患者互助平台 — 你不是一个人',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="text-gray-100 antialiased bg-surface-900">{children}</body>
    </html>
  );
}
