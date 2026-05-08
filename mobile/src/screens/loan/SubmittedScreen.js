import React from "react";
import { Text } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function SubmittedScreen({ navigation }) {
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Demande soumise</Text>
      <Text>Votre demande est en attente d'approbation admin.</Text>
      <PrimaryButton title="Retour accueil" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}
