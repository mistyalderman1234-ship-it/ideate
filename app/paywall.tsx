import { router } from 'expo-router';
import { Button, Spinner, Text, useThemeColor } from 'heroui-native';
import { Check, Crown, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { PLANS, PRO_FEATURES } from '@/lib/catalog';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import type { PlanId } from '@/lib/types';

export default function PaywallScreen() {
  const [accent, muted, , border, gold] = useThemeColor([
    'accent',
    'muted',
    'foreground',
    'border',
    'warning',
  ]);
  const purchase = useSubscriptionStore((s) => s.purchase);
  const isProcessing = useSubscriptionStore((s) => s.isProcessing);
  const restore = useSubscriptionStore((s) => s.restore);

  const [selected, setSelected] = useState<PlanId>('yearly');

  async function onSubscribe() {
    await purchase(selected);
    router.back();
  }

  async function onRestore() {
    const ok = await restore();
    if (ok) router.back();
    else Alert.alert('Nothing to restore', 'No active subscription was found.');
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-4 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-end">
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <X color={muted} size={24} />
          </Pressable>
        </View>

        <View className="items-center gap-3">
          <View className="bg-brand-soft h-16 w-16 items-center justify-center rounded-2xl">
            <Crown color={accent} size={30} />
          </View>
          <Text.Heading type="h1" align="center">
            Unlock AI Business Pro
          </Text.Heading>
          <Text.Paragraph align="center" color="muted">
            Unlimited generations, every premium category, and priority AI.
          </Text.Paragraph>
        </View>

        <View className="gap-2.5">
          {PRO_FEATURES.map((feature) => (
            <View key={feature} className="flex-row items-center gap-3">
              <View className="bg-brand-soft h-6 w-6 items-center justify-center rounded-full">
                <Check color={accent} size={15} />
              </View>
              <Text className="flex-1">{feature}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          {PLANS.map((plan) => {
            const active = plan.id === selected;
            return (
              <Pressable key={plan.id} onPress={() => setSelected(plan.id)}>
                <View
                  style={{ borderColor: active ? accent : border, borderWidth: active ? 2 : 1 }}
                  className="bg-surface rounded-2xl p-4"
                >
                  {plan.badge && (
                    <View
                      style={{ backgroundColor: gold }}
                      className="absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5"
                    >
                      <Text className="text-xs font-semibold text-black">{plan.badge}</Text>
                    </View>
                  )}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold">{plan.title}</Text>
                      <Text color="muted" className="text-sm">
                        {plan.subtitle}
                      </Text>
                    </View>
                    <View className="flex-row items-baseline">
                      <Text className="text-lg font-bold">{plan.price}</Text>
                      <Text color="muted" className="text-sm">
                        {plan.period}
                      </Text>
                    </View>
                    <View
                      style={{
                        borderColor: active ? accent : border,
                        backgroundColor: active ? accent : 'transparent',
                      }}
                      className="ml-3 h-6 w-6 items-center justify-center rounded-full border"
                    >
                      {active && <Check color="#fff" size={14} />}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="border-border pb-safe-offset-5 gap-3 border-t p-5">
        <Button variant="primary" size="lg" isDisabled={isProcessing} onPress={onSubscribe}>
          {isProcessing ? <Spinner color="#fff" /> : 'Start Pro'}
        </Button>
        <View className="flex-row items-center justify-center gap-4">
          <Pressable onPress={onRestore} hitSlop={8}>
            <Text color="muted" className="text-sm">
              Restore
            </Text>
          </Pressable>
          <Text color="muted" className="text-sm">
            ·
          </Text>
          <Text color="muted" className="text-sm">
            Cancel anytime
          </Text>
        </View>
      </View>
    </View>
  );
}
