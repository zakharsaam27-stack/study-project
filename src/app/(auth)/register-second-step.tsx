import {useReg} from "@/contexts/reg.context";
import {useRouter} from "expo-router";
import {useState} from "react";
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function SecondStepScreen() {
  const {nickname, setNickname} = useReg();
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const spaceCheck = (text: string) => {
    if (text.includes(" ")) {
      setError("Никнейм не должен содержать пробелы");
    } else {
      setError("");
    }
  };

  const emptyNameCheck = () => {
    if (nickname.trim() === "") {
      setError("Заполните все поля");
      return false;
    }
    if (nickname.includes(" ")) {
      setError("Никнейм не должен содержать пробелы");
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.progressRow}>
          <Text style={styles.stepLabel}>Шаг 2 из 3</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: "66%"}]} />
          </View>
        </View>

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Выбери никнейм</Text>
          <Text style={styles.subtitle}>Друзья найдут тебя по нему.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <View style={[styles.inputRing, isFocused && styles.inputRingFocused]}>
            <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={styles.nickInput}
                placeholder="nickname"
                placeholderTextColor="#A8A79F"
                autoCapitalize="none"
                onChangeText={(text) => {
                  spaceCheck(text);
                  setNickname(text);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.hint}>Только буквы, цифры и нижнее подчёркивание</Text>
          )}
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={({pressed}) => [styles.btn, pressed && {opacity: 0.7}]}
          onPress={() => {
            if (emptyNameCheck()) router.push("/(auth)/register-third-step");
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
  inputRow: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    gap: 2,
  },
  inputRowFocused: {
    borderColor: "#D85A30",
  },
  atSign: {
    fontSize: 17,
    color: "#888780",
  },
  nickInput: {
    flex: 1,
    fontSize: 17,
    color: "#2C2C2A",
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
