import React, { useState } from "react";
import { Switch, Text } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

export default function ConfirmationScreen({ navigation, route }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/loans/apply", { merchantId: route.params.merchant.id, amount: route.params.amount });
      navigation.replace("Submitted");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Confirmation</Text>
      <Text>Marchand: {route.params.merchant.businessName}</Text>
      <Text>Montant: {route.params.amount} DT</Text>
      <Text>J'accepte les conditions</Text>
      <Switch value={accepted} onValueChange={setAccepted} />
      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
      <PrimaryButton title={loading ? "..." : "Soumettre"} onPress={submit} disabled={!accepted || loading} />
    </Screen>
  );
}
