import { format } from 'date-fns';
import { router } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Button, Card, Separator, Text, useThemeColor } from 'heroui-native';
import { Check, ChevronRight, Crown, RefreshCw, Sparkles, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';

import { FREE_DAILY_CREDITS, PRO_FEATURES } from '@/lib/catalog';
import { useGenerationsStore } from '@/lib/generationsStore';
import { type KeyMode, useSubscriptionStore } from '@/lib/subscriptionStore';

async function onRate() {
  if (await StoreReview.isAvailableAsync()) {
    await StoreReview.requestReview();
  }
}

function openLegal(doc: 'privacy' | 'terms') {
  router.push({ pathname: '/legal/[doc]', params: { doc } });
}

export default function SettingsScreen() {
  const [accent, muted, gold] = useThemeColor(['accent', 'muted', 'foreground']);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const activePlan = useSubscriptionStore((s) => s.activePlan);
  const purchasedAt = useSubscriptionStore((s) => s.purchasedAt);
  const refreshStatus = useSubscriptionStore((s) => s.refreshStatus);
  const cancel = useSubscriptionStore((s) => s.cancel);
  const email = useSubscriptionStore((s) => s.email);
  const isProcessing = useSubscriptionStore((s) => s.isProcessing);
  const getKeyMode = useSubscriptionStore((s) => s.getKeyMode);
  const historyCount = useGenerationsStore((s) => s.history.length);

  const [restoring, setRestoring] = useState(false);
  const [keyMode, setKeyMode] = useState<KeyMode | null>(null);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    void getKeyMode().then(setKeyMode);
  }, [getKeyMode]);

  // Only offer "Rate this app" where the store review flow can actually run.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void StoreReview.hasAction().then(setCanReview);
  }, []);

  async function onRestore() {
    if (!email?.includes('@')) {
      router.push('/paywall');
      return;
    }
    setRestoring(true);
    const ok = await refreshStatus();
    setRestoring(false);
    Alert.alert(
      ok ? 'Subscription restored' : 'Nothing to restore',
      ok ? 'Your Pro subscription is active.' : 'We could not find an active subscription.',
    );
  }

  function onCancel() {
    Alert.alert(
      'Manage subscription',
      'Manage or cancel your subscription anytime through the link in your Stripe receipt email. Removing access here hides Pro on this device until you restore.',
      [
        { text: 'Keep Pro', style: 'cancel' },
        { text: 'Remove access', style: 'destructive', onPress: cancel },
      ],
    );
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="p-4 pb-10 gap-5"
      showsVerticalScrollIndicator={false}
    >
      {isPro ? (
        <Card variant="secondary" className="gap-3 p-5">
          <View className="flex-row items-center gap-2">
            <Crown color={gold} size={22} />
            <Text.Heading type="h3">You&apos;re on Pro</Text.Heading>
          </View>
          <Text color="muted">
            {activePlan === 'yearly' ? 'Yearly' : 'Monthly'} plan
            {purchasedAt ? ` · since ${format(purchasedAt, 'MMM d, yyyy')}` : ''}
          </Text>
          <Text color="muted" className="text-sm">
            Unlimited generations and all premium categories are unlocked.
          </Text>
          <Button variant="secondary" onPress={onCancel}>
            Cancel subscription
          </Button>
        </Card>
      ) : (
        <Pressable onPress={() => router.push('/paywall')}>
          <Card variant="secondary" className="gap-4 p-5">
            <View className="flex-row items-center gap-2">
              <Crown color={accent} size={22} />
              <Text.Heading type="h3">Upgrade to Pro</Text.Heading>
            </View>
            <View className="gap-2">
              {PRO_FEATURES.map((feature) => (
                <View key={feature} className="flex-row items-center gap-2">
                  <Check color={accent} size={16} />
                  <Text className="text-sm">{feature}</Text>
                </View>
              ))}
            </View>
            <Button variant="primary" onPress={() => router.push('/paywall')}>
              <Sparkles color="#fff" size={16} />
              <Button.Label className="ml-1.5">See plans</Button.Label>
            </Button>
          </Card>
        </Pressable>
      )}

      <Card className="p-1">
        <Row
          label="Daily free credits"
          value={isPro ? 'Unlimited' : `${FREE_DAILY_CREDITS} / day`}
        />
        <Separator />
        <Row label="Saved generations" value={`${historyCount}`} />
        <Separator />
        <Row
          label="Payment mode"
          value={
            keyMode === null
              ? '…'
              : keyMode === 'live'
                ? 'Live'
                : keyMode === 'test'
                  ? 'Test'
                  : 'Not set'
          }
        />
        <Separator />
        <PressableRow
          label="Restore subscription"
          icon={<RefreshCw color={muted} size={18} />}
          loading={restoring || isProcessing}
          onPress={onRestore}
        />
        <Separator />
        {canReview && (
          <>
            <PressableRow
              label="Rate this app"
              icon={<Star color={muted} size={18} />}
              onPress={() => void onRate()}
            />
            <Separator />
          </>
        )}
        <PressableRow
          label="Privacy Policy"
          icon={<ChevronRight color={muted} size={18} />}
          onPress={() => openLegal('privacy')}
        />
        <Separator />
        <PressableRow
          label="Terms of Service"
          icon={<ChevronRight color={muted} size={18} />}
          onPress={() => openLegal('terms')}
        />
      </Card>

      <Text color="muted" align="center" className="text-xs">
        Ideate · AI Business Assistant · v1.0.0
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text>{label}</Text>
      <Text color="muted">{value}</Text>
    </View>
  );
}

function PressableRow({
  label,
  value,
  icon,
  loading,
  onPress,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="flex-row items-center justify-between px-4 py-3.5"
    >
      <Text>{label}</Text>
      <View className="flex-row items-center gap-2">
        {value ? <Text color="muted">{value}</Text> : null}
        {icon}
      </View>
    </Pressable>
  );
}
