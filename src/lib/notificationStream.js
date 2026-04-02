// Module-level store: userId -> Set<ReadableStreamDefaultController>
const streams = new Map();

export function addStream(userId, controller) {
  if (!streams.has(userId)) {
    streams.set(userId, new Set());
  }
  streams.get(userId).add(controller);
}

export function removeStream(userId, controller) {
  const set = streams.get(userId);
  if (set) {
    set.delete(controller);
    if (set.size === 0) streams.delete(userId);
  }
}

export function notifyUser(userId, event) {
  const set = streams.get(userId);
  if (!set || set.size === 0) return;
  const data = `data: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  for (const controller of set) {
    try {
      controller.enqueue(encoder.encode(data));
    } catch {
      // Client disconnected
      set.delete(controller);
    }
  }
}
