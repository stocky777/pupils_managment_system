import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text } from "react-native";

import { AppButton } from "@/components/app-button";
import { EmptyState } from "@/components/empty-state";
import { LoadingView } from "@/components/loading-view";
import { Screen } from "@/components/screen";
import { useAsyncData } from "@/hooks/use-async-data";
import { services } from "@/services/container";
import { colors } from "@/theme/theme";

export default function RegisterScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const loader = useCallback(
    () => classId ? services.schoolDataSource.getClassRegister(classId) : Promise.resolve(null),
    [classId],
  );
  const { data: register, isLoading } = useAsyncData(loader, null);

  if (isLoading) return <Screen scrollable={false}><LoadingView message="Loading register..." /></Screen>;

  return (
    <Screen>
      <AppButton label="Back" onPress={() => router.back()} />
      <Text style={styles.heading}>{register?.className || "Class register"}</Text>
      {!register || register.pupils.length === 0 ? (
        <EmptyState title="No register available" message="Pupils will appear here after a class register is loaded." />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 28, fontWeight: "700" },
});
