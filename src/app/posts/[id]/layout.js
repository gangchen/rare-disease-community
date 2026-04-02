import { getPostById } from '@/data/posts';

export async function generateMetadata({ params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);
  if (!post) {
    return { title: '帖子不存在 - 罕见病联盟' };
  }
  return {
    title: `${post.title} - 罕见病联盟`,
    description: post.content.slice(0, 160),
  };
}

export default function PostLayout({ children }) {
  return children;
}
