import { NextResponse } from 'next/server';
import { getAllDiseases, searchDiseases, getCategories } from '@/data/diseases';
import { withLogging } from '@/lib/apiLogger';

// GET /api/diseases
// 查询参数: ?search=关键词 | ?categories=true
async function handleGET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const showCategories = searchParams.get('categories');

  if (showCategories === 'true') {
    return NextResponse.json({ categories: getCategories() });
  }

  if (search) {
    const results = searchDiseases(search);
    return NextResponse.json({ items: results, total: results.length });
  }

  const diseases = getAllDiseases();
  return NextResponse.json({ items: diseases, total: diseases.length });
}

export const GET = withLogging(handleGET, 'diseases');
