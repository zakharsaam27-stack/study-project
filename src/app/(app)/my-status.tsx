// TO DO: CUSTOM STATUS, PLURAL ACCORDING TO GENDER

import {useAuth} from "@/contexts/auth.context";
import {database_id, profiles_table_id, tablesDB} from "@/lib/appwrite";
import { useFocusEffect } from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function MyStatusScreen() {
  const {user} = useAuth();
  const [statusEmoji, setStatusEmoji] = useState("🤔");
  const [statusText, setStatusText] = useState("Неизвестно");
  const [statusUpdatedAt, setStatusUpdatedAt] = useState("");

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
        setStatusUpdatedAt(currentStatus.statusUpdatedAt)
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentStatus();
    }, []))

  if (!user) {
    return null;
  }

  const handleChangeStatus = async (emoji: string, text: string) => {
    try {
      const now = new Date().toISOString()

      setStatusEmoji(emoji);
      setStatusText(text);
      setStatusUpdatedAt(now)
      await tablesDB.updateRow({
        databaseId: database_id,
        tableId: profiles_table_id,
        rowId: user?.$id,
        data: {
          statusEmoji: emoji,
          statusText: text,
          statusUpdatedAt: now,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

   const formatRelativeTime = () => {
    const oldDate = new Date(statusUpdatedAt)
    const newDate = new Date()
    let gap = (newDate.getTime() - oldDate.getTime()) / (1000 * 60)
    if (gap < 1) {
        return (
            "Обновлено только что"
        )
    } else if (1 < gap && gap < 60) {
        return (
            `Обновлено ${Math.floor(gap)} минут назад`
        )
    } else if (60 < gap && gap < 120) {
        return (
            `Обновлено 1 час назад`
        )
    } else if (120 < gap && gap < 300) {
        return (
            `Обновлено ${Math.floor(gap / 60)} часа назад`
        )
    } else if (300 < gap && gap < 1440) {
        return (
            `Обновлено ${Math.floor(gap / 60)} часов назад`
        )
    } else if (1440 < gap && gap < 7200) {
        return `Обновлено ${Math.floor(gap / 1440)} дня назад`
    } else if (7200 < gap) {
        return `Обновлено ${Math.floor(gap / 1440)} дней назад`
    }
   }

  const presets = [
    {
      statusEmoji: "😊",
      statusText: "Свободен",
    },
    {
      statusEmoji: "💼",
      statusText: "Работаю",
    },
    {
      statusEmoji: "😴",
      statusText: "Сплю",
    },
    {
      statusEmoji: "🎮",
      statusText: "Играю",
    },
    {
      statusEmoji: "🤫",
      statusText: "Не беспокоить",
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
          <Text style={styles.currentStatusUpdatedAt}>{formatRelativeTime()}</Text>
        </View>
      </View>
      <Text style={styles.sectionLabel}>Быстрый выбор</Text>
      <View style={styles.presetsGrid}>
        {presets.map((preset) => {
          const isSelected = preset.statusEmoji === statusEmoji && preset.statusText === statusText;
          return (
            <Pressable
              key={preset.statusText}
              style={[styles.tile, isSelected && styles.tileSelected]}
              onPress={() =>
                handleChangeStatus(preset.statusEmoji, preset.statusText)
              }
            >
              <Text style={styles.emoji}>{preset.statusEmoji}</Text>
              <Text style={styles.label}>{preset.statusText}</Text>
            </Pressable>
          );
        })}
      </View>
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
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#E1F5EE",
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
    shadowColor: "#D85A30",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
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
});
