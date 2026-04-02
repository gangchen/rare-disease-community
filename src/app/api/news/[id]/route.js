import { getNewsById } from '@/data/news';
import { NextResponse } from 'next/server';
import { withLogging } from '@/lib/apiLogger';

async function handleGET(request, { params }) {
  const news = getNewsById(parseInt(params.id));
  if (!news) {
    return NextResponse.json({ error: '新闻不存在' }, { status: 404 });
  }
  return NextResponse.json(news);
}

export const GET = withLogging(handleGET, 'news');
