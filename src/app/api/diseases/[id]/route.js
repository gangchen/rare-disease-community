import { NextResponse } from 'next/server';
import { getDiseaseById } from '@/data/diseases';

// GET /api/diseases/:id
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const disease = getDiseaseById(id);

  if (!disease) {
    return NextResponse.json({ error: '病种不存在' }, { status: 404 });
  }

  return NextResponse.json(disease);
}
