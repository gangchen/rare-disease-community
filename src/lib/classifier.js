import { GoogleGenerativeAI } from '@google/generative-ai';

const CATEGORIES = ['topic', 'experience', 'question'];

const PROMPT = `You are a post classifier for a rare disease community. Classify the following post into exactly one category:
- "experience": The author shares personal treatment experience, care tips, recovery stories, medication reviews, or practical guides.
- "question": The author asks a question, seeks help, or requests advice.
- "topic": News, policy updates, general discussion, or anything that doesn't fit the above two.

Post title: {title}
Post content (first 500 chars): {content}

Reply with ONLY one word: topic, experience, or question.`;

/**
 * Classify a post using Gemini API.
 * Falls back to keyword-based classification if API key is not configured or call fails.
 */
export async function classifyPost(title, content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return await classifyWithGemini(apiKey, title, content);
    } catch (e) {
      console.warn('Gemini classification failed, falling back to keywords:', e.message);
    }
  }
  return classifyByKeywords(title, content);
}

async function classifyWithGemini(apiKey, title, content) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = PROMPT
    .replace('{title}', title)
    .replace('{content}', (content || '').slice(0, 500));

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().toLowerCase();

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
