import "@/global.css";
import { Text, View, Image } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { HOME_BALANCE, HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from 'dayjs';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* Home Header */}
      <View className="home-header">

        {/* Home User Name */}
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>

        {/* Add Button Icon */}
        <Image source={icons.add} className="home-add-icon"/>
      </View>

      {/* Home Balance Card */}
      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>

        <View className="home-balance-row">
          <Text className="home-balance-amount">
            {formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
          </Text>
        </View>

      </View>

    </SafeAreaView>
  );
}
