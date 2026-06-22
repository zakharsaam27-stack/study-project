import { Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth.context";

export default function HomeScreen() {
  const { logOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <Button title="Logout" onPress={logOut} />
      </View>
    </SafeAreaView>
  );
}