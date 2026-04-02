import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from '@/lib/mcp/tools';
import { verifyApiKey } from '@/lib/auth';

// In-memory session store
const sessions = new Map();

// GET /api/mcp — SSE connection
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');

  // Validate API key
  let auth = null;
  if (apiKey) {
    auth = verifyApiKey(apiKey);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'API Key 无效或已停用' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const server = new McpServer({
    name: 'rare2ai',
    version: '1.0.0',
  });

  // Register tools with auth context
  registerTools(server, auth ? { userId: auth.userId, role: auth.role } : null);

  const transport = new SSEServerTransport('/api/mcp', new Response().headers);

  // Store session for POST handling
  const sessionId = transport.sessionId;
  sessions.set(sessionId, { server, transport, auth });

  // Clean up on close
  const cleanup = () => {
    sessions.delete(sessionId);
  };

  const stream = new ReadableStream({
    start(controller) {
      const originalSend = transport._send?.bind(transport);
      // Override to pipe through our stream
      transport.send = (message) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
        } catch {
          cleanup();
        }
      };

      // Send initial session endpoint
      controller.enqueue(`event: endpoint\ndata: /api/mcp?sessionId=${sessionId}\n\n`);

      server.connect(transport).catch(cleanup);
    },
    cancel() {
      cleanup();
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

// POST /api/mcp — Handle messages
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  const session = sessions.get(sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: '会话不存在或已过期' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    await session.transport.handleMessage(body);
    return new Response('ok', { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
