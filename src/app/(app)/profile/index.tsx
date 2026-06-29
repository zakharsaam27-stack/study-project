// TO DO: REDIRECT TO MY-STATUS AND FRIENDS,

import {useAuth} from "@/contexts/auth.context";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {Models, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

export default function ProfileScreen() {
  const {user, logOut} = useAuth();
  const [myProfile, setMyprofile] = useState<Models.DefaultRow | null>(null);
  const [friendCount, setFriendCount] = useState<number>(0);

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
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {getInitials(myProfile.name as string)}
            </Text>
          </View>
          <View style={styles.statusDot} />
        </View>
        <Text style={styles.name}>{myProfile.name}</Text>
        <Text style={styles.nickname}>@{myProfile.nickname}</Text>
      </View>

      <Pressable style={styles.editButton}>
        <Ionicons name="pencil-outline" size={18} color="#fff" />
        <Text style={styles.editButtonText}>Редактировать профиль</Text>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.statusFriendRow}>
          <View style={styles.statusLeft}>
            <View style={styles.emojiBox}>
              <Text style={styles.emojiText}>{myProfile.statusEmoji}</Text>
            </View>
            <View>
              <Text style={styles.statusLabel}>МОЙ СТАТУС</Text>
              <Text style={styles.statusText}>{myProfile.statusText}</Text>
            </View>
          </View>
          <Text style={styles.friendCountText}>Друзей: {friendCount}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {settingsRows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.settingsRow,
              index === settingsRows.length - 1 && styles.lastRow,
            ]}>
            <Ionicons name={row.icon} size={20} color="#888" />
            <Text style={styles.settingsLabel}>{row.label}</Text>
            <View style={styles.settingsRight}>
              {"value" in row && (
                <Text style={styles.settingsValue}>{row.value}</Text>
              )}
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={logOut}>
        <Ionicons name="exit-outline" size={18} color="#D85A30" />
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#555",
  },
  statusDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3cb371",
    borderWidth: 2,
    borderColor: "#f2f2f2",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  nickname: {
    fontSize: 15,
    color: "#888",
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#333",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 16,
    padding: 14,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#efefef",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 22,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#aaa",
    letterSpacing: 1,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  friendCountText: {
    fontSize: 15,
    color: "#888",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingsValue: {
    fontSize: 14,
    color: "#aaa",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
});
