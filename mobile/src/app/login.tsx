import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/app-button";
import { Screen } from "@/components/screen";
import { colors, radius, spacing } from "@/theme/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canContinue = email.trim().length > 0 && password.length > 0;

  function handleSignIn() {
    // TODO: Replace preview navigation with AuthenticationService.signIn().
    router.replace("/home");
  }

  return (
    <Screen scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}>
        <View style={styles.brand} accessibilityLabel="Pupils teacher workspace">
          <View style={styles.brandMark}><Text style={styles.brandLetter}>P</Text></View>
          <View><Text style={styles.brandName}>Pupils</Text><Text style={styles.muted}>Teacher workspace</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.description}>Sign in to view your classes and registers.</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="current-password"
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
              />
              <AppButton
                label={showPassword ? "Hide password" : "Show password"}
                onPress={() => setShowPassword((current) => !current)}
              />
            </View>

            <AppButton disabled={!canContinue} label="Sign in" onPress={handleSignIn} variant="primary" />
          </View>
        </View>

        <Text style={styles.notice}>Authentication is not connected yet. No credentials are embedded.</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, justifyContent: "center", gap: spacing.md },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  brandMark: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colors.primary },
  brandLetter: { color: colors.primaryText, fontSize: 20, fontWeight: "700" },
  brandName: { color: colors.text, fontSize: 20, fontWeight: "700" },
  muted: { color: colors.mutedText },
  card: { gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  heading: { color: colors.text, fontSize: 28, fontWeight: "700" },
  description: { color: colors.mutedText, fontSize: 15, lineHeight: 22 },
  form: { gap: spacing.md },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 15, fontWeight: "600" },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.text, fontSize: 16 },
  notice: { color: colors.mutedText, fontSize: 13, textAlign: "center" },
});
