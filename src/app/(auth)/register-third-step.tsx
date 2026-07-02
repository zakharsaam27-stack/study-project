import { useAuth } from "@/contexts/auth.context";
import { useReg } from "@/contexts/reg.context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThirdStepScreen() {
  const [isContinuing, setIsContinuing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState("");
  const { email, password, name, nickname } = useReg();
  const { register } = useAuth();

  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const handleRegister = async (setLoading: (v: boolean) => void) => {
    setLoading(true);
    setError("");
    try {
      await register(email, password, nickname, name);
    } catch (err) {
      setError("Что то пошло не так");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.progressRow}>
          <Text style={styles.stepLabel}>Шаг 3 из 3</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
        </View>

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Добавь фото</Text>
          <Text style={styles.subtitle}>Так друзьям проще тебя узнать.</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials || "?"}</Text>
          </View>
          <View style={styles.avatarCameraBtn}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.pickerBtns}>
          <Pressable style={styles.btnOutlineCoral}>
            <Text style={styles.btnOutlineCoralText}>Выбрать из галереи</Text>
          </Pressable>
          <Pressable style={styles.btnOutlineGray}>
            <Text style={styles.btnOutlineGrayText}>Сделать фото</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.spacer} />

        <View style={styles.bottomBtns}>
          <Pressable
            style={[styles.btnCoral, isContinuing && styles.btnDisabled]}
            disabled={isContinuing || isSkipping}
            onPress={() => handleRegister(setIsContinuing)}
          >
            <Text style={styles.btnCoralText}>Продолжить</Text>
          </Pressable>
          <Pressable
            disabled={isContinuing || isSkipping}
            onPress={() => handleRegister(setIsSkipping)}
          >
            <Text style={styles.skipText}>Пропустить</Text>
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
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888780",
    flexShrink: 0,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0DDD2",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#D85A30",
    borderRadius: 3,
  },
  titleGroup: {
    marginTop: 30,
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#2C2C2A",
  },
  subtitle: {
    fontSize: 15,
    color: "#888780",
  },
  avatarWrapper: {
    marginTop: 36,
    alignItems: "center",
    alignSelf: "center",
    position: "relative",
    width: 124,
    height: 124,
  },
  avatarCircle: {
    width: 124,
    height: 124,
    borderRadius: 999,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 42,
    fontWeight: "600",
    color: "#712B13",
  },
  avatarCameraBtn: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#D85A30",
    borderWidth: 3,
    borderColor: "#F1EFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerBtns: {
    marginTop: 36,
    gap: 10,
  },
  btnOutlineCoral: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineCoralText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D85A30",
  },
  btnOutlineGray: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineGrayText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  errorText: {
    fontSize: 13,
    color: "#D85A30",
    textAlign: "center",
    marginTop: 8,
  },
  spacer: {
    flex: 1,
  },
  bottomBtns: {
    gap: 10,
  },
  btnCoral: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
  },
  btnCoralText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888780",
    textAlign: "center",
    paddingVertical: 6,
  },
});
