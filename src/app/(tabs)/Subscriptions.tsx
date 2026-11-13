import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/src/components/SubscriptionsProvider";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [query, setQuery] = useState("");
  const { subscriptions } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.billing,
        subscription.status,
        subscription.paymentMethod,
      ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <FlatList
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 600,
            alignSelf: "center",
          }}
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListHeaderComponent={
            <View className="subscriptions-header">
              <Text className="subscriptions-title">Subscriptions</Text>
              <View className="subscriptions-search">
                <Text
                  className="subscriptions-search-icon"
                  accessibilityLabel="Search"
                >
                  ⌕
                </Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search subscriptions"
                  placeholderTextColor="rgba(8, 17, 38, 0.5)"
                  accessibilityLabel="Search subscriptions"
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  className="subscriptions-search-input"
                />
              </View>
              <Text className="subscriptions-count">
                {filteredSubscriptions.length}{" "}
                {filteredSubscriptions.length === 1
                  ? "subscription"
                  : "subscriptions"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text className="home-empty-state">
              {query.trim()
                ? `No subscriptions found for “${query.trim()}”.`
                : "No subscriptions yet."}
            </Text>
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-30"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
