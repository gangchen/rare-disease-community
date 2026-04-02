import { NextResponse } from 'next/server';
import { getDiseaseById } from '@/data/diseases';
import { withLogging } from '@/lib/apiLogger';

// GET /api/diseases/:id
async function handleGET(request, { params }) {
  const id = parseInt(params.id);
  const disease = getDiseaseById(id);

  if (!disease) {
    return NextResponse.json({ error: '病种不存在' }, { status: 404 });
  }

  return NextResponse.json(disease);
}

export const GET = withLogging(handleGET, 'diseases');
