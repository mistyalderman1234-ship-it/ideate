import { router, useLocalSearchParams } from 'expo-router';
import { Button, Input, Spinner, Text, TextField, useThemeColor } from 'heroui-native';
import { Check, Crown, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

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
  const params = useLocalSearchParams<{ status?: string }>();
  const startCheckout = useSubscriptionStore((s) => s.startCheckout);
  const refreshStatus = useSubscriptionStore((s) => s.refreshStatus);
  const isProcessing = useSubscriptionStore((s) => s.isProcessing);
  const savedEmail = useSubscriptionStore((s) => s.email);

  const [selected, setSelected] = useState<PlanId>('yearly');
  const [email, setEmail] = useState(savedEmail ?? '');
  const [verifying, setVerifying] = useState(false);

  // Returning from Stripe Checkout: verify the subscription, then close.
  useEffect(() => {
    if (params.status === 'success') {
      setVerifying(true);
      void refreshStatus().then((ok) => {
        setVerifying(false);
        if (ok) {
          Alert.alert('Welcome to Pro', 'Your subscription is active. Enjoy!');
          router.back();
        } else {
          Alert.alert(
            'Almost there',
            'We could not confirm your subscription yet. It can take a moment — tap Restore to check again.',
          );
        }
      });
    }
  }, [params.status, refreshStatus]);

  async function onSubscribe() {
    try {
      await startCheckout(selected, email);
      // On web this redirects away; nothing else to do.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('Could not start checkout', message);
    }
  }

  async function onRestore() {
    if (!email.includes('@')) {
      Alert.alert('Enter your email', 'Enter the email you subscribed with to restore access.');
      return;
    }
    const ok = await refreshStatus(email);
    if (ok) router.back();
    else Alert.alert('Nothing to restore', 'No active subscription was found for that email.');
  }

  const busy = isProcessing || verifying;

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-4 gap-6"
        keyboardShouldPersistTaps="handled"
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
            Unlock Ideate Pro
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

        <View className="gap-1.5">
          <Text className="text-sm font-medium">Email</Text>
          <TextField>
            <Input
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
              autoComplete="email"
            />
          </TextField>
          <Text color="muted" className="text-xs">
            We use your email to link your subscription. No account needed.
          </Text>
        </View>
      </ScrollView>

      <View className="border-border pb-safe-offset-5 gap-3 border-t p-5">
        <Button variant="primary" size="lg" isDisabled={busy} onPress={onSubscribe}>
          {busy ? <Spinner color="#fff" /> : 'Continue to checkout'}
        </Button>
        <View className="flex-row items-center justify-center gap-4">
          <Pressable onPress={onRestore} hitSlop={8} disabled={busy}>
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
        <Text color="muted" align="center" className="text-xs leading-4">
          Subscriptions renew automatically until cancelled. By subscribing you agree to our{' '}
          <Text
            className="text-accent text-xs underline"
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })}
          >
            Terms
          </Text>{' '}
          and{' '}
          <Text
            className="text-accent text-xs underline"
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
