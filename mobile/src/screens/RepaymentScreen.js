import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Screen from "../components/Screen";
import PrimaryButton from "../components/PrimaryButton";
import api from "../services/api";

const statusIcon = { PAID: "✅", PENDING: "⏳", LATE: "🔴", MISSED: "🔴" };

export default function RepaymentScreen() {
  const [rows, setRows] = useState([]);
  const [loanId, setLoanId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("cached_loans").then((raw) => {
      const loans = raw ? JSON.parse(raw) : [];
      const active = loans.find((l) => l.status === "ACTIVE");
      if (!active) return;
      setLoanId(active.id);
      AsyncStorage.getItem("cached_repayments").then((repRaw) => {
        const repMap = repRaw ? JSON.parse(repRaw) : {};
        setRows(repMap[active.id] || []);
      });
    });
  }, []);

  const repay = async () => {
    if (!loanId) return;
    await api.post(`/loans/${loanId}/repay`);
  };

  const hasLate = rows.some((r) => ["LATE", "MISSED"].includes(r.status));
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Remboursements</Text>
      {hasLate && (
        <View style={{ backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8 }}>
          <Text style={{ color: "#991B1B" }}>Retard detecte - Penalite 10 DT</Text>
        </View>
      )}
      {rows.map((r) => (
        <View key={r.id} style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12 }}>
          <Text>
            {statusIcon[r.status]} Semaine {r.weekNumber}: {r.amount} DT
          </Text>
          <Text>Due: {new Date(r.dueDate).toLocaleDateString()}</Text>
        </View>
      ))}
      <PrimaryButton title="Payer maintenant" onPress={repay} />
    </Screen>
  );
}
