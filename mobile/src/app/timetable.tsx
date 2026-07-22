import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { EmptyState } from "@/components/empty-state";
import { LoadingView } from "@/components/loading-view";
import { Screen } from "@/components/screen";
import { useAsyncData } from "@/hooks/use-async-data";
import { services } from "@/services/container";
import { colors, radius, spacing } from "@/theme/theme";

export default function TimetableScreen() {
  const loader = useCallback(() => services.schoolDataSource.getWeeklySchedule(), []);
  const { data: schedule, isLoading } = useAsyncData(loader, []);

  if (isLoading) return <Screen scrollable={false}><LoadingView message="Loading timetable..." /></Screen>;

  return (
    <Screen>
      <AppButton label="Back" onPress={() => router.back()} />
      <Text style={styles.heading}>Weekly timetable</Text>
      {schedule.length === 0 ? (
        <EmptyState title="No timetable" message="Scheduled sessions will appear here after data is loaded." />
      ) : schedule.map((session) => (
        <View key={session.id} style={styles.session}>
          <Text style={styles.time}>{session.startTime}</Text>
          <View style={styles.sessionText}><Text style={styles.name}>{session.name}</Text><Text style={styles.details}>{session.room || ""}</Text></View>
          <AppButton label="Register" onPress={() => router.push(`/register/${session.classId}`)} />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 28, fontWeight: "700" },
  session: { gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  sessionText: { gap: spacing.xs },
  time: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  name: { color: colors.text, fontSize: 17, fontWeight: "600" },
  details: { color: colors.mutedText, fontSize: 14 },
});
