import { getNewsById } from '@/data/news';

export async function generateMetadata({ params }) {
  const id = parseInt(params.id);
  const article = getNewsById(id);
  if (!article) {
    return { title: '新闻不存在 - Rare2AI' };
  }
  return {
    title: `${article.title} - Rare2AI`,
    description: article.summary || article.content.slice(0, 160),
  };
}

export default function NewsLayout({ children }) {
  return children;
}
