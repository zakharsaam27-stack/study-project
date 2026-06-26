import {useAuth} from "@/contexts/auth.context";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";
import { useFocusEffect, useRouter } from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {Button, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {ID, Models, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function FriendsScreen() {
  const [requests, setRequests] = useState<Models.DefaultRow[]>([]);
  const [friendList, setFriendList] = useState<Models.DefaultRow[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<Models.DefaultRow[]>(
    [],
  );

  const {user} = useAuth();

  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      fetchRequests()
      fetchFriendList()
    }, [])
  )

  useEffect(() => {
    if (friendList.length === 0) {
      return;
    } else {
      fetchFriendsProfiles();
    }
  }, [friendList]);

  if (!user) {
    return null;
  }

  const fetchRequests = async () => {
    const fetchRequestsResult = await tablesDB.listRows({
      databaseId: database_id,
      tableId: friendship_table_id,
      queries: [
        Query.equal("addresseeId", user.$id),
        Query.equal("status", "pending"),
      ],
    });
    setRequests(fetchRequestsResult.rows);
  };

  const fetchFriendList = async () => {
    const fetchFriendListResult = await tablesDB.listRows({
      databaseId: database_id,
      tableId: friendship_table_id,
      queries: [
        Query.equal("status", "accepted"),
        Query.equal("requesterId", user.$id),
      ],
    });
    setFriendList(fetchFriendListResult.rows);
  };

  const fetchFriendsProfiles = async () => {
    const profiles = await Promise.all(
      friendList.map((friend) =>
        tablesDB.getRow({
          databaseId: database_id,
          tableId: profiles_table_id,
          rowId: friend.addresseeId,
        }),
      ),
    );
    setFriendsProfiles(profiles);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Друзья {friendList.length}</Text>
        <Button title="+ Добавить" onPress={() => router.push('/(app)/friends/add-friend')}/>
      </View>
      <View style={styles.searchBar}>
        <TextInput placeholder="Поиск" autoCapitalize="none"/>
      </View>
      <Pressable style={styles.requestsCard} onPress={() => router.push('/(app)/friends/requests')}>
        <Text>Входящие заявки</Text>
        <Text style={{color: '#999'}}>{requests.length} хотят дружить</Text>
      </Pressable>
      <Text style={styles.sectionLabel}>Все друзья</Text>
      <View>
        {friendsProfiles.map((friend) => (
          <View key={friend.$id} style={styles.friendCard}>
            <View style={styles.avatar} />
            <View style={{flex: 1}}>
              <Text>{friend.name as string}</Text>
              <Text style={{color: '#999', fontSize: 13}}>@{friend.nickname as string}</Text>
            </View>
            <Text style={{fontSize: 13, color: '#666'}}>{friend.statusEmoji as string} {friend.statusText as string}</Text>
          </View>
        ))}
        <Text style={styles.hint}>Смахни влево, чтобы удалить друга</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f5f5f5"},
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {fontSize: 22, fontWeight: "700"},
  searchBar: {
    marginHorizontal: 16,
    height: 44,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  requestsCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#999",
  },
  friendCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#e8e8e8",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8},
})
