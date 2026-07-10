import { Stack } from "expo-router";

export default function FriendsLayout() {
    return (
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: "#F1EFE8"}}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="requests" options={{animation: "none"}} />
            <Stack.Screen name="add-friend" options={{animation: "none"}} />
        </Stack>
    )
}
