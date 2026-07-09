// TO DO: CONFIRM

import {useAuth} from "@/contexts/auth.context";
import {
  avatars_bucket_id,
  database_id,
  profiles_table_id,
  storage,
  tablesDB,
} from "@/lib/appwrite";
import {useCallback, useState} from "react";
import {Alert, Button, Pressable, StyleSheet, Text, View} from "react-native";
import {ID, Models, Permission, Role} from "react-native-appwrite";
import * as ImagePicker from "expo-image-picker";
import {AvatarAsset} from "@/contexts/reg.context";
import {useFocusEffect, useRouter} from "expo-router";
import {Avatar} from "@/components/Avatar";
import {TextInput} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";

export default function ProfileEditScreen() {
  const [myProfile, setMyProfile] = useState<Models.DefaultRow | null>(null);
  const [newName, setNewName] = useState("");
  const [newNickName, setNewNickName] = useState("");
  const [error, setError] = useState("");
  const [avatarAsset, setAvatarAsset] = useState<AvatarAsset | null>(null);
  const {user} = useAuth();
  const router = useRouter();

  const fetchMyProfile = async () => {
    if (!user) return;
    const profile = await tablesDB.getRow({
      databaseId: database_id,
      tableId: profiles_table_id,
      rowId: user.$id,
    });
    setMyProfile(profile);
    setNewName(profile.name);
    setNewNickName(profile.nickname);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyProfile();
    }, [user]),
  );

  if (!user || !myProfile) return null;

  const handleChangeName = async (newName: string) => {
    try {
      await tablesDB.updateRow({
        databaseId: database_id,
        tableId: profiles_table_id,
        rowId: user.$id,
        data: {
          name: newName,
        },
      });
    } catch {
      setError("Что то пошло не так при изменении имени");
    }
  };

  const handleChangeNickname = async (newNickname: string) => {
    try {
      await tablesDB.updateRow({
        databaseId: database_id,
        tableId: profiles_table_id,
        rowId: user.$id,
        data: {
          nickname: newNickname,
        },
      });
    } catch {
      setError("Что то пошло не так при изменении никнейма");
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Что то пошло не так при выборе фото");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const newAsset = {
        uri: asset.uri,
        fileName: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpg",
        fileSize: asset.fileSize ?? 0,
      };
      setAvatarAsset(newAsset);

      const avatarFileId = ID.unique();

      try {
        await storage.createFile({
          bucketId: avatars_bucket_id,
          fileId: avatarFileId,
          file: {
            name: newAsset.fileName,
            type: newAsset.mimeType,
            size: newAsset.fileSize,
            uri: newAsset.uri,
          },
          permissions: [
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        });

        const avatarURL = storage
          .getFileViewURL(avatars_bucket_id, avatarFileId)
          .toString();

        await tablesDB.updateRow({
          databaseId: database_id,
          tableId: profiles_table_id,
          rowId: user.$id,
          data: {
            avatarFileId: avatarFileId,
            avatarURL: avatarURL,
          },
        });

        if (myProfile.avatarURL !== null) {
          await storage.deleteFile({
            bucketId: avatars_bucket_id,
            fileId: myProfile.avatarFileId,
          });
        }

        fetchMyProfile();
      } catch {
        setError("Что то пошло не так при выборе аватара");
      }
    }
  };

  const handleTakeImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Что то пошло не так при выборе фото");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const newAsset = {
        uri: asset.uri,
        fileName: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpg",
        fileSize: asset.fileSize ?? 0,
      };
      setAvatarAsset(newAsset);

      const avatarFileId = ID.unique();

      try {
        await storage.createFile({
          bucketId: avatars_bucket_id,
          fileId: avatarFileId,
          file: {
            name: newAsset.fileName,
            type: newAsset.mimeType,
            size: newAsset.fileSize,
            uri: newAsset.uri,
          },
          permissions: [
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        });

        const avatarURL = storage
          .getFileViewURL(avatars_bucket_id, avatarFileId)
          .toString();

        await tablesDB.updateRow({
          databaseId: database_id,
          tableId: profiles_table_id,
          rowId: user.$id,
          data: {
            avatarFileId: avatarFileId,
            avatarURL: avatarURL,
          },
        });

        if (myProfile.avatarURL !== null) {
          await storage.deleteFile({
            bucketId: avatars_bucket_id,
            fileId: myProfile.avatarFileId,
          });
        }

        fetchMyProfile();
      } catch {
        setError("Что то пошло не так при выборе аватара");
      }
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Изменить фото", undefined, [
      {text: "Сделать фото", onPress: handleTakeImage},
      {text: "Выбрать из галереи", onPress: handlePickImage},
      {text: "Отмена", style: "cancel"},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Pressable
            style={({pressed}) => [
              styles.headerLeft,
              pressed && styles.donePressed,
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#2C2C2A" />
            <Text style={styles.headerTitle}>Редактировать</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              handleChangeName(newName);
              handleChangeNickname(newNickName);
            }}
            style={({pressed}) => pressed && styles.donePressed}
          >
            <Text style={styles.headerDone}>Готово</Text>
          </Pressable>
        </View>

        <View style={styles.avatarSection}>
          <Pressable style={styles.avatarWrapper} onPress={handleChangePhoto}>
            <Avatar
              source={
                avatarAsset
                  ? {uri: avatarAsset.uri}
                  : myProfile.avatarURL
                    ? {uri: myProfile.avatarURL}
                    : null
              }
              name={myProfile.name}
              size={104}
            />
            <View style={styles.avatarCameraBtn}>
              <Ionicons name="camera" size={17} color="#FFFFFF" />
            </View>
          </Pressable>
          <Pressable onPress={handleChangePhoto} style={({pressed}) => pressed && styles.donePressed}>
            <Text style={styles.changePhotoText}>Изменить фото</Text>
          </Pressable>
        </View>

        <View style={styles.nameGroup}>
          <Text style={styles.fieldLabel}>ИМЯ</Text>
          <View style={styles.inputBox}>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Введите имя"
              placeholderTextColor="#888780"
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={styles.nickGroup}>
          <Text style={styles.fieldLabel}>НИКНЕЙМ</Text>
          <View style={styles.inputBox}>
            <Text style={styles.nicknameDog}>@</Text>
            <TextInput
              autoCapitalize="none"
              style={[styles.input]}
              value={newNickName}
              onChangeText={setNewNickName}
              placeholder="Введите никнейм"
              placeholderTextColor="#888780"
              returnKeyType="done"
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: "#2C2C2A",
  },
  headerDone: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D85A30",
  },
  avatarSection: {
    marginTop: 22,
    alignItems: "center",
  },
  avatarWrapper: {
    width: 104,
    height: 104,
  },
  avatarCameraBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#D85A30",
    borderWidth: 3,
    borderColor: "#F1EFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#D85A30",
    textAlign: "center",
  },
  nameGroup: {
    marginTop: 26,
    gap: 7,
  },
  nickGroup: {
    marginTop: 18,
    gap: 7,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: "#888780",
  },
  inputBox: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2A",
  },
  inputMono: {
    fontFamily: "Courier New",
  },
  atSign: {
    fontSize: 15,
    color: "#888780",
    fontFamily: "Courier New",
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#E24B4A",
    textAlign: "center",
  },
  donePressed: {
    opacity: 0.5,
  },
  nicknameDog: {
    fontSize: 15,
    color: "#A8A79F"
  }
});
