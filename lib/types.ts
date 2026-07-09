export type CategoryId =
  | 'business-ideas'
  | 'marketing-copy'
  | 'cold-emails'
  | 'social-posts'
  | 'pitch'
  | 'names-slogans'
  | 'product-descriptions'
  | 'ad-headlines';

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
  placeholder: string;
  pro: boolean;
  accentClass: string;
}

export interface Generation {
  id: string;
  categoryId: CategoryId;
  categoryTitle: string;
  prompt: string;
  output: string;
  createdAt: number;
  favorite: boolean;
}

export type PlanId = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: PlanId;
  title: string;
  price: string;
  period: string;
  subtitle: string;
  badge?: string;
}
