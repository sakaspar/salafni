import React, { useState } from "react";
import { Text, TextInput, View, ScrollView, TouchableOpacity } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

const OCCUPATIONS = [
  { label: "Employé secteur public", value: "EMPLOYED_PUBLIC" },
  { label: "Employé secteur privé", value: "EMPLOYED_PRIVATE" },
  { label: "Freelance / Indépendant", value: "FREELANCER" },
  { label: "Travailleur informel", value: "INFORMAL" },
  { label: "Étudiant", value: "STUDENT" },
  { label: "Sans emploi", value: "JOBLESS" },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    phone: "",
    fullName: "",
    nationalId: "",
    email: "",
    occupation: "EMPLOYED_PRIVATE",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/client/register", form);
      navigation.navigate("Otp", { phone: form.phone, email: form.email, password: form.password });
    } catch (e) {
      setError(e.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>Inscription</Text>

        <View style={{ gap: 12 }}>
          <Input label="Téléphone" value={form.phone} onChangeText={(v) => setForm({...form, phone: v})} keyboardType="phone-pad" />
          <Input label="Nom complet" value={form.fullName} onChangeText={(v) => setForm({...form, fullName: v})} />
          <Input label="CIN (8 chiffres)" value={form.nationalId} onChangeText={(v) => setForm({...form, nationalId: v})} keyboardType="numeric" maxLength={8} />
          <Input label="Email" value={form.email} onChangeText={(v) => setForm({...form, email: v})} keyboardType="email-address" autoCapitalize="none" />

          <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B", marginTop: 8 }}>Occupation</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {OCCUPATIONS.map((occ) => (
              <TouchableOpacity
                key={occ.value}
                onPress={() => setForm({...form, occupation: occ.value})}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: form.occupation === occ.value ? "#1B4FD8" : "#CBD5E1",
                  backgroundColor: form.occupation === occ.value ? "#1B4FD8" : "transparent"
                }}
              >
                <Text style={{ fontSize: 12, color: form.occupation === occ.value ? "white" : "#64748B" }}>{occ.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Mot de passe" value={form.password} onChangeText={(v) => setForm({...form, password: v})} secureTextEntry />
        </View>

        {!!error && <Text style={{ color: "red", marginTop: 12 }}>{error}</Text>}

        <View style={{ marginTop: 30, marginBottom: 40 }}>
          <PrimaryButton title={loading ? "Envoi..." : "Continuer"} onPress={submit} disabled={loading} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Input({ label, ...props }) {
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B", marginBottom: 4 }}>{label}</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12, fontSize: 16 }}
        {...props}
      />
    </View>
  );
}
