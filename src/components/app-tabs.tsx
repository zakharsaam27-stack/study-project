import {Tabs, useFocusEffect} from "expo-router";
import {StyleSheet, useColorScheme} from "react-native";
import {getFocusedRouteNameFromRoute} from "expo-router/react-navigation";
import {Colors} from "@/constants/theme";
import {database_id, friendship_table_id, tablesDB} from "@/lib/appwrite";
import {useAuth} from "@/contexts/auth.context";
import {Models, Query} from "react-native-appwrite";
import {useCallback, useState} from "react";
import {Ionicons} from "@expo/vector-icons";

export default function AppTabs() {
  const scheme = useColorScheme();
  const [requests, setRequests] = useState<Models.DefaultRow[] | null>(null);
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const {user} = useAuth();

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
    }, [user]),
  );

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

  const friendRequests = () => {
    if (requests?.length !== 0) {
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
          borderTopWidth: StyleSheet.hairlineWidth,
          shadowColor: "#000",
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.05,
          shadowRadius: 8,
          paddingTop: 6,
        },
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
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-status"
        options={({route}) => {
          getFocusedRouteNameFromRoute(route);

          return {
            title: "Статус",
            tabBarIcon: ({color, focused}) => (
              <Ionicons
                name={focused ? "happy" : "happy-outline"}
                size={24}
                color={color}
              />
            ),
          };
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Друзья",
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
