import React, { useState } from "react";
import { Text } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function AmountSelectorScreen({ navigation, route }) {
  const [amount, setAmount] = useState(300);
  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Montant</Text>
      <Text>{amount} DT</Text>
      <PrimaryButton title="+50 DT" onPress={() => setAmount((v) => Math.min(1500, v + 50))} />
      <PrimaryButton title="-50 DT" onPress={() => setAmount((v) => Math.max(50, v - 50))} accent />
      <PrimaryButton
        title="Continuer"
        onPress={() => navigation.navigate("Breakdown", { merchant: route.params.merchant, amount })}
      />
    </Screen>
  );
}
