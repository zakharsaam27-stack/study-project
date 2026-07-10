import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: "#F1EFE8"}}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="edit-profile" options={{animation: "none"}} />
        </Stack>
    )
}
