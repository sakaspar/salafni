import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

export default function KycUploadScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [uploaded, setUploaded] = useState({
    front: false,
    back: false,
    selfie: false,
    proof: false,
  });

  useEffect(() => {
    api.get("/client/me").then(res => setProfile(res.data.data.user)).catch(e => console.log(e));
  }, []);

  const isEmployed = profile?.occupation === "EMPLOYED_PUBLIC" || profile?.occupation === "EMPLOYED_PRIVATE";

  const canContinue = uploaded.front && uploaded.back && uploaded.selfie && (!isEmployed || uploaded.proof);

  if (!profile) return <Screen><Text>Chargement...</Text></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>Vérification d'identité</Text>
        <Text style={{ color: "#64748B", marginBottom: 20 }}>Veuillez fournir les documents suivants pour valider votre compte.</Text>

        {profile.kycStatus === "REJECTED" && (
          <View style={{ backgroundColor: "#FEF2F2", padding: 12, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: "#EF4444", marginBottom: 20 }}>
            <Text style={{ color: "#991B1B", fontWeight: "bold" }}>KYC Rejeté</Text>
            <Text style={{ color: "#B91C1C", fontSize: 12 }}>Raison: {profile.kycRejectionReason}</Text>
          </View>
        )}

        <View style={{ gap: 16 }}>
          <DocCard
            title="CIN Recto"
            done={uploaded.front}
            onPress={() => setUploaded({...uploaded, front: true})}
          />
          <DocCard
            title="CIN Verso"
            done={uploaded.back}
            onPress={() => setUploaded({...uploaded, back: true})}
          />
          <DocCard
            title="Selfie"
            done={uploaded.selfie}
            onPress={() => setUploaded({...uploaded, selfie: true})}
          />

          {isEmployed && (
            <DocCard
              title="3 derniers relevés bancaires"
              subtitle="Requis pour les employés"
              done={uploaded.proof}
              onPress={() => setUploaded({...uploaded, proof: true})}
            />
          )}
        </View>

        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <PrimaryButton
            title={profile.kycStatus === "REJECTED" ? "Soumettre à nouveau" : "Continuer"}
            onPress={() => navigation.replace("PendingVerification")}
            disabled={!canContinue}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function DocCard({ title, subtitle, done, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderWidth: 1,
        borderColor: done ? "#22C55E" : "#CBD5E1",
        borderRadius: 12,
        backgroundColor: done ? "#F0FDF4" : "white"
      }}
    >
      <View>
        <Text style={{ fontWeight: "600", fontSize: 16 }}>{title}</Text>
        {!!subtitle && <Text style={{ fontSize: 12, color: "#64748B" }}>{subtitle}</Text>}
      </View>
      <Text style={{ fontSize: 20 }}>{done ? "✅" : "📸"}</Text>
    </TouchableOpacity>
  );
}
