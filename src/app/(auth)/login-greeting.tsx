import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function LoginGreetingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.appIcon}>
          <View style={styles.appIconCircle} />
          <View style={styles.appIconDot} />
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.appName}>PingMe</Text>
          <Text style={styles.tagline}>С возвращением</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          style={({pressed}) => [
            styles.btn,
            styles.btnCoral,
            pressed && {opacity: 0.7},
          ]}
          onPress={() => router.push("/(auth)/login")}>
          <Ionicons name="mail" size={19} color="#fff" />
          <Text style={[styles.btnText, styles.btnTextLight]}>
            Войти через Email
          </Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.btn,
            styles.btnBlack,
            pressed && {opacity: 0.7},
          ]}>
          <Ionicons name="logo-apple" size={18} color="#fff" />
          <Text style={[styles.btnText, styles.btnTextLight]}>
            Войти через Apple
          </Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.btn,
            styles.btnWhite,
            pressed && {opacity: 0.7},
          ]}>
          <Ionicons name="logo-google" size={18} color="#2C2C2A" />
          <Text style={[styles.btnText, styles.btnTextDark]}>
            Войти через Google
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Нет аккаунта? </Text>
          <Pressable
            onPress={() => router.replace("/(auth)/register-greeting")}
            style={({pressed}) => pressed && {opacity: 0.7}}>
            <Text style={styles.footerLink}>Создать</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
    paddingHorizontal: 28,
    paddingBottom: 26,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  appIcon: {
    width: 94,
    height: 94,
    borderRadius: 27,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D85A30",
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  appIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  appIconDot: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1D9E75",
    borderWidth: 4,
    borderColor: "#D85A30",
    right: 22,
    bottom: 22,
  },
  titleGroup: {
    alignItems: "center",
    gap: 12,
  },
  appName: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: "#2C2C2A",
  },
  tagline: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: "#2C2C2A",
    textAlign: "center",
    lineHeight: 28,
    minHeight: 56,
    textAlignVertical: "center",
  },
  bottom: {
    gap: 10,
  },
  btn: {
    height: 50,
    borderRadius: 12,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#888780",
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D85A30",
  },
});
