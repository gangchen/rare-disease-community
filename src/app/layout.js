import './globals.css';

export const metadata = {
  title: '罕见病社区 - Rare Disease Community',
  description: '一个为罕见病患者、家属和研究者搭建的交流互助平台',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="text-gray-800 antialiased">{children}</body>
    </html>
  );
}
