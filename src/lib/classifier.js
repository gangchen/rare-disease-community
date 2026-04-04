const CATEGORIES = ['topic', 'experience', 'question'];

const KIMI_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

const PROMPT = `You are a post classifier for a rare disease community. Classify the following post into exactly one category:
- "experience": The author shares personal treatment experience, care tips, recovery stories, medication reviews, or practical guides.
- "question": The author asks a question, seeks help, or requests advice.
- "topic": News, policy updates, general discussion, or anything that doesn't fit the above two.

Post title: {title}
Post content (first 500 chars): {content}

Reply with ONLY one word: topic, experience, or question.`;

/**
 * Classify a post using Kimi API.
 * Falls back to keyword-based classification if API key is not configured or call fails.
 */
export async function classifyPost(title, content) {
  const apiKey = process.env.KIMI_API_KEY;
  if (apiKey) {
    try {
      return await classifyWithKimi(apiKey, title, content);
    } catch (e) {
      console.warn('Kimi classification failed, falling back to keywords:', e.message);
    }
  }
  return classifyByKeywords(title, content);
}

async function classifyWithKimi(apiKey, title, content) {
  const prompt = PROMPT
    .replace('{title}', title)
    .replace('{content}', (content || '').slice(0, 500));

  const res = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 10,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Kimi API error: ${res.status}`);
  }

  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content || '').trim().toLowerCase();

  if (CATEGORIES.includes(text)) return text;

  // Try to extract a valid category from the response
  for (const cat of CATEGORIES) {
    if (text.includes(cat)) return cat;
  }

  return 'topic';
}

/**
 * Keyword-based fallback classifier (zero cost, no external dependency).
 */
export function classifyByKeywords(title, content) {
  const text = `${title} ${content || ''}`;

  const questionPatterns = /如何|怎么|怎样|吗？|呢？|请问|求助|有没有|能不能|是否|哪里|哪个|什么|为什么|\?|？/;
  if (questionPatterns.test(text)) return 'question';

  const experiencePatterns = /经验|分享|经历|心得|总结|指南|攻略|记录|体会|方法|技巧|我的|我家|康复|护理|治疗经历|用药/;
  if (experiencePatterns.test(text)) return 'experience';

  return 'topic';
}
