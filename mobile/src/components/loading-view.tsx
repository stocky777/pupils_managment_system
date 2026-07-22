import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme/theme";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Loading..." }: LoadingViewProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  message: { color: colors.mutedText, fontSize: 15 },
});
