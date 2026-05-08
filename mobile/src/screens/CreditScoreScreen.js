import React from "react";
import { Text, View } from "react-native";
import Screen from "../components/Screen";

export default function CreditScoreScreen() {
  const score = 72;
  const tier = "TRUSTED";
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Credit Score</Text>
      <View
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          borderWidth: 12,
          borderColor: "#1B4FD8",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text style={{ fontSize: 38, fontWeight: "800" }}>{score}</Text>
      </View>
      <Text>Tier: {tier}</Text>
      <View style={{ height: 10, backgroundColor: "#E2E8F0", borderRadius: 10 }}>
        <View style={{ width: "72%", height: 10, backgroundColor: "#1B4FD8", borderRadius: 10 }} />
      </View>
      <Text>2 remboursements propres restants vers ESTABLISHED</Text>
      <Text>Historique: +10 paiement a temps, +5 pret complete</Text>
      <Text>Conseils: payer a temps, eviter les retards.</Text>
    </Screen>
  );
}
