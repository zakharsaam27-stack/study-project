import {AuthProvider, useAuth} from "@/contexts/auth.context";
import {SocketProvider} from "@/contexts/socket.context";
import {HideTabBarProvider} from "@/contexts/tabbar.context";
import {Stack} from "expo-router";
import {useColorScheme} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <HideTabBarProvider>
        <AuthProvider>
          <SocketProvider>
            <RootNavigator />
          </SocketProvider>
        </AuthProvider>
      </HideTabBarProvider>
    </GestureHandlerRootView>
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
