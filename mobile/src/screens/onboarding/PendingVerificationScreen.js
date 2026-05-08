import React from "react";
import { Text } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function PendingVerificationScreen({ navigation }) {
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Verification en attente</Text>
      <Text>Compte cree</Text>
      <Text>KYC soumis</Text>
      <Text>Validation admin en cours</Text>
      <PrimaryButton title="Entrer en mode demo" onPress={() => navigation.replace("Home")} />
    </Screen>
  );
}
