import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddFriendScreen() {
    return (
        <SafeAreaView>
            <View>
                <Text>
                    Добавить друга
                </Text>
            </View>
            <View>
                <TextInput placeholder="@Nickname" on/>
            </View>
        </SafeAreaView>
    )
}