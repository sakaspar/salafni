import React, { useState } from "react";
import { Text, TextInput } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    phone: "",
    fullName: "",
    nationalId: "",
    email: "",
    occupation: "",
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
      setError(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Inscription</Text>
      {["phone", "fullName", "nationalId", "email", "occupation", "password"].map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]}
          secureTextEntry={key === "password"}
          onChangeText={(value) => setForm((prev) => ({ ...prev, [key]: value }))}
          style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12 }}
        />
      ))}
      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
      <PrimaryButton title={loading ? "..." : "Continuer"} onPress={submit} disabled={loading} />
    </Screen>
  );
}
