// TO DO: FREE AND BUSY,

import {Button, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/auth.context";
import {useFocusEffect} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {Models, Query} from "react-native-appwrite";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";

export default function HomeScreen() {
  const [friendList, setFriendList] = useState<Models.DefaultRow[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<Models.DefaultRow[]>(
    [],
  );

  const { user} = useAuth();

  useFocusEffect(
    useCallback(() => {
      fetchFriendList();
    }, []),
  );

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

  const formattedStatusUpdatedAt = (statusUpdatedAt: Date) => {
    const newDate = new Date();
    const oldDate = statusUpdatedAt;
    let gap = (newDate.getTime() - oldDate.getTime()) / (1000 * 60);
    if (gap < 1) {
      return "Только что";
    } else if (1 < gap && gap < 60) {
      return `${Math.floor(gap)} мин`;
    } else if (60 < gap && gap < 1440) {
      return `${Math.floor(gap / 60)} ч`;
    } else if (1440 < gap && gap < 10080) {
      return `${Math.floor(gap / 1440)} д`;
    } else {
      return "давно"
    }
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
        <Text style={styles.headerTitle}>PingMe</Text>
      </View>
      <View style={styles.freeRow}>
        <View style={styles.greenDot} />
        <Text style={styles.freeText}>
          <Text style={styles.freeTextBold}>{friendList.length} друга </Text>
          свободны сейчас
        </Text>
      </View>
      <View>
        {friendsProfiles.map((friend) => (
          <View style={styles.friendCard} key={friend.$id}>
            <View style={styles.avatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name as string}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {friend.statusEmoji} {friend.statusText}
                </Text>
              </View>
            </View>
            <Text style={styles.timeText}>
              {formattedStatusUpdatedAt(new Date(friend.statusUpdatedAt))}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
  },
  freeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3cb371",
  },
  freeText: {
    fontSize: 16,
    color: "#444",
  },
  freeTextBold: {
    fontWeight: "700",
    color: "#111",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#aaa",
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  friendCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#efefef",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  statusText: {
    fontSize: 13,
    color: "#333",
  },
  timeText: {
    fontSize: 13,
    color: "#aaa",
  },
});
