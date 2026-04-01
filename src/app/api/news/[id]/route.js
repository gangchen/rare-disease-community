import { getNewsById } from '@/data/news';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const news = getNewsById(parseInt(params.id));
  if (!news) {
    return NextResponse.json({ error: '新闻不存在' }, { status: 404 });
  }
  return NextResponse.json(news);
}
