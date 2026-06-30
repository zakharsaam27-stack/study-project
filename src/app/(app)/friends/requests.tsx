import {useAuth} from "@/contexts/auth.context";
import {
  accept_friend_function_id,
  database_id,
  friendship_table_id,
  functions,
  profiles_table_id,
  reject_friend_function_id,
  tablesDB,
} from "@/lib/appwrite";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useRouter} from "expo-router";
import {useCallback, useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {Models, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RequestsScreen() {
  const [requests, setRequests] = useState<Models.DefaultRow[]>([]);
  const [requestersProfiles, setRequestersProfiles] = useState<
    Models.DefaultRow[]
  >([]);
  const [error, setError] = useState('')
  const {user} = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, []),
  );

  if (!user) return null

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

    await fetchRequestersProfiles(fetchRequestsResult.rows)
  };

  const handleAcceptRequest = async (
    rowId: string,
    requesterId: string,
    addresseeId: string,
  ) => {
    
    const removedRequest = requests.find((r) => r.$id === rowId)
    setRequests((prev) => prev.filter((r) => r.$id !== rowId));
    
    const checkAcc = await tablesDB.listRows({
        databaseId: database_id,
        tableId: friendship_table_id,
        queries: [
          Query.equal('requesterId', user.$id),
          Query.equal('addresseeId', requesterId),
          Query.equal('status', 'accepted')
        ]
      });
      
      if (checkAcc.total > 0) {
        return
      }

    
    try {
    await functions.createExecution(
      accept_friend_function_id,
      JSON.stringify({rowId, requesterId, addresseeId}),
    )} catch (err) {
      if (removedRequest) {
        setRequests((prev) => [...prev, removedRequest])
      }
      setError('Что то пошло не так')
    }
  };

  const handleRejectRequest = async (rowId: string) => {
    const removedRequest = requests.find((r) => r.$id === rowId)
    setRequests((prev) => prev.filter((r) => r.$id !== rowId));
    try {
    await functions.createExecution(
      reject_friend_function_id, JSON.stringify({rowId})
    )} catch (err) {
      if (removedRequest) {
        setRequests((prev) => [...prev, removedRequest])
      }
      setError('Что то пошло не так')
    }

  };

  const fetchRequestersProfiles = async (rows: Models.DefaultRow[]) => {
    const profiles = await Promise.all(
      rows.map((row) =>
        tablesDB.getRow({
          databaseId: database_id,
          tableId: profiles_table_id,
          rowId: row.requesterId,
        }),
      ),
    );
    setRequestersProfiles(profiles);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#2C2C2A" />
        </Pressable>
        <Text style={styles.title}>
          Входящие заявки <Text style={styles.titleCount}>{requests.length}</Text>
        </Text>
      </View>
      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubble-outline" size={48} color="#B0AEA3" />
          </View>
          <Text style={styles.emptyTitle}>Нет входящих заявок</Text>
          <Text style={styles.emptySubtitle}>
            Заявки в друзья будут появляться здесь. Поделись ссылкой, чтобы тебя нашли.
          </Text>
          <Pressable style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={17} color="#2C2C2A" />
            <Text style={styles.shareButtonText}>Поделиться ссылкой</Text>
          </Pressable>
        </View>
      ) : (
      <View style={styles.list}>
        {requests.map((request) => {
          const profile = requestersProfiles.find(
            (p) => p.$id === request.requesterId,
          );
          if (!profile) return null;
          return (
            <View key={request.requesterId} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(profile.name as string)
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{profile.name as string}</Text>
                  <Text style={styles.nickname}>
                    @{profile.nickname as string}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={({pressed}) => [
                    styles.acceptBtn,
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() =>
                    handleAcceptRequest(
                      request.$id,
                      request.requesterId,
                      user.$id,
                    )
                  }
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.acceptBtnText}>Принять</Text>
                </Pressable>
                <Pressable
                  style={({pressed}) => [
                    styles.rejectBtn,
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() => handleRejectRequest(request.$id)}
                >
                  <Text style={styles.rejectBtnText}>Отклонить</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#F1EFE8"},
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {padding: 2},
  title: {fontSize: 22, fontWeight: "600", letterSpacing: -0.3, color: "#2C2C2A"},
  titleCount: {color: "#888780", fontWeight: "600"},
  list: {paddingHorizontal: 16, marginTop: 10, gap: 14},
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 16,
    padding: 16,
    flexDirection: "column",
    gap: 14,
  },
  cardTop: {flexDirection: "row", alignItems: "center", gap: 12},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {color: "#712B13", fontWeight: "600", fontSize: 16},
  info: {flex: 1, gap: 2},
  name: {fontSize: 16, fontWeight: "500", color: "#2C2C2A"},
  nickname: {fontSize: 13, color: "#888780"},
  actions: {flexDirection: "row", gap: 10},
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#D85A30",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  acceptBtnText: {color: "#fff", fontWeight: "600", fontSize: 14},
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D3D1C7",
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtnText: {color: "#5F5E5A", fontWeight: "600", fontSize: 14},
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
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
  shareButton: {
    marginTop: 22,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shareButtonText: {fontSize: 14, fontWeight: "600", color: "#2C2C2A"},
});
