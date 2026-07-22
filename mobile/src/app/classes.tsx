import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AppButton } from "@/components/app-button";
import { EmptyState } from "@/components/empty-state";
import { LoadingView } from "@/components/loading-view";
import { Screen } from "@/components/screen";
import { useAsyncData } from "@/hooks/use-async-data";
import { services } from "@/services/container";
import { colors, radius, spacing } from "@/theme/theme";

export default function ClassesScreen() {
  const loader = useCallback(() => services.schoolDataSource.getClasses(), []);
  const { data: classes, isLoading } = useAsyncData(loader, []);

  if (isLoading) return <Screen scrollable={false}><LoadingView message="Loading classes..." /></Screen>;

  return (
    <Screen>
      <AppButton label="Back" onPress={() => router.back()} />
      <Text style={styles.heading}>Classes</Text>
      {classes.length === 0 ? (
        <EmptyState title="No classes" message="Assigned classes will appear here after data is loaded." />
      ) : classes.map((schoolClass) => (
        <Pressable key={schoolClass.id} onPress={() => router.push(`/register/${schoolClass.id}`)} style={styles.classCard}>
          <Text style={styles.className}>{schoolClass.name}</Text>
          {!!schoolClass.details && <Text style={styles.details}>{schoolClass.details}</Text>}
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 28, fontWeight: "700" },
  classCard: { gap: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  className: { color: colors.text, fontSize: 17, fontWeight: "600" },
  details: { color: colors.mutedText, fontSize: 14 },
});
