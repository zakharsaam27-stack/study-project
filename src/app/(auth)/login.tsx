import {useAuth} from "@/contexts/auth.context";
import {useRouter} from "expo-router";
import {useState} from "react";
import {Button, Text, TextInput, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {login} = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your email and password");
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
          secureTextEntry
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>
      <Button title="login" onPress={() => handleLogin(email, password)} />
      <Button
        title="Don't have an account? Register"
        onPress={() => router.push("/register")}
      />
      {error && <Text>{error}</Text>}
    </SafeAreaView>
  );
}
