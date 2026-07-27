import { Stack } from "expo-router";

export default function FriendProfileLayout() {
    return (
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: "#F1EFE8"}}}>
            <Stack.Screen name="[id]" />
        </Stack>
    )
}
