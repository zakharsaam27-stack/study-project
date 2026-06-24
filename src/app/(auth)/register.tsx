import {useAuth} from "@/contexts/auth.context";
import {useRouter} from "expo-router";
import {useState} from "react";
import {Button, Text, TextInput, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {register} = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      await register(email, password, nickname, name);
    } catch (err) {
      console.error(err);
      setError("Register failed. Please check all fields");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView>
      <View>
        <TextInput
          placeholder="email"
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>
      <View>
        <TextInput
          placeholder="password"
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      <View>
        <TextInput
          placeholder="nickname"
          onChangeText={setNickname}
          autoCapitalize="none"
        />
      </View>
      <View>
        <TextInput
          placeholder="name"
          onChangeText={setName}
          autoCapitalize="none"
        />
      </View>
      <Button title="Register" onPress={handleRegister} />
      <Button
        title="Already have an account? Login"
        onPress={() => router.push("/login")}
      />
      {error && <Text>{error}</Text>}
    </SafeAreaView>
  );
}
