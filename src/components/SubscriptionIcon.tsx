import { Image, ImageSourcePropType, View } from "react-native";
import { SvgUri } from "react-native-svg";

type IconifySource = { uri: string; iconify: true };

type Props = {
  source: ImageSourcePropType | IconifySource;
  size: number;
  className?: string;
};

export default function SubscriptionIcon({ source, size, className }: Props) {
  if (typeof source === "object" && source !== null && "iconify" in source) {
    return (
      <View
        className={className}
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      >
        <SvgUri uri={source.uri} width={size} height={size} />
      </View>
    );
  }

  return <Image source={source} className={className} style={{ width: size, height: size }} />;
}
