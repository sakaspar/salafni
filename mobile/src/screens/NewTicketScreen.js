import React, { useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

const CATEGORIES = [
  { label: "Problème de prêt", value: "LOAN_ISSUE" },
  { label: "Problème de remboursement", value: "REPAYMENT_ISSUE" },
  { label: "Problème de compte", value: "ACCOUNT_ISSUE" },
  { label: "KYC / Vérification", value: "KYC_ISSUE" },
  { label: "Autre", value: "OTHER" },
];

export default function NewTicketScreen({ navigation }) {
  const [form, setForm] = useState({
    subject: "",
    category: "OTHER",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.subject || !form.description) return;
    setLoading(true);
    try {
      await api.post("/support/tickets", form);
      navigation.goBack();
    } catch (e) {
      alert("Erreur lors de la création du ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>Nouveau Ticket</Text>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B", marginBottom: 4 }}>Catégorie</Text>
            <View style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10 }}>
              <Picker
                selectedValue={form.category}
                onValueChange={(itemValue) => setForm({...form, category: itemValue})}
              >
                {CATEGORIES.map(c => <Picker.Item key={c.value} label={c.label} value={c.value} />)}
              </Picker>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B", marginBottom: 4 }}>Sujet</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12 }}
              placeholder="En quoi pouvons-nous vous aider ?"
              value={form.subject}
              onChangeText={v => setForm({...form, subject: v})}
            />
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B", marginBottom: 4 }}>Description</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12, height: 120 }}
              placeholder="Détaillez votre demande..."
              multiline
              textAlignVertical="top"
              value={form.description}
              onChangeText={v => setForm({...form, description: v})}
            />
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <PrimaryButton title={loading ? "Envoi..." : "Envoyer le ticket"} onPress={submit} disabled={loading} />
        </View>
      </ScrollView>
    </Screen>
  );
}
