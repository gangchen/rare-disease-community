import { authenticate } from '@/lib/middleware';
import { ensureAgentTables, getOrCreateSession, getSessionHistory, saveMessage, getGene2aiKey } from '@/lib/agent/db';
import { runAgent } from '@/lib/agent/orchestrator';

// Ensure tables exist on first import
let tablesReady = false;

function initTables() {
  if (!tablesReady) {
    ensureAgentTables();
    tablesReady = true;
  }
}

export async function POST(request) {
  initTables();

  // Parse auth (optional — guest users can chat but can't create posts or access Gene2AI)
  const auth = authenticate(request);
  const userId = auth.error ? null : auth.userId;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: '无效的请求体' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, sessionId } = body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: '消息不能为空' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create or retrieve session
  const session = getOrCreateSession(sessionId, userId);

  // Load history
  const history = getSessionHistory(session.id, 20);

  // Save user message
  saveMessage(session.id, 'user', message.trim());

  // Build context for tools
  const gene2aiKey = getGene2aiKey(userId);
  const context = {
    userId,
    gene2aiKey,
  };

  // Stream response using SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        let fullText = '';
        const toolCalls = [];

        for await (const event of runAgent({ message: message.trim(), history, context })) {
          if (event.type === 'thinking') {
            send({ type: 'thinking', tool: event.tool });
            toolCalls.push(event.tool);
          } else if (event.type === 'text') {
            send({ type: 'text', content: event.content });
            fullText += event.content;
          } else if (event.type === 'done') {
            // Save assistant message
            if (fullText) {
              saveMessage(session.id, 'assistant', fullText, toolCalls.length > 0 ? toolCalls : null);
            }
            send({ type: 'done', sessionId: session.id });
          }
        }
      } catch (err) {
        console.error('Agent error:', err);
        send({ type: 'error', content: '抱歉，出了点问题。请稍后再试。' });
        send({ type: 'done', sessionId: session.id });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
