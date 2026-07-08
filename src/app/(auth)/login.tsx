import {useAuth} from "@/contexts/auth.context";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useState} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {login} = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({pressed}) => [styles.backBtn, pressed && {opacity: 0.7}]}>
              <Ionicons name="chevron-back" size={26} color="#2C2C2A" />
            </Pressable>
            <Text style={styles.title}>Вход</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#B8B6AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ПАРОЛЬ</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="password"
                  placeholderTextColor="#B8B6AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={({pressed}) => [styles.eyeBtn, pressed && {opacity: 0.7}]}>
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#888780"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({pressed}) => [styles.forgotRow, pressed && {opacity: 0.7}]}>
              <Text style={styles.forgotText}>Забыли пароль?</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={({pressed}) => [
                styles.btn,
                styles.btnCoral,
                isSubmitting && styles.btnDisabled,
                pressed && {opacity: 0.7},
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}>
              <Text style={[styles.btnText, styles.btnTextLight]}>Войти</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({pressed}) => [
                styles.btn,
                styles.btnBlack,
                pressed && {opacity: 0.7},
              ]}>
              <Ionicons name="logo-apple" size={18} color="#fff" />
              <Text style={[styles.btnText, styles.btnTextLight]}>Apple</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.btn,
                styles.btnWhite,
                pressed && {opacity: 0.7},
              ]}>
              <Ionicons name="logo-google" size={18} color="#2C2C2A" />
              <Text style={[styles.btnText, styles.btnTextDark]}>Google</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    paddingBottom: 18,
  },
  backBtn: {
    padding: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: "#2C2C2A",
  },
  form: {
    paddingHorizontal: 24,
    gap: 18,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    color: "#888780",
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#2C2C2A",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2A",
  },
  eyeBtn: {
    padding: 4,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#D85A30",
  },
  error: {
    fontSize: 13,
    color: "#D85A30",
    textAlign: "center",
  },
  btn: {
    height: 50,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  btnCoral: {
    backgroundColor: "#D85A30",
  },
  btnBlack: {
    backgroundColor: "#111",
  },
  btnWhite: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D1C7",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  btnTextLight: {
    color: "#FFFFFF",
  },
  btnTextDark: {
    color: "#2C2C2A",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D3D1C7",
  },
  dividerText: {
    fontSize: 13,
    color: "#888780",
  },
});
