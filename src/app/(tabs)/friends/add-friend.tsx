import {useAuth} from "@/contexts/auth.context";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useEffect, useState} from "react";
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {ID, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function AddFriendScreen() {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const {user} = useAuth();
  const router = useRouter();

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
          Query.equal("requesterId", user.$id),
          Query.equal("addresseeId", searchResult.rows[0].$id),
        ],
      });

      if (checkReq.total > 0) {
        setError("Заявка уже отправлена");
        setRequestSent(false);
        return;
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
        <Pressable
          onPress={() => router.back()}
          style={({pressed}) => [styles.backBtn, pressed && {opacity: 0.7}]}
        >
          <Ionicons name="chevron-back" size={26} color="#2C2C2A" />
        </Pressable>
        <Text style={styles.title}>Добавить друга</Text>
      </View>
      <Text style={styles.label}>Никнейм друга</Text>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#888780" style={styles.searchIcon} />
        <Text style={styles.at}>@</Text>
        <TextInput
          style={styles.input}
          placeholder="nickname"
          placeholderTextColor="#B8B6AF"
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.section}>
        <Pressable
          style={({pressed}) => [styles.sendButton, pressed && {opacity: 0.7}]}
          onPress={() => handleSendRequest(searchText.trim())}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.sendButtonText}>Отправить заявку</Text>
        </Pressable>
        {requestSent && <Text style={styles.success}>Заявка отправлена!</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ИЛИ ПОДЕЛИСЬ ССЫЛКОЙ</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.section}>
        <Pressable
          style={({pressed}) => [
            styles.secondaryButton,
            pressed && {opacity: 0.7},
          ]}
        >
          <Ionicons name="copy-outline" size={18} color="#2C2C2A" />
          <Text style={styles.secondaryButtonText}>
            Скопировать ссылку (Coming soon)
          </Text>
        </Pressable>
        <Pressable
          style={({pressed}) => [
            styles.secondaryButton,
            pressed && {opacity: 0.7},
          ]}
        >
          <Ionicons name="share-social-outline" size={18} color="#2C2C2A" />
          <Text style={styles.secondaryButtonText}>
            Поделиться ссылкой (Coming soon)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#F1EFE8"},
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    paddingBottom: 12,
  },
  backBtn: {padding: 2},
  title: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: "#2C2C2A",
  },
  label: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#888780",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#D85A30",
    borderRadius: 10,
    paddingHorizontal: 13,
    height: 50,
  },
  searchIcon: {marginRight: 9},
  at: {fontSize: 15, color: "#888780", marginRight: 1},
  input: {flex: 1, fontSize: 15, color: "#2C2C2A", paddingHorizontal: 0},
  section: {marginHorizontal: 16, marginTop: 14, gap: 10},
  sendButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#D85A30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonText: {fontSize: 15, fontWeight: "600", color: "#fff"},
  secondaryButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {fontSize: 14, fontWeight: "600", color: "#2C2C2A"},
  success: {fontSize: 14, color: "#085041", marginTop: 6},
  error: {fontSize: 14, color: "#D85A30", marginTop: 6},
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  dividerLine: {flex: 1, height: 1, backgroundColor: "#D3D1C7"},
  dividerText: {fontSize: 12, color: "#888780"},
});
