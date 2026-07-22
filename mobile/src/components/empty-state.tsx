import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/theme/theme";

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: "600" },
  message: { color: colors.mutedText, fontSize: 15, lineHeight: 22 },
});
