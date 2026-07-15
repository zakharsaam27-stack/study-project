import {Avatar} from "@/components/Avatar";
import {useAuth} from "@/contexts/auth.context";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useRouter} from "expo-router";
import {useCallback, useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {Models, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function ProfileScreen() {
  const {user, logOut} = useAuth();
  const [myProfile, setMyprofile] = useState<Models.DefaultRow | null>(null);
  const [friendCount, setFriendCount] = useState<number>(0);
  const router = useRouter();

  const fetchMyProfile = async () => {
    if (!user) return;
    const profile = await tablesDB.getRow({
      databaseId: database_id,
      tableId: profiles_table_id,
      rowId: user.$id,
    });
    setMyprofile(profile);
  };

  const fetchFriendCount = async () => {
    if (!user) return;
    const result = await tablesDB.listRows({
      databaseId: database_id,
      tableId: friendship_table_id,
      queries: [
        Query.equal("status", "accepted"),
        Query.equal("requesterId", user.$id),
      ],
    });
    setFriendCount(result.total);
  };

  useFocusEffect(
    useCallback(() => {
      fetchFriendCount();
      fetchMyProfile();
    }, [user]),
  );

  if (!user || !myProfile) return null;

  const settingsRows = [
    {icon: "shield-outline", label: "Приватность"},
    {icon: "notifications-outline", label: "Уведомления"},
    {icon: "time-outline", label: "Автостатус"},
    {icon: "sunny-outline", label: "Тема оформления", value: "Система"},
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профиль</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Avatar
            source={myProfile.avatarURL ? {uri: myProfile.avatarURL} : null}
            name={myProfile.name}
            size={124}
          />
        </View>
        <Text style={styles.name}>{myProfile.name}</Text>
        <Text style={styles.nickname}>@{myProfile.nickname}</Text>
      </View>

      <Pressable
        style={({pressed}) => [styles.editButton, pressed && {opacity: 0.7}]}
        onPress={() => router.push("/(app)/profile/edit-profile")}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.editButtonText}>Редактировать профиль</Text>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.statusFriendRow}>
          <View style={styles.statusLeft}>
            <Pressable
              style={({pressed}) => [pressed && {opacity: 0.7}]}
              onPress={() => router.replace("/(app)/my-status")}
            >
              <View style={styles.emojiBox}>
                <Text style={styles.emojiText}>{myProfile.statusEmoji}</Text>
              </View>
            </Pressable>
            <Pressable
              style={({pressed}) => [pressed && {opacity: 0.7}]}
              onPress={() => router.replace("/(app)/my-status")}
            >
              <View>
                <Text style={styles.statusLabel}>МОЙ СТАТУС</Text>
                <Text style={styles.statusText}>{myProfile.statusText}</Text>
              </View>
            </Pressable>
          </View>
          <Pressable
            style={({pressed}) => [pressed && {opacity: 0.7}]}
            onPress={() => router.replace("/(app)/friends")}
          >
            <Text style={styles.friendCountText}>Друзей: {friendCount}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.card, styles.settingsCard]}>
        {settingsRows.map((row, index) => (
          <Pressable
            key={row.label}
            style={({pressed}) => [
              styles.settingsRow,
              index === settingsRows.length - 1 && styles.lastRow,
              pressed && styles.settingsRowPressed,
            ]}
          >
            <Ionicons name={row.icon} size={20} color="#5F5E5A" />
            <Text style={styles.settingsLabel}>{row.label}</Text>
            <View style={styles.settingsRight}>
              {"value" in row && (
                <Text style={styles.settingsValue}>{row.value}</Text>
              )}
              <Ionicons name="chevron-forward" size={16} color="#C2BFB3" />
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({pressed}) => [styles.logoutButton, pressed && {opacity: 0.7}]}
        onPress={() => {
          logOut();
        }}
      >
        <Ionicons name="exit-outline" size={18} color="#C0392B" />
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: "#2C2C2A",
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
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: "600",
    color: "#712B13",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  nickname: {
    fontSize: 14,
    color: "#888780",
  },
  editButton: {
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
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 14,
    padding: 14,
  },
  settingsCard: {
    paddingVertical: 0,
  },
  statusFriendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emojiBox: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 22,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#888780",
    letterSpacing: 1,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C2C2A",
  },
  friendCountText: {
    fontSize: 13,
    color: "#888780",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEAE1",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingsRowPressed: {
    backgroundColor: "#F1EFE8",
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2A",
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingsValue: {
    fontSize: 13,
    color: "#888780",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EBC4C0",
    borderRadius: 10,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#C0392B",
  },
});
