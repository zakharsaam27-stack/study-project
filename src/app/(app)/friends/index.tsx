// TO DO: DELETE FRIEND BY SWIPE, OPEN PROFILE,
// SEPARATE SCROLLVIEWS FOR SEARCHFRIENDS AND FRIENDSLIST,
// STACKING, SEARCH BY NAME, FIX GAP WHEN EMPTY SEARCHFRIENDS RESUlt

import { useAuth } from "@/contexts/auth.context";
import {
  client,
  database_id,
  friendship_table_id,
  functions,
  profiles_table_id,
  reject_friend_function_id,
  tablesDB,
} from "@/lib/appwrite";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Models, Query } from "react-native-appwrite";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  const [requests, setRequests] = useState<Models.DefaultRow[]>([]);
  const [friendList, setFriendList] = useState<Models.DefaultRow[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<Models.DefaultRow[]>(
    [],
  );
  const [searchFriend, setSearchFriend] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();

  const router = useRouter();

  const friendListRef = useRef(friendList);

  useEffect(() => {
    friendListRef.current = friendList;
  }, [friendList]);

  useEffect(() => {
    fetchFriendList();
    fetchRequests();
    fetchFriendsProfiles();

    const unsubscribeFriends = client.subscribe(
      `databases.${database_id}.tables.${friendship_table_id}.rows`,
      () => {
        fetchFriendList();
        fetchRequests();
        fetchFriendsProfiles();
      },
    );
    const unsubscribeProfiles = client.subscribe(
      `databases.${database_id}.tables.${profiles_table_id}.rows`,
      () => {
        fetchFriendsProfiles();
      },
    );
    return () => {
      unsubscribeFriends();
      unsubscribeProfiles();
    };
  }, []);

  if (!user) {
    return null;
  }

  const renderRightActions = (friendShipId: string) => (
    <View style={styles.friendDeletion}>
      <Pressable
        onPress={() => {
          deleteFriend(friendShipId);
        }}
      >
        <FontAwesome6 name="trash-can" size={20} color="#fff" />
      </Pressable>
    </View>
  );

  const deleteFriend = async (rowId: string) => {
    const removedFriend = friendList.find((r) => r.$id === rowId);
    setFriendList((prev) => prev.filter((r) => r.$id !== rowId));
    try {
      await functions.createExecution(
        reject_friend_function_id,
        JSON.stringify({ rowId }),
      );
    } catch (err) {
      if (removedFriend) {
        setFriendList((prev) => [...prev, removedFriend]);
      }
      setError("Что то пошло не так");
    }
  };

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
    console.log("friendList right now:", friendList);
    const profiles = await Promise.all(
      friendListRef.current.map((friend) =>
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
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(app)/friends/add-friend")}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Добавить</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#888780" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по никнейму"
            placeholderTextColor="#888780"
            autoCapitalize="none"
            onChangeText={setSearchFriend}
          />
        </View>

        {searchFriend && (
          <View style={styles.searchResult}>
            {friendsProfiles
              .filter((f) => f.nickname.startsWith(searchFriend))
              .map((friend) => (
                <View key={friend.$id} style={styles.friendCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarInitials}>
                      {(friend.name as string)
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>
                      {friend.name as string}
                    </Text>
                    <Text style={styles.friendNickname}>
                      @{friend.nickname as string}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>
                      {friend.statusEmoji as string}{" "}
                      {friend.statusText as string}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        <Pressable
          style={styles.requestsCard}
          onPress={() => router.push("/(app)/friends/requests")}
        >
          <View style={styles.requestsIcon}>
            <Ionicons name="person-add" size={18} color="#fff" />
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.requestsTitle}>Входящие заявки</Text>
            <Text style={styles.requestsSubtitle}>
              {requests.length} человек хотят дружить
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D85A30" />
        </Pressable>
        <Text style={styles.sectionLabel}>Все друзья</Text>

        {friendsProfiles.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="person-add-outline" size={50} color="#B0AEA3" />
            </View>
            <Text style={styles.emptyTitle}>У тебя пока нет друзей</Text>
            <Text style={styles.emptySubtitle}>
              Добавь друзей по нику или поделись своей ссылкой.
            </Text>
          </View>
        ) : (
          <View>
            {friendsProfiles.map((friend) => {
              const friendShipRow = friendList.find(
                (r) => r.addresseeId === friend.$id,
              );
              return (
                <Swipeable
                  key={friend.$id}
                  renderRightActions={() =>
                    renderRightActions(friendShipRow?.$id ?? "")
                  }
                  rightThreshold={44}
                >
                  <View style={styles.friendCard}>
                    <View style={styles.avatarWrapper}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarInitials}>
                          {(friend.name as string)
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </Text>
                      </View>
                      <View style={styles.avatarDot} />
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>
                        {friend.name as string}
                      </Text>
                      <Text style={styles.friendNickname}>
                        @{friend.nickname as string}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>
                        {friend.statusEmoji as string}{" "}
                        {friend.statusText as string}
                      </Text>
                    </View>
                  </View>
                </Swipeable>
              );
            })}
            <Text style={styles.hint}>Смахни влево, чтобы удалить друга</Text>
          </View>
        )}
      </ScrollView>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1EFE8" },
  scrollContent: { flexGrow: 1 },
  errorText: {
    textAlign: "center",
    fontSize: 13,
    color: "#D85A30",
    paddingVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: "#2C2C2A",
  },
  addButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: "#D85A30",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  searchBar: {
    marginHorizontal: 18,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2A",
  },
  requestsCard: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: "#FAECE7",
    borderWidth: 1,
    borderColor: "#EFC8B6",
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  requestsIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
  },
  requestsTitle: { fontSize: 15, fontWeight: "600", color: "#712B13" },
  requestsSubtitle: { fontSize: 13, color: "#9a5d40", marginTop: 2 },
  sectionLabel: {
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#888780",
  },
  friendCard: {
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 14,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
    width: 42,
    height: 42,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: "600",
    color: "#712B13",
  },
  avatarDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#1D9E75",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendName: { fontSize: 15, fontWeight: "500", color: "#2C2C2A" },
  friendNickname: { fontSize: 13, color: "#888780" },
  statusPill: {
    backgroundColor: "#E1F5EE",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusText: { fontSize: 12, fontWeight: "500", color: "#085041" },
  hint: { textAlign: "center", fontSize: 12, color: "#a8a79f", marginTop: 8 },
  searchResult: {
    marginTop: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 108,
    height: 108,
    borderRadius: 999,
    backgroundColor: "#E9E6DC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: "#2C2C2A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#888780",
    textAlign: "center",
    maxWidth: 250,
    marginTop: 8,
  },
  friendDeletion: {
    width: 72,
    backgroundColor: "#C0392B",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginHorizontal: 18,
  },
});
