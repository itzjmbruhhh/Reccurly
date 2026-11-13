import { useState } from "react";
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

  const numericPrice = Number(price);
  const isValid = name.trim().length > 0 && Number.isFinite(numericPrice) && numericPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setError("");
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
      icon: icons.wallet,
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
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError("");
                }}
                placeholder="e.g. Netflix"
                placeholderTextColor="#65728a"
                accessibilityLabel="Name"
                autoCapitalize="words"
                className="auth-input"
              />
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
                className="auth-input"
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
