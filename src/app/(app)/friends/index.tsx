import {useAuth} from "@/contexts/auth.context";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "@/lib/appwrite";
import { useRouter } from "expo-router";
import {useEffect, useState} from "react";
import {Button, Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {ID, Models, Query} from "react-native-appwrite";
import {SafeAreaView} from "react-native-safe-area-context";

export default function FriendsScreen() {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<Models.DefaultRow[]>([]);
  const [friendList, setFriendList] = useState<Models.DefaultRow[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<Models.DefaultRow[]>(
    [],
  );

  const {user} = useAuth();

  const router = useRouter()

  useEffect(() => {
    fetchRequests();
    fetchFriendList();
  }, []);

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

  const handleSendRequest = async (searchText: string) => {
    try {
    const searchResult = await tablesDB.listRows({
      databaseId: database_id,
      tableId: profiles_table_id,
      queries: [Query.equal("nickname", searchText)],
    });

    tablesDB.createRow({
      databaseId: database_id,
      tableId: friendship_table_id,
      rowId: ID.unique(),
      data: {
        requesterId: user.$id,
        addresseeId: searchResult.rows[0].$id,
        status: "pending",
      },
    })} catch {
        setError("Пользователь не найден")
    }
  };

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

  const handleAcceprRequest = async (rowID: string, requesterID: string) => {
    tablesDB.updateRow({
      databaseId: database_id,
      tableId: friendship_table_id,
      rowId: rowID,
      data: {
        status: "accepted",
      },
    });
    tablesDB.createRow({
      databaseId: database_id,
      tableId: friendship_table_id,
      rowId: ID.unique(),
      data: {
        requesterId: user.$id,
        addresseeId: requesterID,
        status: "accepted",
      },
    });
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
    <SafeAreaView>
      <View>
        <Text>Друзья</Text>
        <Text>{friendList.length}</Text>
        <Button title="+ Добавить" onPress={() => router.push('/(app)/friends/add-friend')}/>
      </View>
      <View>
        <TextInput placeholder="Поиск (still in work)" />
      </View>
      <View>
        <Pressable>
          <Text>Входящие заявки</Text>
          <Text>{requests.length} хотят дружить</Text>
        </Pressable>
      </View>
      <Text>ВСЕ ДРУЗЬЯ</Text>
      <View>
        {friendsProfiles.map((friend) => (
          <View key={friend.$id}>
            <View>
              <Image source={{uri: friend.avatarURL}} />
            </View>
            <View>
              <Text>{friend.name}</Text>
              <Text>{friend.nickname}</Text>
            </View>
            <View>
              <Text>{friend.statusEmoji}</Text>
              <Text>{friend.statusText}</Text>
            </View>
          </View>
        ))}
        <Text>Смахни влево, чтобы удалить друга</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
})