import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { ConnectivityBanner } from "@/components/connectivity-banner";
import { EmptyState } from "@/components/empty-state";
import { LoadingView } from "@/components/loading-view";
import { Screen } from "@/components/screen";
import { useAsyncData } from "@/hooks/use-async-data";
import { services } from "@/services/container";
import { colors, spacing } from "@/theme/theme";

export default function HomeScreen() {
  const loadTeacher = useCallback(() => services.schoolDataSource.getCurrentTeacher(), []);
  const loadNextClass = useCallback(() => services.schoolDataSource.getNextClass(), []);
  const loadSchedule = useCallback(() => services.schoolDataSource.getTodaySchedule(), []);
  const loadAttendance = useCallback(() => services.schoolDataSource.getAttendanceSummary(), []);

  const teacher = useAsyncData(loadTeacher, null);
  const nextClass = useAsyncData(loadNextClass, null);
  const schedule = useAsyncData(loadSchedule, []);
  const attendance = useAsyncData(loadAttendance, null);
  const isLoading = teacher.isLoading || nextClass.isLoading || schedule.isLoading || attendance.isLoading;

  if (isLoading) return <Screen scrollable={false}><LoadingView message="Preparing your workspace..." /></Screen>;

  const dateLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date());

  return (
    <Screen>
      <View style={styles.header}>
        <View><Text style={styles.muted}>{dateLabel}</Text><Text style={styles.heading}>{teacher.data ? `Welcome, ${teacher.data.firstName}` : "Welcome"}</Text></View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{teacher.data?.initials || "T"}</Text></View>
      </View>

      <ConnectivityBanner isOnline />

      {nextClass.data ? (
        <View style={styles.card}>
          <Text style={styles.muted}>Next class</Text>
          <Text style={styles.cardTitle}>{nextClass.data.name}</Text>
          <AppButton label="Take register" onPress={() => router.push(`/register/${nextClass.data!.classId}`)} variant="primary" />
        </View>
      ) : (
        <EmptyState title="No upcoming class" message="Your next class will appear here when a timetable is available." />
      )}

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Today’s schedule</Text><AppButton label="Full timetable" onPress={() => router.push("/timetable")} /></View>
      {schedule.data.length === 0 && <EmptyState title="Nothing scheduled" message="Classes for today will appear here after data is loaded." />}

      <Text style={styles.sectionTitle}>Attendance today</Text>
      {!attendance.data && <EmptyState title="No attendance data" message="Totals will appear after registers have been recorded." />}

      <View style={styles.actions}>
        <AppButton label="Classes" onPress={() => router.push("/classes")} />
        <AppButton label="Timetable" onPress={() => router.push("/timetable")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  heading: { color: colors.text, fontSize: 28, fontWeight: "700" },
  muted: { color: colors.mutedText, fontSize: 14 },
  avatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.softPrimary },
  avatarText: { color: colors.primary, fontWeight: "700" },
  card: { gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  actions: { gap: spacing.sm },
});
