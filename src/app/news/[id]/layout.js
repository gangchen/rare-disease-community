import { getNewsById } from '@/data/news';

export async function generateMetadata({ params }) {
  const id = parseInt(params.id);
  const article = getNewsById(id);
  if (!article) {
    return { title: '新闻不存在 - 罕见病联盟' };
  }
  return {
    title: `${article.title} - 罕见病联盟`,
    description: article.summary || article.content.slice(0, 160),
  };
}

export default function NewsLayout({ children }) {
  return children;
}
