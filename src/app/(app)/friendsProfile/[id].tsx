import {database_id, profiles_table_id, tablesDB} from "@/lib/appwrite";
import {useLocalSearchParams} from "expo-router";
import {useEffect, useState} from "react";
import {SafeAreaView, Text, View} from "react-native";
import {Models} from "react-native-appwrite";

export default function FriendProfileScreen() {
  const [profile, setProfile] = useState<Models.DefaultRow | null>(null);
  const {id} = useLocalSearchParams();

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

  return (
    <SafeAreaView>
      <View>
        <Text>This is the {profile.name}'s profile. Full UI coming soon</Text>
      </View>
      <View>
        <Text>{profile.name}'s info:</Text>
        <Text>nickname: {profile.nickname}</Text>
        <Text>statusEmoji: {profile.statusEmoji}</Text>
        <Text>statusText: {profile.statusText}</Text>
        <Text>lastSeen: {profile.lastSeen}</Text>
      </View>
    </SafeAreaView>
  );
}
