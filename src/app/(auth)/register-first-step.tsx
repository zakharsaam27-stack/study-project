import {useReg} from "@/contexts/reg.context";
import {useRouter} from "expo-router";
import {useState} from "react";
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function FirstStepScreen() {
  const {setName, name} = useReg();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const emptyNameCheck = () => {
    if (name.trim() === "") {
      setError("Заполните все поля");
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.progressRow}>
          <Text style={styles.stepLabel}>Шаг 1 из 3</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: "33%"}]} />
          </View>
        </View>

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Выбери имя</Text>
          <Text style={styles.subtitle}>Оно будет отображаться друзьям.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <View style={[styles.inputRing, isFocused && styles.inputRingFocused]}>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              placeholder="Имя пользователя"
              placeholderTextColor="#A8A79F"
              onChangeText={text => {
                setName(text);
                setError("");
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.hint}>Можно изменить позже в профиле</Text>
          )}
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={styles.btn}
          onPress={() => {
            if (emptyNameCheck()) router.push("/(auth)/register-second-step");
          }}>
          <Text style={styles.btnText}>Продолжить</Text>
        </Pressable>
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
  fieldGroup: {
    marginTop: 28,
    gap: 10,
  },
  inputRing: {
    borderRadius: 12,
    padding: 3,
  },
  inputRingFocused: {
    backgroundColor: "#FAECE7",
  },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 17,
    color: "#2C2C2A",
  },
  inputFocused: {
    borderColor: "#D85A30",
  },
  hint: {
    fontSize: 12,
    color: "#888780",
    paddingLeft: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#D85A30",
    paddingLeft: 2,
  },
  spacer: {
    flex: 1,
  },
  btn: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
