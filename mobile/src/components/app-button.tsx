import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "@/theme/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  icon?: ReactNode;
}

export function AppButton({ label, onPress, variant = "secondary", disabled = false, icon }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon}
      <Text style={variant === "primary" ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  primaryLabel: { color: colors.primaryText, fontSize: 16, fontWeight: "600" },
  secondaryLabel: { color: colors.text, fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.45 },
});
