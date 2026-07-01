import {RegProvider} from "@/contexts/reg.context";
import {Stack} from "expo-router";

export default function AuthLayout() {
  return (
    <RegProvider>
      <Stack screenOptions={{headerShown: false}} />
    </RegProvider>
  );
}
