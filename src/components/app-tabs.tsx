import {Tabs, useFocusEffect, usePathname} from "expo-router";
import {StyleSheet, Text, useColorScheme, View} from "react-native";
import {Colors} from "@/constants/theme";
import {
  client,
  database_id,
  friendship_table_id,
  tablesDB,
} from "@/lib/appwrite";
import {useAuth} from "@/contexts/auth.context";
import {Models, Query} from "react-native-appwrite";
import {useCallback, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useHideTabBar} from "@/contexts/tabbar.context";

export default function AppTabs() {
  const scheme = useColorScheme();
  const [requests, setRequests] = useState<Models.DefaultRow[] | null>(null);
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const {user} = useAuth();
  const {isTabBarHidden} = useHideTabBar();

  const fetchRequests = async () => {
    if (!user) return null;
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

  useFocusEffect(
    useCallback(() => {
      fetchRequests();

      const unsubscribe = client.subscribe(
        `databases.${database_id}.tables.${friendship_table_id}.rows`,
        () => {
          fetchRequests();
        },
      );
      return () => unsubscribe();
    }, [user]),
  );

  const pathName = usePathname();

  const isHiddenRoute =
    pathName === "/friends/requests" ||
    pathName === "/friends/add-friend" ||
    pathName === "/profile/edit-profile";

  const tabBarStyle = {
    backgroundColor: colors.background,
    borderTopColor: colors.backgroundElement,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    paddingTop: 6,
  };

  const isFriendReqs = (requests?.length ?? 0) > 0;
  const reqCount = requests?.length

  return (
    <Tabs
      screenOptions={{
        tabBarStyle:
          isTabBarHidden || isHiddenRoute
            ? {display: "none", backgroundColor: "transparent"}
            : tabBarStyle,
        tabBarActiveTintColor: "#D85A30",
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Лента",
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? "home-outline" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-status"
        options={{
          title: "Статус",
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? "happy-outline" : "happy-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Друзья",
          tabBarIcon: ({color, focused}) => (
            <View style={styles.friendsIconWrap}>
              <Ionicons
                name={
                  focused ? "people-circle-outline" : "people-circle-outline"
                }
                size={24}
                color={color}
              />
              {isFriendReqs && (
                <View style={styles.badge}>
                  <Text style={styles.reqCount}>
                    {(reqCount ?? 0) < 10 ? reqCount : "9+"}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? "person-circle-outline" : "person-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#FA3E3E",
    alignItems: "center",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  friendsIconWrap: {
    position: "relative",
  },
  reqCount: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
  },
});
