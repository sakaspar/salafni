import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Welcome"), 1200);
    return () => clearTimeout(t);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Salafni</Text>
      <Text style={styles.ar}>سلفني</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  logo: { color: COLORS.accent, fontSize: 36, fontWeight: "800" },
  ar: { color: "#fff", fontSize: 24, marginTop: 8 },
});
