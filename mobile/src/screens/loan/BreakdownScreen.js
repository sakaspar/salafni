import React from "react";
import { Text } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function BreakdownScreen({ navigation, route }) {
  const amount = Number(route.params.amount);
  const fee = Number((amount * 0.05).toFixed(2));
  const total = amount + fee;
  const weekly = Number((total / 4).toFixed(2));
  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Breakdown</Text>
      <Text>Principal: {amount} DT</Text>
      <Text>Fee (5%): {fee} DT</Text>
      <Text>Total repayable: {total} DT</Text>
      <Text>Weekly x4: {weekly} DT</Text>
      <PrimaryButton
        title="Confirmer"
        onPress={() =>
          navigation.navigate("Confirmation", { ...route.params, amount, fee, total, weekly })
        }
      />
    </Screen>
  );
}
