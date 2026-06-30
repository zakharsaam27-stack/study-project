import {AuthProvider, useAuth} from "@/contexts/auth.context";
import {Stack} from "expo-router";
import {useColorScheme} from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const {user, isLoading} = useAuth();
  const colorScheme = useColorScheme();

  if (isLoading) {
    return null;
  }

  return (
      <Stack>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" options={{headerShown: false}} />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" options={{headerShown: false}} />
        </Stack.Protected>
      </Stack>
  );
}
