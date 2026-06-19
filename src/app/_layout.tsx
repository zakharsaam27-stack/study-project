import {AuthProvider, useAuth} from "@/contexts/auth.context";
import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from "expo-router";
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" options={{headerShown: false}} />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" options={{headerShown: false}} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
