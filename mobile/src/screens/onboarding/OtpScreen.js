import React, { useState } from "react";
import { Text, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

export default function OtpScreen({ navigation, route }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (otp !== "1234") return setError("OTP invalide (dev: 1234)");
    setLoading(true);
    try {
      const res = await api.post("/auth/client/login", {
        email: route.params.email,
        password: route.params.password || "Client123!",
      });
      // Handle standardized response { success, data: { accessToken, ... } }
      const { accessToken } = res.data.data;
      await AsyncStorage.setItem("salafni_token", accessToken);
      navigation.replace("KycUpload");
    } catch (_e) {
      // Fallback for demo
      navigation.replace("KycUpload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Verification OTP</Text>
      <TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" style={{ borderWidth: 1, padding: 12 }} />
      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
      <PrimaryButton title={loading ? "..." : "Verifier"} onPress={verify} />
    </Screen>
  );
}
