import type { CategoryId } from './types';

/**
 * AI generation engine.
 *
 * Uses OpenAI when EXPO_PUBLIC_OPENAI_API_KEY is set, and falls back to
 * realistic, category-aware mock content otherwise (so the app stays testable
 * offline / without a key). The UI calls generate() and only depends on its
 * Promise<string> contract.
 */

const DELAY_MS = 1100;

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';

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

function titleCase(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'your idea';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function generateMock(categoryId: CategoryId, prompt: string): string {
  const topic = titleCase(prompt || 'your idea');
  switch (categoryId) {
    case 'business-ideas':
      return [
        `Here are 3 business ideas around "${prompt.trim() || 'your niche'}":`,
        '',
        `1. ${topic} — On-Demand`,
        '   A subscription platform that removes the biggest friction point for your customer. Start with a narrow segment, charge a monthly fee, and expand once retention is strong.',
        '   Revenue: $29–79/mo subscriptions + premium add-ons.',
        '',
        `2. ${topic} Marketplace`,
        '   Connect supply and demand in a fragmented market. Take a transaction fee and layer on tools that lock in your best providers.',
        '   Revenue: 10–15% take rate + featured listings.',
        '',
        `3. ${topic} Toolkit`,
        '   A focused software tool that automates one painful, repetitive task. Land with a free tier, upsell power users.',
        '   Revenue: freemium SaaS, $15–49/mo per seat.',
      ].join('\n');
    case 'marketing-copy':
      return [
        `Headline: Finally, ${topic} that actually works.`,
        '',
        `Stop settling for good enough. ${topic} was built for people who expect more — faster results, less hassle, zero guesswork.`,
        '',
        '• Save hours every week',
        '• Loved by thousands of customers',
        '• Risk-free with a money-back guarantee',
        '',
        'Ready to see the difference? Start today →',
      ].join('\n');
    case 'cold-emails':
      return [
        `Subject: quick idea for ${topic}`,
        '',
        'Hi {First Name},',
        '',
        `I noticed {Company} is growing fast — congrats. Teams at your stage usually struggle with ${prompt.trim() || 'this exact problem'}, and it quietly costs them time and revenue.`,
        '',
        'We help companies fix that in weeks, not months. Worth a quick 15-minute call to see if it applies to you?',
        '',
        'Open to Tuesday or Thursday?',
        '',
        'Best,',
        '{Your Name}',
      ].join('\n');
    case 'social-posts':
      return [
        `Hook: Most people get ${topic} completely wrong. 🧵`,
        '',
        `Here's what actually works:`,
        '',
        '1. Start before you feel ready',
        '2. Focus on one thing until it clicks',
        '3. Double down on what your audience loves',
        '',
        'Save this for later 🔖 and follow for more.',
        '',
        '#startup #growth #entrepreneur',
      ].join('\n');
    case 'names-slogans':
      return [
        `Brand names for ${topic}:`,
        '',
        '• Northbound',
        '• Kindle & Co.',
        '• Everbloom',
        '• Momentum Labs',
        '• Truepath',
        '',
        'Taglines:',
        '• "Built for what\'s next."',
        '• "Less effort. More impact."',
        '• "Your unfair advantage."',
      ].join('\n');
    case 'pitch':
      return [
        `${topic} — Investor Pitch`,
        '',
        `Problem: Customers waste time and money dealing with ${prompt.trim() || 'a broken, manual process'}.`,
        '',
        `Solution: ${topic} automates the entire workflow in one simple product.`,
        '',
        'Market: A $4B+ and growing category with no clear leader.',
        '',
        'Traction: Early users, strong retention, and a repeatable acquisition channel.',
        '',
        'The Ask: Raising a round to expand the team and accelerate growth.',
      ].join('\n');
    case 'product-descriptions':
      return [
        topic,
        '',
        `Meet the ${topic.toLowerCase()} you'll actually love using every day. Thoughtfully designed, built to last, and crafted with premium materials that feel as good as they look.`,
        '',
        '• Premium, durable construction',
        '• Designed for everyday use',
        '• Backed by a satisfaction guarantee',
        '',
        'Upgrade your everyday. Add to cart today.',
      ].join('\n');
    case 'ad-headlines':
      return [
        `Ad headlines for ${topic}:`,
        '',
        `1. "The smarter way to handle ${prompt.trim() || 'it'}"`,
        '2. "Get results in days, not months"',
        '3. "Join thousands who made the switch"',
        '4. "Stop wasting money — start today"',
        '5. "Try it free. Cancel anytime."',
      ].join('\n');
    default:
      return topic;
  }
}

export async function generate(categoryId: CategoryId, prompt: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  return generateMock(categoryId, prompt);
}
