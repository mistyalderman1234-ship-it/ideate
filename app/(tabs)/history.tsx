import { format } from 'date-fns';
import { router } from 'expo-router';
import { Button, Card, Text, useThemeColor } from 'heroui-native';
import { FileText, Sparkles, Trash2 } from 'lucide-react-native';
import { FlatList, Pressable, View } from 'react-native';

import { useGenerationsStore } from '@/lib/generationsStore';
import type { Generation } from '@/lib/types';

export default function HistoryScreen() {
  const [muted, danger] = useThemeColor(['muted', 'danger']);
  const history = useGenerationsStore((s) => s.history);
  const removeGeneration = useGenerationsStore((s) => s.removeGeneration);
  const clearHistory = useGenerationsStore((s) => s.clearHistory);

  if (history.length === 0) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-8">
        <View className="bg-brand-soft mb-4 h-16 w-16 items-center justify-center rounded-full">
          <FileText color={muted} size={28} />
        </View>
        <Text.Heading type="h3" align="center" className="mb-1">
          No generations yet
        </Text.Heading>
        <Text.Paragraph align="center" color="muted" className="mb-5">
          Your AI-generated business content will show up here.
        </Text.Paragraph>
        <Button variant="primary" onPress={() => router.push('/')}>
          <Sparkles color="#fff" size={16} />
          <Button.Label className="ml-1.5">Start generating</Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-3"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-1 flex-row items-center justify-between">
            <Text color="muted" className="text-sm">
              {history.length} {history.length === 1 ? 'generation' : 'generations'}
            </Text>
            <Pressable onPress={clearHistory} hitSlop={8}>
              <Text style={{ color: danger }} className="text-sm font-medium">
                Clear all
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryRow item={item} onDelete={() => removeGeneration(item.id)} dangerColor={danger} />
        )}
      />
    </View>
  );
}

function HistoryRow({
  item,
  onDelete,
  dangerColor,
}: {
  item: Generation;
  onDelete: () => void;
  dangerColor: string;
}) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/result/[id]', params: { id: item.id } })}>
      <Card className="p-4">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-brand text-xs font-semibold uppercase">{item.categoryTitle}</Text>
          <Text color="muted" className="text-xs">
            {format(item.createdAt, 'MMM d, h:mm a')}
          </Text>
        </View>
        <Text className="mb-1 font-semibold" numberOfLines={1}>
          {item.prompt}
        </Text>
        <Text color="muted" className="text-sm" numberOfLines={2}>
          {item.output}
        </Text>
        <View className="mt-3 flex-row justify-end">
          <Pressable onPress={onDelete} hitSlop={8} className="flex-row items-center gap-1">
            <Trash2 color={dangerColor} size={15} />
            <Text style={{ color: dangerColor }} className="text-sm">
              Delete
            </Text>
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}
