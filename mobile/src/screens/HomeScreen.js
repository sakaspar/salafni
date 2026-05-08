import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Screen from "../components/Screen";
import PrimaryButton from "../components/PrimaryButton";
import { TIER_COLORS } from "../constants/tiers";
import { cacheLoansAndRepayments } from "../services/api";

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState({ creditTier: "STARTER", creditScore: 50 });
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    cacheLoansAndRepayments();
    AsyncStorage.getItem("cached_loans").then((raw) => {
      const data = raw ? JSON.parse(raw) : [];
      setLoan(data.find((l) => l.status === "ACTIVE") || null);
    });
  }, []);

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Accueil</Text>
      <View style={{ backgroundColor: TIER_COLORS[profile.creditTier], borderRadius: 12, padding: 16 }}>
        <Text>Tier: {profile.creditTier}</Text>
        <Text>Score: {profile.creditScore}/100</Text>
        <Text>300 DT disponible</Text>
      </View>
      {!!loan && (
        <View style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12 }}>
          <Text>Active loan: {loan.amount} DT</Text>
          <Text>Next weekly payment: {loan.weeklyPayment} DT</Text>
        </View>
      )}
      <PrimaryButton title="Demander un pret" onPress={() => navigation.navigate("MerchantSearch")} />
      <PrimaryButton title="Mes remboursements" onPress={() => navigation.navigate("Repayments")} accent />
      <PrimaryButton title="Score credit" onPress={() => navigation.navigate("CreditScore")} />
      <PrimaryButton title="Profil" onPress={() => navigation.navigate("Profile")} />
    </Screen>
  );
}
