import { getPostById } from '@/data/posts';

export async function generateMetadata({ params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);
  if (!post) {
    return { title: '帖子不存在 - Rare2AI' };
  }
  return {
    title: `${post.title} - Rare2AI`,
    description: post.content.slice(0, 160),
  };
}

export default function PostLayout({ children }) {
  return children;
}
