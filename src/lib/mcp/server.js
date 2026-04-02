import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './tools.js';

export function createMcpServer() {
  const server = new McpServer({
    name: 'rare2ai',
    version: '1.0.0',
  });

  registerTools(server);

  return server;
}
