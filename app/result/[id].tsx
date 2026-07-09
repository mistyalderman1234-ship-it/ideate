import * as Clipboard from 'expo-clipboard';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text, useThemeColor } from 'heroui-native';
import { Check, Copy, Star } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useGenerationsStore } from '@/lib/generationsStore';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gold] = useThemeColor(['warning']);
  const generation = useGenerationsStore((s) => s.history.find((g) => g.id === id));
  const toggleFavorite = useGenerationsStore((s) => s.toggleFavorite);
  const [copied, setCopied] = useState(false);

  if (!generation) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-8">
        <Text.Heading type="h3" className="mb-2">
          Not found
        </Text.Heading>
        <Text color="muted" align="center" className="mb-4">
          This generation is no longer available.
        </Text>
        <Button variant="primary" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  async function onCopy() {
    if (!generation) return;
    await Clipboard.setStringAsync(generation.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-brand text-xs font-semibold uppercase">
            {generation.categoryTitle}
          </Text>
          <Text color="muted" className="text-xs">
            {format(generation.createdAt, 'MMM d, h:mm a')}
          </Text>
        </View>

        <Card variant="secondary" className="gap-1 p-4">
          <Text color="muted" className="text-xs font-medium uppercase">
            Your prompt
          </Text>
          <Text>{generation.prompt}</Text>
        </Card>

        <Card className="p-4">
          <Text style={{ lineHeight: 22 }}>{generation.output}</Text>
        </Card>
      </ScrollView>

      <View className="border-border pb-safe-offset-4 flex-row gap-3 border-t p-4">
        <Button
          variant="secondary"
          className="flex-1"
          onPress={() => toggleFavorite(generation.id)}
        >
          <Star color={gold} fill={generation.favorite ? gold : 'transparent'} size={18} />
          <Button.Label className="ml-1.5">{generation.favorite ? 'Saved' : 'Save'}</Button.Label>
        </Button>
        <Button variant="primary" className="flex-1" onPress={onCopy}>
          {copied ? <Check color="#fff" size={18} /> : <Copy color="#fff" size={18} />}
          <Button.Label className="ml-1.5">{copied ? 'Copied' : 'Copy'}</Button.Label>
        </Button>
      </View>
    </View>
  );
}
