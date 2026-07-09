import type { Category, SubscriptionPlan } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'business-ideas',
    title: 'Business Ideas',
    description: 'Fresh, actionable startup ideas',
    icon: 'Lightbulb',
    placeholder: 'e.g. a subscription service for busy parents',
    pro: false,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'marketing-copy',
    title: 'Marketing Copy',
    description: 'Persuasive copy that converts',
    icon: 'Megaphone',
    placeholder: 'e.g. a landing page for an eco water bottle',
    pro: false,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'cold-emails',
    title: 'Cold Emails',
    description: 'Outreach emails that get replies',
    icon: 'Mail',
    placeholder: 'e.g. pitching design services to startups',
    pro: false,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'social-posts',
    title: 'Social Posts',
    description: 'Scroll-stopping social content',
    icon: 'Share2',
    placeholder: 'e.g. launch announcement for a fitness app',
    pro: false,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'names-slogans',
    title: 'Names & Slogans',
    description: 'Memorable brand names and taglines',
    icon: 'Sparkles',
    placeholder: 'e.g. a premium coffee subscription brand',
    pro: true,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'pitch',
    title: 'Investor Pitch',
    description: 'Concise, compelling pitch drafts',
    icon: 'TrendingUp',
    placeholder: 'e.g. an AI scheduling tool for clinics',
    pro: true,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'product-descriptions',
    title: 'Product Descriptions',
    description: 'E-commerce copy that sells',
    icon: 'ShoppingBag',
    placeholder: 'e.g. handmade leather wallet',
    pro: true,
    accentClass: 'bg-brand-soft',
  },
  {
    id: 'ad-headlines',
    title: 'Ad Headlines',
    description: 'High-CTR paid ad headlines',
    icon: 'Zap',
    placeholder: 'e.g. Google Ads for a tax software',
    pro: true,
    accentClass: 'bg-brand-soft',
  },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export const FREE_DAILY_CREDITS = 3;

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$39.99',
    period: '/year',
    subtitle: 'Just $3.33/mo · billed annually',
    badge: 'Best value · Save 66%',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$9.99',
    period: '/month',
    subtitle: 'Billed monthly, cancel anytime',
  },
];

export const PRO_FEATURES = [
  'Unlimited generations',
  'All premium categories',
  'Priority AI responses',
  'Full generation history',
  'Export & copy anywhere',
];
