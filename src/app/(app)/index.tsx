// TO DO: GRADIENT AT THE BOTTOM

import {SectionList, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native";
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
import {Avatar} from "@/components/Avatar";
import { socket } from "@/lib/socket";

function pluralize(
  count: number,
  forms: {one: string; few: string; many: string},
) {
  const lastDigit = count % 10;
  const lastTwoDigit = count % 100;
  if (lastDigit === 1 && lastTwoDigit !== 11) {
    return forms.one;
  } else if (
    [2, 3, 4].includes(lastDigit) &&
    ![12, 13, 14].includes(lastTwoDigit)
  ) {
    return forms.few;
  } else {
    return forms.many;
  }
}

export default function HomeScreen() {
  const [friendsProfiles, setFriendsProfiles] = useState<Models.DefaultRow[]>(
    [],
  );

  const {user} = useAuth();

  useEffect(() => {
    const handleOnline = (friendId: string) => {
      console.log("ONLINE EVENT", friendId)
      setFriendsProfiles((prev) =>
        prev.map((profile) =>
          friendId === profile.$id ? {...profile, online: true} : profile,
        ),
      );
    };
    const handleOffline = (friendId: string) => {
      console.log("OFFLINE EVENT", friendId)
      setFriendsProfiles((prev) =>
        prev.map((profile) =>
          friendId === profile.$id ? {...profile, online: false} : profile,
        ),
      );
    };
    const handleSetOnlineFriends = (onlineFriends: string[]) => {
      console.log("ONLINE:", onlineFriends)
      setFriendsProfiles((prev) =>
        prev.map((profile) =>
          onlineFriends.includes(profile.$id)
            ? {...profile, online: true}
            : {...profile, online: false},
        ),
      );
    };

    socket.on("friend.online", handleOnline);
    socket.on("friend.offline", handleOffline);
    socket.on("onlineFriends", handleSetOnlineFriends)

    return () => {
      socket.off("friend.online", handleOnline);
      socket.off("friend.offline", handleOffline);
      socket.off("onlineFriends", handleSetOnlineFriends)
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFriendsProfiles();

      const unsubscribeFriends = client.subscribe(
        `databases.${database_id}.tables.${friendship_table_id}.rows`,
        () => {
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
    }, []),
  );

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
      return `${Math.floor(gap / 10080)} н`;
    }
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
    socket.emit("getOnlineFriends");
  };

  const showStatusSafely = (status: string, statusUpdatedAt: string) => {
    if (formattedStatusUpdatedAt(new Date(statusUpdatedAt)) === "Только что") {
      if (status.length === 25) {
        return status.slice(0, 21) + "...";
      }
    } else {
      return status;
    }
  };

  const sections = [
    {
      title: "free",
      data: friendsProfiles.filter((f) => f.busyness === "free"),
      dotStyle: styles.freeDot,
      verb: {one: " свободен ", many: " свободны "},
      pillStyle: styles.freeStatusPill,
      textStyle: styles.freeStatusText,
    },
    {
      title: "busy",
      data: friendsProfiles.filter((f) => f.busyness === "busy"),
      dotStyle: styles.busyDot,
      verb: {one: " занят ", many: " заняты "},
      pillStyle: styles.busyStatusPill,
      textStyle: styles.busyStatusText,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PingMe</Text>
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
        <SectionList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}  
        sections={sections}
          keyExtractor={(item) => item.$id}
          renderSectionHeader={({section}) => (
            <View style={styles.freeRow}>
              <View style={section.dotStyle} />
              <Text style={styles.freeText}>
                <Text style={styles.freeTextBold}>
                  <Text>
                    {section.data.length}{" "}
                    {pluralize(section.data.length, {
                      one: "друг",
                      few: "друга",
                      many: "друзей",
                    })}
                  </Text>
                </Text>
                {section.data.length === 1
                  ? section.verb.one
                  : section.verb.many}
                сейчас
              </Text>
            </View>
          )}
          renderItem={({item, section}) => (
            <View style={styles.friendCard}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Avatar
                    source={item.avatarURL ? {uri: item.avatarURL} : null}
                    name={item.name}
                    size={44}
                  />
                </View>
                <View style={[styles.onlineDot, {backgroundColor: item.online ? "#28A745" : "#808080"}]}/>

              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name as string}</Text>
                <View style={section.pillStyle}>
                  <Text style={section.textStyle}>
                    {item.statusEmoji}
                    {showStatusSafely(item.statusText, item.statusUpdatedAt)}
                  </Text>
                </View>
              </View>
              <Text style={styles.timeText}>
                {formattedStatusUpdatedAt(new Date(item.statusUpdatedAt))}
              </Text>
            </View>
          )}
        />
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
    paddingHorizontal: 4,
    gap: 6,
    backgroundColor: "#F1EFE8",
    paddingVertical: 8
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
    gap: 4,
    paddingBottom: 10
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
    marginBottom: 10
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
  friendInfo: {
    flex: 1,
    gap: 5,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2C2C2A",
  },
  freeStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1F5EE",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 5,
    alignSelf: "flex-start",
  },
  busyStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1EFE8",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 5,
    alignSelf: "flex-start",
  },
  freeStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#085041",
  },
  busyStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#5F5E5A",
  },
  timeText: {
    fontSize: 12,
    color: "#888780",
    alignSelf: "center",
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
  freeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#6BCF9A",
  },
  busyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#a0a0a0",
  },
  onlineDot: {
    height: 12,
    width: 12,
    borderRadius: 999,
    position: 'absolute',
    left: 33,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
