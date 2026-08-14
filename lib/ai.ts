import type { CategoryId } from './types';

/**
 * AI generation engine.
 *
 * Calls the server-side `generate-text` bilt-cloud function, which holds the
 * provider key (Google Gemini) and returns generated text. Failures throw a
 * message that is safe to show the user — the app never substitutes fake output
 * for a real result.
 */

const BILT_URL = process.env.EXPO_PUBLIC_BILT_URL;
const BILT_ANON_KEY = process.env.EXPO_PUBLIC_BILT_ANON_KEY;

const OFFLINE_MESSAGE =
  'Could not reach the AI service. Check your connection and try again in a moment.';

function readErrorMessage(data: unknown): string | null {
  if (data !== null && typeof data === 'object' && 'error' in data) {
    const raw = data.error;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return null;
}

function readText(data: unknown): string | null {
  if (data !== null && typeof data === 'object' && 'text' in data) {
    const raw = data.text;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return null;
}

export function buildSystemPrompt(categoryId: CategoryId): string {
  const map: Record<CategoryId, string> = {
    'business-ideas':
      'You are a startup strategist. Generate concrete, actionable business ideas with a hook, target customer, and revenue model.',
    'marketing-copy':
      'You are a senior copywriter. Write persuasive, benefit-led marketing copy with a clear call to action.',
    'cold-emails':
      'You are an outbound sales expert. Write short, personalized cold emails that earn replies.',
    'social-posts':
      'You are a social media strategist. Write scroll-stopping posts with a strong hook and clear CTA.',
    'names-slogans': 'You are a brand naming expert. Generate memorable brand names and taglines.',
    pitch:
      'You are a pitch coach. Write a concise, compelling investor pitch covering problem, solution, market, and ask.',
    'product-descriptions':
      'You are an e-commerce copywriter. Write vivid product descriptions that drive purchases.',
    'ad-headlines':
      'You are a performance marketer. Write high-CTR ad headlines optimized for conversions.',
  };
  return map[categoryId];
}

export async function generate(categoryId: CategoryId, prompt: string): Promise<string> {
  if (!BILT_URL || !BILT_ANON_KEY) {
    throw new Error('AI generation is not configured for this build.');
  }

  let res: Response;
  try {
    res = await fetch(`${BILT_URL}/functions/v1/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: BILT_ANON_KEY,
        Authorization: `Bearer ${BILT_ANON_KEY}`,
      },
      body: JSON.stringify({
        categoryId,
        prompt,
        systemPrompt: buildSystemPrompt(categoryId),
      }),
    });
  } catch {
    throw new Error(OFFLINE_MESSAGE);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(readErrorMessage(data) ?? OFFLINE_MESSAGE);
  }

  const text = readText(data);
  if (!text) {
    throw new Error('The AI returned an empty response. Try rephrasing your prompt.');
  }
  return text;
}
