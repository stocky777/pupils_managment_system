import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/theme/theme";

interface ConnectivityBannerProps {
  isOnline: boolean;
}

export function ConnectivityBanner({ isOnline }: ConnectivityBannerProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={[styles.dot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
      <Text style={styles.label}>{isOnline ? "Online" : "Offline"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  dot: { width: 9, height: 9, borderRadius: radius.pill },
  label: { color: colors.text, fontSize: 15, fontWeight: "600" },
});
