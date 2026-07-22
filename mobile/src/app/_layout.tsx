import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="classes" />
        <Stack.Screen name="timetable" />
        <Stack.Screen name="register/[classId]" />
      </Stack>
    </SafeAreaProvider>
  );
}
