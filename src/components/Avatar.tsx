import {useState} from "react";
import {Image, ImageSourcePropType, StyleSheet, Text, View} from "react-native";

interface AvatarProps {
  source: ImageSourcePropType | null;
  name: string;
  size: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = "?",
  size = 50,
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  };

  const renderFallback = () => (
    <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2}]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
    </View>
  );

  if (!source || hasError) {
    return renderFallback();
  }

  return (
    <Image
      source={source}
      onError={() => setHasError(true)}
      style={{width: size, height: size, borderRadius: size / 2}}
    />
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: "#D85A30",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
