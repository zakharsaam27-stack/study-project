// TO DO: FREE AND BUSY,

import {Ionicons} from "@expo/vector-icons";
import {Button, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Svg, {Circle, Path} from "react-native-svg";
import {useAuth} from "@/contexts/auth.context";
import {useFocusEffect} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {Models, Query} from "react-native-appwrite";
import {
  client,
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

  const {user} = useAuth();

  useEffect(() => {
    fetchFriendList();
    fetchFriendsProfiles();

    const unsubscribeFriends = client.subscribe(
      `databases.${database_id}.tables.${friendship_table_id}.rows`,
      () => {
        fetchFriendList();
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
      return "давно";
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
    const fetchFriendListResult = await tablesDB.listRows({
      databaseId: database_id,
      tableId: friendship_table_id,
      queries: [
        Query.equal("status", "accepted"),
        Query.equal("requesterId", user.$id),
      ],
    });

    const profiles = await Promise.all(
      fetchFriendListResult.rows.map((friend) =>
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
        <Ionicons name="notifications-outline" size={22} color="#2C2C2A" />
      </View>
      <View style={styles.freeRow}>
        <View style={styles.greenDot} />
        <Text style={styles.freeText}>
          <Text style={styles.freeTextBold}>{friendList.length} друга </Text>
          свободны сейчас
        </Text>
      </View>
      {friendsProfiles.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Svg width={50} height={50} viewBox="0 0 24 24" fill="none">
              <Circle
                cx={12}
                cy={12}
                r={8.5}
                stroke="#B0AEA3"
                strokeWidth={1.6}
              />
              <Path
                d="M8.5 14.5a4.5 4.5 0 0 1 7 0"
                stroke="#B0AEA3"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M9 9.5h.01M15 9.5h.01"
                stroke="#B0AEA3"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.emptyTitle}>Сейчас тут никого нет</Text>
          <Text style={styles.emptySubtitle}>
            Как только вы добавите друзей, они появятся здесь.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {friendsProfiles.map((friend) => (
            <View style={styles.friendCard} key={friend.$id}>
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: "#2C2C2A",
  },
  freeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1D9E75",
  },
  freeText: {
    fontSize: 14,
    color: "#5F5E5A",
  },
  freeTextBold: {
    fontWeight: "600",
    color: "#2C2C2A",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#888780",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 2,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  list: {
    paddingHorizontal: 18,
    gap: 10,
  },
  friendCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: "600",
    color: "#712B13",
  },
  avatarDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 13,
    height: 13,
    borderRadius: 999,
    backgroundColor: "#1D9E75",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  friendInfo: {
    flex: 1,
    gap: 5,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2C2C2A",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1F5EE",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 5,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#085041",
  },
  timeText: {
    fontSize: 12,
    color: "#888780",
    alignSelf: "flex-start",
    marginTop: 2,
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
});
