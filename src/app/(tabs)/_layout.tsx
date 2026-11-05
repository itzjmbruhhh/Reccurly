import { Tabs } from "expo-router";

const TabLayout = () => (
  <Tabs screenOptions={{ headerShown: false }}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="Subscriptions" options={{ title: "Subscriptions" }} />
    <Tabs.Screen name="Insights" options={{ title: "Insights" }} />
    <Tabs.Screen name="Settings" options={{ title: "Settings" }} />
  </Tabs>
);

export default TabLayout;