import { router, useLocalSearchParams } from 'expo-router';
import { Button, Input, Spinner, Text, TextField, useThemeColor } from 'heroui-native';
import { Check, Crown, MailCheck, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { PLANS, PRO_FEATURES } from '@/lib/catalog';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import type { PlanId } from '@/lib/types';

type Step = 'plan' | 'code';

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
  const sendCode = useSubscriptionStore((s) => s.sendCode);
  const verifyCode = useSubscriptionStore((s) => s.verifyCode);
  const isProcessing = useSubscriptionStore((s) => s.isProcessing);
  const savedEmail = useSubscriptionStore((s) => s.email);

  const [selected, setSelected] = useState<PlanId>('yearly');
  const [email, setEmail] = useState(savedEmail ?? '');
  const [step, setStep] = useState<Step>('plan');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
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

  async function onSendCode() {
    if (!email.includes('@')) {
      Alert.alert('Enter your email', 'Enter a valid email address to continue.');
      return;
    }
    setSending(true);
    try {
      await sendCode(email);
      setStep('code');
      setCode('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('Could not send code', message);
    } finally {
      setSending(false);
    }
  }

  async function onVerifyAndCheckout() {
    if (code.trim().length < 6) {
      Alert.alert('Enter the code', 'Enter the 6-digit code we emailed you.');
      return;
    }
    setChecking(true);
    try {
      const verified = await verifyCode(email, code);
      if (!verified) {
        Alert.alert('Incorrect code', 'That code is incorrect. Please try again.');
        return;
      }
      await startCheckout(selected, email);
      // On web this redirects away; nothing else to do.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('Verification failed', message);
    } finally {
      setChecking(false);
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

  const busy = isProcessing || verifying || sending || checking;

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
            Unlock AI Business Pro
          </Text.Heading>
          <Text.Paragraph align="center" color="muted">
            Unlimited generations, every premium category, and priority AI.
          </Text.Paragraph>
        </View>

        {step === 'plan' ? (
          <>
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
                We email you a 6-digit code to confirm your address before checkout.
              </Text>
            </View>
          </>
        ) : (
          <View className="gap-4">
            <View className="items-center gap-2">
              <View className="bg-brand-soft h-14 w-14 items-center justify-center rounded-2xl">
                <MailCheck color={accent} size={26} />
              </View>
              <Text.Heading type="h3" align="center">
                Enter your code
              </Text.Heading>
              <Text color="muted" align="center" className="text-sm">
                We sent a 6-digit code to {email}. It expires in 10 minutes.
              </Text>
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium">Verification code</Text>
              <TextField>
                <Input
                  placeholder="123456"
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                />
              </TextField>
            </View>

            <View className="flex-row items-center justify-center gap-4">
              <Pressable onPress={() => setStep('plan')} hitSlop={8} disabled={busy}>
                <Text color="muted" className="text-sm">
                  Change email
                </Text>
              </Pressable>
              <Text color="muted" className="text-sm">
                ·
              </Text>
              <Pressable onPress={onSendCode} hitSlop={8} disabled={busy}>
                <Text style={{ color: accent }} className="text-sm font-medium">
                  Resend code
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="border-border pb-safe-offset-5 gap-3 border-t p-5">
        {step === 'plan' ? (
          <Button variant="primary" size="lg" isDisabled={busy} onPress={onSendCode}>
            {busy ? <Spinner color="#fff" /> : 'Continue'}
          </Button>
        ) : (
          <Button variant="primary" size="lg" isDisabled={busy} onPress={onVerifyAndCheckout}>
            {busy ? <Spinner color="#fff" /> : 'Verify & continue to checkout'}
          </Button>
        )}
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
      </View>
    </KeyboardAvoidingView>
  );
}
