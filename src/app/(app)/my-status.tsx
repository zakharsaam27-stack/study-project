// PLURAL ACCORDING TO GENDER

import {useAuth} from "@/contexts/auth.context";
import {database_id, profiles_table_id, tablesDB} from "@/lib/appwrite";
import {useFocusEffect} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {EmojiKeyboard} from "rn-emoji-keyboard";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import {useHideTabBar} from "@/contexts/tabbar.context";

type StatusPreset = {
  statusEmoji: string;
  statusText: string;
  statusBusyness: "free" | "busy";
};

export default function MyStatusScreen() {
  const {user} = useAuth();
  const {setIsTabBarHidden} = useHideTabBar();
  const [statusEmoji, setStatusEmoji] = useState("🤔");
  const [statusText, setStatusText] = useState("Неизвестно");
  const [customStatusEmoji, setCustomStatusEmoji] = useState("✏️");
  const [customStatusText, setCustomStatusText] = useState("");
  const [statusUpdatedAt, setStatusUpdatedAt] = useState("");
  const [statusBusyness, setStatusBusyness] = useState<"busy" | "free">("busy");
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const fetchCurrentStatus = async () => {
        if (!user) {
          return null;
        }
        try {
          const currentStatus = await tablesDB.getRow({
            databaseId: database_id,
            tableId: profiles_table_id,
            rowId: user?.$id,
          });
          setStatusEmoji(currentStatus.statusEmoji);
          setStatusText(currentStatus.statusText);
          setStatusUpdatedAt(currentStatus.statusUpdatedAt);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCurrentStatus();
    }, []),
  );

  useEffect(() => {
    if (isCustomOpen) {
      setIsTabBarHidden(true);
    } else {
      setIsTabBarHidden(false);
      setIsEmojiPickerOpen(false);
    }
  }, [isCustomOpen]);

  if (!user) {
    return null;
  }

  const handleChangeStatus = async (
    emoji: string,
    text: string,
    busyness: "free" | "busy",
  ) => {
    try {
      const now = new Date().toISOString();
      setStatusEmoji(emoji);
      setStatusText(text);
      setStatusUpdatedAt(now);
      setStatusBusyness(busyness);
      await tablesDB.updateRow({
        databaseId: database_id,
        tableId: profiles_table_id,
        rowId: user?.$id,
        data: {
          statusEmoji: emoji,
          statusText: text,
          statusUpdatedAt: now,
          busyness: busyness,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = () => {
    const oldDate = new Date(statusUpdatedAt);
    const newDate = new Date();
    let gap = (newDate.getTime() - oldDate.getTime()) / (1000 * 60);
    if (gap < 1) {
      return "Обновлено только что";
    } else if (gap === 1) {
      return `Обновлено ${Math.floor(gap)} минутe назад`;
    } else if (1 < gap && gap < 5) {
      return `Обновлено ${Math.floor(gap)} минуты назад`;
    } else if (5 < gap && gap < 60) {
      return `Обновлено ${Math.floor(gap)} минут назад`;
    }
    else if (1 < gap && gap < 60) {
      return `Обновлено ${Math.floor(gap)} минут назад`;
    } else if (60 < gap && gap < 120) {
      return `Обновлено 1 час назад`;
    } else if (120 < gap && gap < 300) {
      return `Обновлено ${Math.floor(gap / 60)} часа назад`;
    } else if (300 < gap && gap < 1440) {
      return `Обновлено ${Math.floor(gap / 60)} часов назад`;
    } else if (1440 < gap && gap < 2880) {
      return `Обновлено ${Math.floor(gap / 1440)} день назад`;
    }
    else if (1440 < gap && gap < 7200) {
      return `Обновлено ${Math.floor(gap / 1440)} дня назад`;
    } else if (7200 < gap) {
      return `Обновлено ${Math.floor(gap / 1440)} дней назад`
    };
  };

  const presets: StatusPreset[] = [
    {
      statusEmoji: "😊",
      statusText: "Свободен",
      statusBusyness: "free",
    },
    {
      statusEmoji: "💼",
      statusText: "Работаю",
      statusBusyness: "busy" as const,
    },
    {
      statusEmoji: "😴",
      statusText: "Сплю",
      statusBusyness: "busy" as const,
    },
    {
      statusEmoji: "🎮",
      statusText: "Играю",
      statusBusyness: "busy" as const,
    },
    {
      statusEmoji: "🤫",
      statusText: "Не беспокоить",
      statusBusyness: "busy" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Мой статус</Text>
      </View>
      <View style={styles.currentStatusBox}>
        <View style={styles.currentStatusIcon}>
          <Text style={styles.currentStatusEmoji}>{statusEmoji}</Text>
        </View>
        <View style={styles.currentStatusInfo}>
          <Text style={styles.currentStatusLabel}>Текущий статус</Text>
          <Text style={styles.currentStatusText}>{statusText}</Text>
          <Text style={styles.currentStatusUpdatedAt}>
            {formatRelativeTime()}
          </Text>
        </View>
      </View>
      <Text style={styles.sectionLabel}>Быстрый выбор</Text>
      <View style={styles.presetsGrid}>
        {presets.map((preset) => {
          const isSelected =
            preset.statusEmoji === statusEmoji &&
            preset.statusText === statusText;
          return (
            <Pressable
              key={preset.statusText}
              style={({pressed}) => [
                styles.tile,
                isSelected && styles.tileSelected,
                pressed && {opacity: 0.7},
              ]}
              onPress={() =>
                handleChangeStatus(
                  preset.statusEmoji,
                  preset.statusText,
                  preset.statusBusyness,
                )
              }
            >
              <Text style={styles.emoji}>{preset.statusEmoji}</Text>
              <Text style={styles.label}>{preset.statusText}</Text>
            </Pressable>
          );
        })}
        <Pressable
          style={({pressed}) => [
            styles.tile,
            styles.customTile,
            pressed && {opacity: 0.7},
          ]}
          onPress={() => setIsCustomOpen(true)}
        >
          <Text style={styles.emoji}>✏️</Text>
          <Text style={styles.label}>Свой...</Text>
        </Pressable>
      </View>

      {isCustomOpen && (
        <Modal transparent={true}>
          <View style={{flex: 1, justifyContent: "flex-end"}}>
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.backdropOverlay}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setIsCustomOpen(false)}
              />
            </Animated.View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={-insets.top - 33}
            >
              <Animated.View
                entering={SlideInDown}
                exiting={SlideOutDown}
                style={[styles.sheet, {paddingBottom: insets.bottom + 20}]}
              >
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Свой статус</Text>

                <View style={[styles.fieldGroup, {zIndex: 2}]}>
                  <Text style={styles.fieldLabel}>ЭМОДЗИ</Text>
                  <View style={styles.emojiRow}>
                    <Pressable
                      style={({pressed}) => [
                        styles.emojiBox,
                        pressed && {opacity: 0.7},
                      ]}
                      onPress={() => {
                        if (isEmojiPickerOpen === false) {
                          setIsEmojiPickerOpen(true);
                        } else {
                          setIsEmojiPickerOpen(false);
                        }
                      }}
                    >
                      <Text style={styles.emojiBoxText}>
                        {customStatusEmoji}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({pressed}) => [pressed && {opacity: 0.7}]}
                      onPress={() => {
                        if (isEmojiPickerOpen === false) {
                          setIsEmojiPickerOpen(true);
                        } else {
                          setIsEmojiPickerOpen(false);
                        }
                      }}
                    >
                      <Text style={styles.emojiHint}>
                        Нажми, чтобы выбрать эмодзи
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {isEmojiPickerOpen ? (
                  <Animated.View
                    entering={SlideInDown}
                    exiting={SlideOutDown}
                    style={[
                      styles.emojiOverlay,
                      {marginBottom: -(insets.bottom + 20)},
                    ]}
                  >
                    <EmojiKeyboard
                      categoryPosition="bottom"
                      onEmojiSelected={(emojiObject) => {
                        setCustomStatusEmoji(emojiObject.emoji);
                        setIsEmojiPickerOpen(false);
                      }}
                    />
                  </Animated.View>
                ) : (
                  <>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>СТАТУС</Text>
                      <View style={styles.statusToggle}>
                        <Pressable
                          style={[
                            styles.statusToggleOption,
                            statusBusyness === "free" &&
                              styles.statusToggleOptionSelected,
                          ]}
                          onPress={() => setStatusBusyness("free")}
                        >
                          <View
                            style={[
                              styles.statusToggleDot,
                              styles.statusToggleDotFree,
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusToggleText,
                              statusBusyness === "free" &&
                                styles.statusToggleTextSelected,
                            ]}
                          >
                            Свободен
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.statusToggleOption,
                            statusBusyness === "busy" &&
                              styles.statusToggleOptionSelected,
                          ]}
                          onPress={() => setStatusBusyness("busy")}
                        >
                          <View
                            style={[
                              styles.statusToggleDot,
                              styles.statusToggleDotBusy,
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusToggleText,
                              statusBusyness === "busy" &&
                                styles.statusToggleTextSelected,
                            ]}
                          >
                            Занят
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={[styles.fieldGroup, styles.descriptionGroup]}>
                      <Text style={styles.fieldLabel}>ОПИСАНИЕ</Text>
                      <View
                        style={[
                          styles.inputRing,
                          isDescFocused && styles.inputRingFocused,
                        ]}
                      >
                        <View
                          style={[
                            styles.inputRow,
                            isDescFocused && styles.inputRowFocused,
                          ]}
                        >
                          <TextInput
                            style={styles.input}
                            value={customStatusText}
                            onChangeText={setCustomStatusText}
                            placeholder="Введите текст"
                            placeholderTextColor="#888780"
                            maxLength={25}
                            onFocus={() => setIsDescFocused(true)}
                            onBlur={() => setIsDescFocused(false)}
                          />
                          <Text style={styles.charCounter}>
                            {customStatusText.length}/25
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.sheetButtons}>
                      <Pressable
                        style={({pressed}) => [
                          styles.saveButton,
                          pressed && {opacity: 0.85},
                        ]}
                        onPress={() => {
                          handleChangeStatus(
                            customStatusEmoji,
                            customStatusText,
                            statusBusyness,
                          );
                          setIsCustomOpen(false);
                        }}
                      >
                        <Text style={styles.saveButtonText}>Сохранить</Text>
                      </Pressable>
                      <Pressable
                        style={({pressed}) => [
                          styles.cancelButton,
                          pressed && {opacity: 0.7},
                        ]}
                        onPress={() => setIsCustomOpen(false)}
                      >
                        <Text style={styles.cancelButtonText}>Отмена</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFE8",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: "#2C2C2A",
    marginBottom: 18,
  },
  currentStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  currentStatusIcon: {
    backgroundColor: "#FFE3D6",
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  currentStatusInfo: {
    flex: 1,
    gap: 3,
  },
  currentStatusLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#888780",
  },
  currentStatusEmoji: {
    fontSize: 30,
  },
  currentStatusText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#888780",
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    gap: 9,
    width: "47%",
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: "#D85A30",
  },
  customTile: {
    borderStyle: "dashed",
  },
  emoji: {
    fontSize: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2C2C2A",
  },
  currentStatusUpdatedAt: {
    fontSize: 12,
    color: "#888780",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30,22,16,0.5)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -12},
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D3D1C7",
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: "#2C2C2A",
    marginBottom: 18,
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 16,
  },
  descriptionGroup: {
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#888780",
  },
  emojiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emojiBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    backgroundColor: "#F1EFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBoxText: {
    fontSize: 28,
  },
  emojiHint: {
    fontSize: 14,
    color: "#888780",
  },
  inputRing: {
    borderRadius: 13,
    padding: 3,
  },
  inputRingFocused: {
    backgroundColor: "#FAECE7",
  },
  inputRow: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#D3D1C7",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },
  inputRowFocused: {
    borderColor: "#D85A30",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2A",
  },
  charCounter: {
    fontSize: 12,
    color: "#888780",
    fontFamily: "Courier New",
  },
  sheetButtons: {
    gap: 10,
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888780",
  },
  emojiOverlay: {
    height: 320,
    backgroundColor: "#ffffff",
    marginTop: 4,
    marginHorizontal: -24,
  },
  statusToggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 11,
    backgroundColor: "#EDEBE2",
    gap: 3,
  },
  statusToggleOption: {
    flex: 1,
    height: 38,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  statusToggleOptionSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#281E14",
    shadowOffset: {width: 0, height: 1.5},
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  statusToggleDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusToggleDotFree: {
    backgroundColor: "#6BCF9A",
  },
  statusToggleDotBusy: {
    backgroundColor: "#6E6E73",
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5F5E5A",
  },
  statusToggleTextSelected: {
    color: "#2C2C2A",
  },
});
