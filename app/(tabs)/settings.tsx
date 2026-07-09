import { format } from 'date-fns';
import { router } from 'expo-router';
import { Button, Card, Separator, Text, useThemeColor } from 'heroui-native';
import { Check, Crown, RefreshCw, Sparkles, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';

import { FREE_DAILY_CREDITS, PRO_FEATURES } from '@/lib/catalog';
import { useGenerationsStore } from '@/lib/generationsStore';
import { useSubscriptionStore } from '@/lib/subscriptionStore';

export default function SettingsScreen() {
  const [accent, muted, gold] = useThemeColor(['accent', 'muted', 'foreground']);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const activePlan = useSubscriptionStore((s) => s.activePlan);
  const purchasedAt = useSubscriptionStore((s) => s.purchasedAt);
  const restore = useSubscriptionStore((s) => s.restore);
  const cancel = useSubscriptionStore((s) => s.cancel);
  const isProcessing = useSubscriptionStore((s) => s.isProcessing);
  const historyCount = useGenerationsStore((s) => s.history.length);

  const [restoring, setRestoring] = useState(false);

  async function onRestore() {
    setRestoring(true);
    const ok = await restore();
    setRestoring(false);
    Alert.alert(
      ok ? 'Purchases restored' : 'Nothing to restore',
      ok ? 'Your Pro subscription is active.' : 'We could not find an active subscription.',
    );
  }

  function onCancel() {
    Alert.alert('Cancel subscription', 'This will remove Pro access in this demo.', [
      { text: 'Keep Pro', style: 'cancel' },
      { text: 'Cancel Pro', style: 'destructive', onPress: cancel },
    ]);
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
        <PressableRow
          label="Restore purchases"
          icon={<RefreshCw color={muted} size={18} />}
          loading={restoring || isProcessing}
          onPress={onRestore}
        />
        <Separator />
        <PressableRow
          label="Rate this app"
          icon={<Star color={muted} size={18} />}
          onPress={() => Alert.alert('Thanks!', 'This would open the App Store rating prompt.')}
        />
        <Separator />
        <PressableRow
          label="Privacy Policy"
          onPress={() => void Linking.openURL('https://example.com/privacy')}
        />
      </Card>

      <Text color="muted" align="center" className="text-xs">
        AI Business Assistant · v1.0.0
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
