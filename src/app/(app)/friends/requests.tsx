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
import {useFocusEffect} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {ID, Models, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RequestsScreen() {
  const [requests, setRequests] = useState<Models.DefaultRow[]>([]);
  const [requestersProfiles, setRequestersProfiles] = useState<
    Models.DefaultRow[]
  >([]);
  const {user} = useAuth();

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, []),
  );

  useEffect(() => {
    if (requests.length === 0) {
      return;
    } else {
      fetchRequestersProfiles();
    }
  }, [requests]);

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

  const handleAcceptRequest = async (
    rowId: string,
    requesterId: string,
    addresseeId: string,
  ) => {
    
    const checkAcc = await tablesDB.listRows({
        databaseId: database_id,
        tableId: friendship_table_id,
        queries: [
          Query.equal('requesterId', addresseeId),
          Query.equal('addresseeId', user.$id),
          Query.equal('status', 'accepted')
        ]
      });
      
      if (checkAcc.total > 0) {
        return
      }

    
    await functions.createExecution(
      accept_friend_function_id,
      JSON.stringify({rowId, requesterId, addresseeId}),
    );
    setRequests((prev) => prev.filter((r) => r.$id !== rowId));
  };

  const handleRejectRequest = async (rowId: string) => {
    functions.createExecution(
      reject_friend_function_id, JSON.stringify({rowId})
    )
    setRequests((prev) => prev.filter((r) => r.$id !== rowId));
  };

  const fetchRequestersProfiles = async () => {
    const profiles = await Promise.all(
      requests.map((request) =>
        tablesDB.getRow({
          databaseId: database_id,
          tableId: profiles_table_id,
          rowId: request.requesterId,
        }),
      ),
    );
    setRequestersProfiles(profiles);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Входящие заявки {requests.length}</Text>
      </View>
      <View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f5f5f5"},
  header: {paddingHorizontal: 16, paddingVertical: 12},
  title: {fontSize: 22, fontWeight: "700"},
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    flexDirection: "column",
    gap: 10,
  },
  cardTop: {flexDirection: "row", alignItems: "center", gap: 12},
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {color: "#fff", fontWeight: "700", fontSize: 15},
  info: {flex: 1},
  name: {fontSize: 15, fontWeight: "600"},
  nickname: {fontSize: 13, color: "#999"},
  actions: {flexDirection: "row", gap: 8},
  acceptBtn: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  acceptBtnText: {color: "#fff", fontWeight: "600", fontSize: 14},
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectBtnText: {color: "#333", fontWeight: "600", fontSize: 14},
});
