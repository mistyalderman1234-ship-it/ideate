import { Stack, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { isLegalDoc, LEGAL_DOCS } from '@/lib/legal';
import { goBackOrReplace } from '@/lib/navigation';

export default function LegalScreen() {
  const params = useLocalSearchParams<{ doc?: string }>();
  const doc = isLegalDoc(params.doc) ? LEGAL_DOCS[params.doc] : null;

  if (!doc) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
        <Text.Heading type="h3">Document not found</Text.Heading>
        <Button variant="secondary" onPress={() => goBackOrReplace('/settings')}>
          Back to Settings
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: doc.title }} />
      <ScrollView
        className="bg-background flex-1"
        contentContainerClassName="p-5 pb-12 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text.Heading type="h2">{doc.title}</Text.Heading>
          <Text color="muted" className="text-sm leading-5">
            {doc.intro}
          </Text>
        </View>

        {doc.sections.map((section) => (
          <View key={section.heading} className="gap-2">
            <Text className="text-base font-semibold">{section.heading}</Text>
            {section.body.map((paragraph) => (
              <Text key={paragraph} color="muted" className="text-sm leading-5">
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <Button variant="secondary" onPress={() => goBackOrReplace('/settings')}>
          Done
        </Button>
      </ScrollView>
    </>
  );
}
