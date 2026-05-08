import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export default function Screen({ children, scroll = true }) {
  const Wrapper = scroll ? ScrollView : SafeAreaView;
  return (
    <Wrapper contentContainerStyle={styles.container} style={styles.base}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 12 },
});
