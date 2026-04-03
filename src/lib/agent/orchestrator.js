import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiFunctionDeclarations, executeTool } from './tools';

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

/**
 * Run the agent orchestrator.
 * Yields events: { type: 'thinking'|'text'|'done', ... }
 */
export async function* runAgent({ message, history, context }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    yield { type: 'text', content: '服务暂时不可用（AI 引擎未配置）。请联系管理员。' };
    yield { type: 'done' };
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const tools = [{ functionDeclarations: getGeminiFunctionDeclarations() }];

  // Build conversation contents from history
  const contents = [];
  for (const msg of history) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  let round = 0;
  while (round < MAX_TOOL_ROUNDS) {
    round++;

    const result = await model.generateContent({ contents, tools });
    const response = result.response;
    const candidate = response.candidates?.[0];
    if (!candidate) {
      yield { type: 'text', content: '抱歉，我暂时无法回答。请稍后再试。' };
      yield { type: 'done' };
      return;
    }

    const parts = candidate.content?.parts || [];

    // Check for function calls
    const functionCalls = parts.filter(p => p.functionCall);
    if (functionCalls.length > 0) {
      // Add model response to contents
      contents.push({ role: 'model', parts });

      // Execute each function call
      const functionResponses = [];
      for (const part of functionCalls) {
        const { name, args } = part.functionCall;
        yield { type: 'thinking', tool: name };
        const toolResult = await executeTool(name, args || {}, context);
        functionResponses.push({
          functionResponse: {
            name,
            response: { result: toolResult },
          },
        });
      }

      // Add function responses and continue the loop
      contents.push({ role: 'user', parts: functionResponses });
      continue;
    }

    // No function calls — extract text response
    const textParts = parts.filter(p => p.text);
    const text = textParts.map(p => p.text).join('');
    if (text) {
      yield { type: 'text', content: text };
    }
    break;
  }

  yield { type: 'done' };
}
