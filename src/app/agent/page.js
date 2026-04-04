'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ChatBubble from '@/components/ChatBubble';
import QuickActions from '@/components/QuickActions';
import { Send, Plus } from 'lucide-react';

export default function AgentPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, scrollToBottom]);

  // Load last session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/agent/sessions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.sessions?.length) return;
        const lastSession = data.sessions[0];
        // Load messages for the last session
        fetch(`/api/agent/sessions?id=${lastSession.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.ok ? r.json() : null)
          .then(msgData => {
            if (msgData?.messages?.length) {
              setSessionId(lastSession.id);
              setMessages(msgData.messages.map(m => ({ role: m.role, content: m.content })));
            }
          });
      });
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setLoading(true);
    setThinking(null);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: msg, sessionId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: 'assistant', content: err.error || '请求失败，请稍后再试。' }]);
        setLoading(false);
        return;
      }

      // Parse SSE stream using fetch + ReadableStream (works in WeChat browser)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let addedAssistant = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'thinking') {
              setThinking(data.tool);
            } else if (data.type === 'text') {
              setThinking(null);
              assistantText += data.content;
              if (!addedAssistant) {
                addedAssistant = true;
                setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
              } else {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                  return updated;
                });
              }
            } else if (data.type === 'error') {
              setThinking(null);
              setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            } else if (data.type === 'done') {
              if (data.sessionId) setSessionId(data.sessionId);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请检查网络连接后重试。' }]);
    } finally {
      setLoading(false);
      setThinking(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function newChat() {
    setMessages([]);
    setSessionId(null);
    setInput('');
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-[calc(100dvh-4rem)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 pb-10">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Rare2AI 健康助手</h2>
                <p className="text-sm text-gray-400 max-w-sm">
                  搜索病友经验、解读健康报告、浏览罕见病资讯
                </p>
              </div>
              <QuickActions onAction={sendMessage} disabled={loading} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
              {messages.map((msg, i) => (
                <ChatBubble key={i} role={msg.role} content={msg.content} />
              ))}
              {thinking && <ChatBubble thinking={thinking} />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-surface-600 bg-surface-900/80 backdrop-blur-md px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            {!isEmpty && (
              <button
                onClick={newChat}
                className="p-2.5 text-gray-400 hover:text-white transition shrink-0"
                title="新对话"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                enterKeyHint="send"
                rows={1}
                className="w-full px-4 py-3 rounded-2xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm resize-none"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-primary-400 text-black rounded-xl hover:bg-primary-300 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
