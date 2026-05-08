import React from "react";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Salafni</Text>
      <Text style={{ fontSize: 20 }}>{t("welcomeAr")}</Text>
      <Text style={{ color: "#64748B" }}>{t("welcomeFr")}</Text>
      <PrimaryButton title={t("register")} onPress={() => navigation.navigate("Register")} />
    </Screen>
  );
}
