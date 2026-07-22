import {Stack} from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{animation: "none", headerShown: false}}
      />
    </Stack>
  );
}
