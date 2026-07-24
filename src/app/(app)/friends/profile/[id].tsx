import {Avatar} from "@/components/Avatar";
import {useSocket} from "@/contexts/socket.context";
import {database_id, profiles_table_id, tablesDB} from "@/lib/appwrite";
import {Ionicons} from "@expo/vector-icons";
import {useLocalSearchParams} from "expo-router";
import {useEffect, useState} from "react";
import {Pressable, SafeAreaView, StyleSheet, Text, View} from "react-native";
import {Models} from "react-native-appwrite";
import {formatDistanceToNow, format} from "date-fns";
import {ru} from "date-fns/locale";

function formatRelativeTime(date: Date) {
  return formatDistanceToNow(date, {addSuffix: true, locale: ru});
}
function formatJoinedDate(date: Date) {
  return format(date, "d MMMM yyyy", {
    locale: ru,
  });
}

export default function FriendProfileScreen() {
  const [profile, setProfile] = useState<Models.DefaultRow | null>(null);
  const {id} = useLocalSearchParams();
  const {onlineFriends} = useSocket();

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const row = await tablesDB.getRow({
        databaseId: database_id,
        tableId: profiles_table_id,
        rowId: id as string,
      });
      setProfile(row);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) {
    console.log("something went wrong when loading users profile");
    return;
  }

  const infoRows = [
    {icon: "person-outline", label: "Никнейм", value: `@${profile.nickname}`},
    {icon: "people-outline", label: "Друзей", value: 2},
    {icon: "happy-outline", label: "Любимый статус", value: "test"},
    {
      icon: "today-outline",
      label: "Дата присоединения",
      value: formatJoinedDate(new Date(profile.$createdAt)),
    },
  ] as const;

  const formatLastSeen = (date: Date) => `Был(-а) ${formatRelativeTime(date)}`;
  const formatStatusUpdatedAt = (date: Date) =>
    `Обновлено ${formatRelativeTime(date)}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Avatar
            source={profile.avatarURL ? {uri: profile.avatarURL} : null}
            name={profile.name}
            size={124}
          />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <View>
          <View>
            {onlineFriends.has(profile.$id) ? (
              <View style={styles.onlineWrapper}>
                <View style={styles.freeDot} />
                <Text style={styles.onlineText}>В сети</Text>
              </View>
            ) : (
              <View style={styles.onlineWrapper}>
                <View style={styles.busyDot} />
                <Text style={styles.offlineText}>
                  {formatLastSeen(profile.lastSeen)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Pressable
        style={({pressed}) => [styles.messageButton, pressed && {opacity: 0.7}]}
      >
        <Ionicons name="chatbox" size={18} color="#fff" />
        <Text style={styles.messageButtonText}>Написать</Text>
      </Pressable>

      <Text style={styles.betweenText}>Текущий статус</Text>

      <View style={styles.card}>
        <View style={styles.statusLeft}>
          <View style={styles.emojiBox}>
            <Text style={styles.emojiText}>{profile.statusEmoji}</Text>
          </View>
          <View>
            <Text
              style={styles.statusText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {profile.statusText}
            </Text>
            <Text style={styles.statusUpdatedAt}>
              {formatStatusUpdatedAt(profile.statusUpdatedAt)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.betweenText}>О пользователе</Text>

      <View style={[styles.card, styles.infoCard]}>
        {infoRows.map((row, index) => (
          <View
            key={row.label}
            style={[
              index === infoRows.length - 1 && styles.lastRow,
              styles.infoRow,
            ]}
          >
            <Ionicons name={row.icon} size={20} color="#5F5E5A" />
            <Text style={styles.infoLabel}>{row.label}</Text>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lastRow: {
    borderBottomWidth: 0,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 14,
    padding: 14,
  },
  infoCard: {
    paddingVertical: 0,
  },
  infoLabel: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2A",
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEAE1",
  },
  infoValue: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 4,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  messageButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#D85A30",
    borderRadius: 10,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  emojiBox: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FFE3D6",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 25,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C2C2A",
  },
  statusUpdatedAt: {
    fontSize: 13,
    fontWeight: "400",
    color: "#888780",
    marginBottom: 2,
    marginTop: 2,
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
  onlineText: {
    color: "#6BCF9A",
    paddingHorizontal: 4,
    fontWeight: "600",
  },
  offlineText: {
    color: "#a0a0a0",
    paddingHorizontal: 4,
    fontWeight: "600",
  },
  onlineWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  betweenText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#939391",
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
