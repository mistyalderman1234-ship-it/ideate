import { router } from 'expo-router';
import { Button, Card, Chip, Spinner, Text, useThemeColor } from 'heroui-native';
import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { CategoryIcon } from '@/components/CategoryIcon';
import { generate } from '@/lib/ai';
import { CATEGORIES, FREE_DAILY_CREDITS } from '@/lib/catalog';
import { useGenerationsStore } from '@/lib/generationsStore';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import type { Category } from '@/lib/types';

export default function GenerateScreen() {
  const [accent, muted, foreground, fieldBg, border] = useThemeColor([
    'accent',
    'muted',
    'foreground',
    'surface',
    'border',
  ]);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const addGeneration = useGenerationsStore((s) => s.addGeneration);
  const consumeCredit = useGenerationsStore((s) => s.consumeCredit);
  const creditsUsed = useGenerationsStore((s) => s.creditsUsed);
  const creditsDate = useGenerationsStore((s) => s.creditsDate);

  const remaining = (() => {
    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    if (creditsDate !== today) return FREE_DAILY_CREDITS;
    return Math.max(0, FREE_DAILY_CREDITS - creditsUsed);
  })();

  const [selected, setSelected] = useState<Category>(CATEGORIES[0]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const outOfCredits = !isPro && remaining <= 0;

  function onSelectCategory(category: Category) {
    if (category.pro && !isPro) {
      router.push('/paywall');
      return;
    }
    setSelected(category);
  }

  async function onGenerate() {
    if (!prompt.trim() || loading) return;
    if (selected.pro && !isPro) {
      router.push('/paywall');
      return;
    }
    if (outOfCredits) {
      router.push('/paywall');
      return;
    }

    setLoading(true);
    try {
      const output = await generate(selected.id, prompt.trim());
      if (!isPro) consumeCredit();
      const generation = addGeneration({
        categoryId: selected.id,
        categoryTitle: selected.title,
        prompt: prompt.trim(),
        output,
      });
      setPrompt('');
      router.push({ pathname: '/result/[id]', params: { id: generation.id } });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      Alert.alert('Generation failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-10 gap-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text.Heading type="h2">What do you need today?</Text.Heading>
          <Text.Paragraph color="muted">
            Pick a category, describe your business, and let AI draft it.
          </Text.Paragraph>
        </View>

        {!isPro && (
          <Card variant="secondary" className="flex-row items-center justify-between p-4">
            <View className="flex-1 pr-3">
              <Text className="font-semibold">
                {remaining} of {FREE_DAILY_CREDITS} free credits left today
              </Text>
              <Text color="muted" className="text-sm">
                Upgrade to Pro for unlimited generations.
              </Text>
            </View>
            <Button size="sm" variant="primary" onPress={() => router.push('/paywall')}>
              Go Pro
            </Button>
          </Card>
        )}

        <View className="gap-3">
          <Text className="font-semibold">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = category.id === selected.id;
              const locked = category.pro && !isPro;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => onSelectCategory(category)}
                  style={{
                    backgroundColor: active ? accent : fieldBg,
                    borderColor: active ? accent : border,
                  }}
                  className="flex-row items-center gap-2 rounded-2xl border px-3.5 py-2.5"
                >
                  <CategoryIcon name={category.icon} color={active ? '#fff' : accent} size={18} />
                  <Text
                    style={{ color: active ? '#fff' : foreground }}
                    className="text-sm font-medium"
                  >
                    {category.title}
                  </Text>
                  {locked && <Lock color={active ? '#fff' : muted} size={13} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold">{selected.title}</Text>
            {selected.pro && (
              <Chip size="sm" color="warning">
                <Chip.Label>PRO</Chip.Label>
              </Chip>
            )}
          </View>
          <Text color="muted" className="text-sm">
            {selected.description}
          </Text>
          <View
            style={{ backgroundColor: fieldBg, borderColor: border }}
            className="rounded-2xl border p-3"
          >
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder={selected.placeholder}
              placeholderTextColor={muted}
              multiline
              style={{ color: foreground, minHeight: 96, fontFamily: 'Inter_400Regular' }}
              className="text-base"
              textAlignVertical="top"
            />
          </View>
        </View>

        <Button
          variant="primary"
          size="lg"
          isDisabled={!prompt.trim() || loading}
          onPress={onGenerate}
        >
          {loading ? (
            <Spinner color="#fff" />
          ) : outOfCredits ? (
            'Unlock unlimited — Go Pro'
          ) : (
            'Generate'
          )}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
