import { getOpenAITools, executeTool } from './tools';

const KIMI_API_URL = 'https://api.moonshot.ai/v1/chat/completions';
const KIMI_MODEL = 'moonshot-v1-32k';

const SYSTEM_PROMPT = `你是 Rare2AI 罕见病社区的健康助手。

你的能力：
1. 搜索社区中病友的经验分享、治疗记录
2. 通过 Gene2AI 解读用户的基因报告、体检指标、用药风险
3. 浏览罕见病新闻和政策资讯
4. 代替用户发帖、查看帖子详情

重要规则：
- 你不是医生，不做诊断，涉及医疗决策时建议咨询专业医生
- 解读健康数据时引用具体数值和参考范围
- 讨论用药时必须检查 CYP450 代谢状态和药物敏感性
- 用温暖简洁的中文交流
- 保护用户隐私，不主动索要敏感信息
- 优先使用 get_health_profile 获取结论性健康画像（数据量小、可缓存），仅在用户需要具体数值时使用 get_full_records
- 上传文档前必须获得用户明确同意

首次涉及健康话题时，如果用户已绑定 Gene2AI，先询问：
"我可以参考你的 Gene2AI 健康档案来提供个性化建议，需要我这样做吗？"`;

const MAX_TOOL_ROUNDS = 5;

async function callKimi(apiKey, messages, tools) {
  const body = {
    model: KIMI_MODEL,
    messages,
    temperature: 0.7,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  const res = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Kimi API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Run the agent orchestrator.
 * Yields events: { type: 'thinking'|'text'|'done', ... }
 */
export async function* runAgent({ message, history, context }) {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    yield { type: 'text', content: '服务暂时不可用（AI 引擎未配置）。请联系管理员。' };
    yield { type: 'done' };
    return;
  }

  const tools = getOpenAITools();

  // Build messages array
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: 'user', content: message });

  let round = 0;
  while (round < MAX_TOOL_ROUNDS) {
    round++;

    let result;
    try {
      result = await callKimi(apiKey, messages, tools);
    } catch (err) {
      yield { type: 'text', content: `抱歉，AI 服务出错：${err.message}` };
      yield { type: 'done' };
      return;
    }

    const choice = result.choices?.[0];
    if (!choice) {
      yield { type: 'text', content: '抱歉，我暂时无法回答。请稍后再试。' };
      yield { type: 'done' };
      return;
    }

    const assistantMessage = choice.message;

    // Check for tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Add assistant message with tool_calls to history
      messages.push(assistantMessage);

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        let fnArgs = {};
        try {
          fnArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          // ignore parse errors
        }

        yield { type: 'thinking', tool: fnName };
        const toolResult = await executeTool(fnName, fnArgs, context);

        // Add tool response
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
        });
      }
      continue;
    }

    // No tool calls — return text response
    const text = assistantMessage.content || '';
    if (text) {
      yield { type: 'text', content: text };
    }
    break;
  }

  yield { type: 'done' };
}
