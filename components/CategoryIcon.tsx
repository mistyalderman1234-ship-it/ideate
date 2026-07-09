import {
  Lightbulb,
  Mail,
  Megaphone,
  Share2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideProps,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

const ICONS: Record<string, ComponentType<LucideProps>> = {
  Lightbulb,
  Megaphone,
  Mail,
  Share2,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Zap,
};

export function CategoryIcon({
  name,
  color,
  size = 22,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon color={color} size={size} />;
}
