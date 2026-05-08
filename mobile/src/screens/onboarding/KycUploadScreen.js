import React, { useState } from "react";
import { Text } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function KycUploadScreen({ navigation }) {
  const [uploaded, setUploaded] = useState({
    front: false,
    back: false,
    selfie: false,
    proof: false,
  });
  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>KYC Upload</Text>
      <Text>CIN front: {uploaded.front ? "OK" : "Pending"}</Text>
      <Text>CIN back: {uploaded.back ? "OK" : "Pending"}</Text>
      <Text>Selfie: {uploaded.selfie ? "OK" : "Pending"}</Text>
      <Text>Proof occupation: {uploaded.proof ? "OK" : "Optional"}</Text>
      <PrimaryButton title="Capture CIN Front" onPress={() => setUploaded((p) => ({ ...p, front: true }))} />
      <PrimaryButton title="Capture CIN Back" onPress={() => setUploaded((p) => ({ ...p, back: true }))} />
      <PrimaryButton title="Capture Selfie" onPress={() => setUploaded((p) => ({ ...p, selfie: true }))} />
      <PrimaryButton title="Continuer" onPress={() => navigation.replace("PendingVerification")} />
    </Screen>
  );
}
