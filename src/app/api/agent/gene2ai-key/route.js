import { NextResponse } from 'next/server';
import { authenticate, authError } from '@/lib/middleware';
import { ensureAgentTables, getGene2aiKey, setGene2aiKey } from '@/lib/agent/db';

let tablesReady = false;
function initTables() {
  if (!tablesReady) { ensureAgentTables(); tablesReady = true; }
}

// GET — check if Gene2AI key is configured
export async function GET(request) {
  initTables();
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const key = getGene2aiKey(auth.userId);
  return NextResponse.json({
    configured: !!key,
    maskedKey: key ? key.slice(0, 8) + '...' + key.slice(-4) : null,
  });
}

// PUT — set/update Gene2AI key
export async function PUT(request) {
  initTables();
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const { key } = await request.json();
  setGene2aiKey(auth.userId, key || null);

  return NextResponse.json({
    configured: !!key,
    maskedKey: key ? key.slice(0, 8) + '...' + key.slice(-4) : null,
  });
}

// DELETE — remove Gene2AI key
export async function DELETE(request) {
  initTables();
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  setGene2aiKey(auth.userId, null);
  return NextResponse.json({ configured: false });
}
