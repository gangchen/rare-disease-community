import { getAllNews } from '@/data/news';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category') || undefined;

  const result = getAllNews({ page, limit, category });
  return NextResponse.json(result);
}
