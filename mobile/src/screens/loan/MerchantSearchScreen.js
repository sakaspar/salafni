import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Screen from "../../components/Screen";
import api from "../../services/api";

export default function MerchantSearchScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    api.get("/merchant/list").then((r) => setMerchants(r.data.data.merchants || [])).catch(() => setMerchants([]));
  }, []);

  const filtered = merchants.filter((m) => m.businessName.toLowerCase().includes(search.toLowerCase()));
  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Choisir un marchand</Text>
      <TextInput placeholder="Recherche ou QR mock" value={search} onChangeText={setSearch} style={{ borderWidth: 1, padding: 12 }} />
      {filtered.map((m) => (
        <TouchableOpacity key={m.id} onPress={() => navigation.navigate("AmountSelector", { merchant: m })}>
          <View style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12 }}>
            <Text>{m.businessName}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}
