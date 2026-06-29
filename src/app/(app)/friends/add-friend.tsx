import {useAuth} from "@/contexts/auth.context";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";
import {useEffect, useState} from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {ID, Query, Role} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function AddFriendScreen() {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    setError("");
    setRequestSent(false);
  }, []);

  if (!user) {
    return null;
  }

  const handleSendRequest = async (searchText: string) => {
    try {
      const searchResult = await tablesDB.listRows({
        databaseId: database_id,
        tableId: profiles_table_id,
        queries: [Query.equal("nickname", searchText)],
      });

      if (searchResult.rows[0].$id === user.$id) {
        setError("Вы не можете добавить себя в друзья");
        return;
      }
      
      const checkReq = await tablesDB.listRows({
        databaseId: database_id,
        tableId: friendship_table_id,
        queries: [
          Query.equal('requesterId', user.$id),
          Query.equal('addresseeId', searchResult.rows[0].$id)
        ]
      });
      
      if (checkReq.total > 0) {
        setError("Заявка уже отправлена")
        setRequestSent(false)
        return
      }

      tablesDB.createRow({
        databaseId: database_id,
        tableId: friendship_table_id,
        rowId: ID.unique(),
        data: {
          requesterId: user.$id,
          addresseeId: searchResult.rows[0].$id,
          status: "pending",
        },
      });
      setRequestSent(true);
      setError("");
    } catch {
      setError("Пользователь не найден");
      setRequestSent(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Добавить друга</Text>
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.at}>@</Text>
        <TextInput
          style={styles.input}
          placeholder="nickname"
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.section}>
        <Button
          title="Отправить заявку"
          onPress={() => handleSendRequest(searchText.trim())}
        />
        {requestSent && <Text style={styles.success}>Заявка отправлена!</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ИЛИ ПОДЕЛИСЬ ССЫЛКОЙ</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.section}>
        <Button title="Скопировать ссылку (Coming soon)" />
        <Button title="Поделиться ссылкой (Coming soon)" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f5f5f5"},
  header: {padding: 16, paddingBottom: 12},
  title: {fontSize: 22, fontWeight: "700"},
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  at: {fontSize: 15, color: "#999", marginRight: 4},
  input: {flex: 1, fontSize: 15},
  section: {marginHorizontal: 16, marginTop: 14, gap: 10},
  success: {fontSize: 14, color: "#2a7a2a", marginTop: 6},
  error: {fontSize: 14, color: "#c0392b", marginTop: 6},
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    gap: 10,
  },
  dividerLine: {flex: 1, height: 1, backgroundColor: "#ddd"},
  dividerText: {fontSize: 12, color: "#999"},
});
