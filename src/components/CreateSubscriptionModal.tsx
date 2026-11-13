import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import SubscriptionIcon from "@/src/components/SubscriptionIcon";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f2d3b1",
  Cloud: "#c8ddf0",
  Music: "#f3c6d3",
  Other: "#e8e3d5",
};

type Frequency = "Monthly" | "Yearly";

const PLAN_WORDS = new Set([
  "basic",
  "business",
  "family",
  "monthly",
  "plan",
  "premium",
  "pro",
  "subscription",
  "yearly",
]);

function getIconSearchTerms(value: string) {
  const withoutParentheticalDetails = value
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const brandTerms = withoutParentheticalDetails
    .split(/\s+/)
    .filter((term) => term && !PLAN_WORDS.has(term));

  return brandTerms.length ? brandTerms : withoutParentheticalDetails.split(/\s+/);
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Entertainment");
  const [error, setError] = useState("");
  const [matchedIcon, setMatchedIcon] = useState<{ uri: string; iconify: true } | null>(null);
  const [iconSuggestions, setIconSuggestions] = useState<string[]>([]);

  const iconSource = (iconName: string) => {
    const [prefix, name] = iconName.split(":");
    return {
      uri: `https://api.iconify.design/${prefix}/${name}.svg?color=%23081126`,
      iconify: true as const,
    };
  };

  useEffect(() => {
    const queryTerms = getIconSearchTerms(name);
    const query = queryTerms.join(" ");
    if (!visible || query.length < 2) return;

    let isCurrentRequest = true;
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=32`,
        );
        if (!response.ok) return;

        const result = (await response.json()) as { icons?: string[] };
        if (!isCurrentRequest) return;
        const recommendations = (result.icons ?? []).sort((first, second) => {
          const rank = (iconName: string) => {
            const [prefix, slug = ""] = iconName.split(":");
            const normalizedSlug = slug.replace(/-/g, " ");
            const exactMatch = normalizedSlug === query;
            const matchedTerms = queryTerms.filter((term) => normalizedSlug.includes(term)).length;
            return (exactMatch ? 100 : 0) + matchedTerms * 10 + (prefix === "simple-icons" ? 2 : 0);
          };

          return rank(second) - rank(first);
        });
        setIconSuggestions(recommendations.slice(0, 8));
        if (!recommendations.length) {
          setMatchedIcon(null);
          return;
        }

        setMatchedIcon(iconSource(recommendations[0]));
      } catch {
        if (isCurrentRequest) {
          setMatchedIcon(null);
          setIconSuggestions([]);
        }
      }
    }, 350);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeout);
    };
  }, [name, visible]);

  const numericPrice = Number(price);
  const isValid = name.trim().length > 0 && Number.isFinite(numericPrice) && numericPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setError("");
    setMatchedIcon(null);
    setIconSuggestions([]);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Enter a subscription name.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }

    const startDate = dayjs();
    onCreate({
      id: `subscription-${Date.now()}`,
      name: name.trim(),
      price: numericPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: startDate.add(frequency === "Monthly" ? 1 : 1, frequency === "Monthly" ? "month" : "year").toISOString(),
      icon: matchedIcon ?? icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category],
      currency: "PHP",
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="modal-overlay">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Close new subscription form"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="modal-container"
          style={{ width: "100%", alignSelf: "center" }}
        >
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              onPress={onClose}
              className="modal-close"
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="modal-body"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              {matchedIcon ? (
                <SubscriptionIcon source={matchedIcon} size={48} className="self-start rounded-xl bg-card" />
              ) : null}
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError("");
                  setMatchedIcon(null);
                  setIconSuggestions([]);
                }}
                placeholder="e.g. Netflix"
                placeholderTextColor="#65728a"
                accessibilityLabel="Name"
                autoCapitalize="words"
                className="auth-input w-full"
                style={{ paddingHorizontal: 20 }}
              />
              {iconSuggestions.length > 0 ? (
                <View className="mt-2 gap-2">
                  <Text className="auth-helper">Icon suggestions</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerClassName="flex-row gap-2"
                  >
                    {iconSuggestions.map((suggestion) => {
                      const source = iconSource(suggestion);
                      const selected = matchedIcon?.uri === source.uri;
                      return (
                        <Pressable
                          key={suggestion}
                          onPress={() => setMatchedIcon(source)}
                          className={clsx(
                            "items-center gap-1 rounded-xl border border-border bg-card px-3 py-2",
                            selected && "border-accent bg-accent/10",
                          )}
                          accessibilityRole="button"
                          accessibilityLabel={`Use ${suggestion.split(":")[1]} icon`}
                          accessibilityState={{ selected }}
                        >
                          <SubscriptionIcon source={source} size={32} />
                          <Text className="max-w-20 text-center text-xs font-sans-medium text-primary" numberOfLines={1}>
                            {suggestion.split(":")[1].replaceAll("-", " ")}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                value={price}
                onChangeText={(value) => {
                  setPrice(value);
                  setError("");
                }}
                placeholder="0.00"
                placeholderTextColor="#65728a"
                accessibilityLabel="Price"
                keyboardType="decimal-pad"
                inputMode="decimal"
                className="auth-input w-full"
                style={{ paddingHorizontal: 20 }}
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as const).map((option) => {
                  const active = frequency === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setFrequency(option)}
                      className={clsx("picker-option", active && "picker-option-active")}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          active && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map((option) => {
                  const active = category === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setCategory(option)}
                      className={clsx("category-chip", active && "category-chip-active")}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          active && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!isValid}
              className={clsx("auth-button", !isValid && "auth-button-disabled")}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isValid }}
            >
              <Text className="auth-button-text">Create Subscription</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
