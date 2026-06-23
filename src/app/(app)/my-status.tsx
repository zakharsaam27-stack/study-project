import {useAuth} from "@/contexts/auth.context";
import {database_id, profiles_table_id, tablesDB} from "@/lib/appwrite";
import {useEffect, useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function MyStatusScreen() {
  const {user} = useAuth();
  const [statusEmoji, setStatusEmoji] = useState("🤔");
  const [statusText, setStatusText] = useState("Неизвестно");
  const [statusUpdatedAt, setStatusUpdatedAt] = useState("");

  useEffect(() => {
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
  }, []);

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
        <Text style={styles.currentStatusLabel}>Текущий статус</Text>
        <Text style={styles.currentStatusEmoji}>{statusEmoji}</Text>
        <Text style={styles.currentStatusText}>{statusText}</Text>
        <Text style={styles.currentStatusUpdatedAt}>{formatRelativeTime()}</Text>
      </View>
      <View style={styles.presetsGrid}>
        {presets.map((preset) => (
          <Pressable
            key={preset.statusText}
            style={styles.tile}
            onPress={() =>
              handleChangeStatus(preset.statusEmoji, preset.statusText)
            }
          >
            <Text style={styles.emoji}>{preset.statusEmoji}</Text>
            <Text style={styles.label}>{preset.statusText}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  currentStatusBox: {
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  currentStatusLabel: {
    fontSize: 12,
    color: "#888780",
    marginBottom: 6,
  },
  currentStatusEmoji: {
    fontSize: 32,
  },
  currentStatusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    borderWidth: 1,
    borderColor: "#D3D1C7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
  },
  currentStatusUpdatedAt: {
    fontSize: 12,
    color: "#888780",
    marginTop: 6,
  },
});

