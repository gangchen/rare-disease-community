import { NextResponse } from 'next/server';
import { authenticate, authError } from '@/lib/middleware';
import { ensureAgentTables, getUserSessions, getSessionHistory } from '@/lib/agent/db';

let tablesReady = false;
function initTables() {
  if (!tablesReady) { ensureAgentTables(); tablesReady = true; }
}

// GET /api/agent/sessions — list user's chat sessions
// GET /api/agent/sessions?id=xxx — get messages for a session
export async function GET(request) {
  initTables();
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');

  if (sessionId) {
    const messages = getSessionHistory(sessionId, 50);
    return NextResponse.json({ messages });
  }

  const sessions = getUserSessions(auth.userId);
  return NextResponse.json({ sessions });
}
