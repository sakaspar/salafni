import React, { useState } from "react";
import { I18nManager, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Screen from "../components/Screen";
import PrimaryButton from "../components/PrimaryButton";

export default function ProfileScreen({ navigation }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "fr");

  const switchLang = async () => {
    const next = lang === "fr" ? "ar" : "fr";
    setLang(next);
    await i18n.changeLanguage(next);
    I18nManager.allowRTL(next === "ar");
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["salafni_token", "cached_loans", "cached_repayments"]);
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Profil</Text>
      <View style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 12 }}>
        <Text>Infos personnelles</Text>
        <Text>KYC: PENDING</Text>
        <Text>Historique prets: disponible</Text>
      </View>
      <PrimaryButton title={`Langue: ${lang.toUpperCase()} (toggle FR/AR)`} onPress={switchLang} />
      <PrimaryButton title="Logout" onPress={logout} accent />
    </Screen>
  );
}
