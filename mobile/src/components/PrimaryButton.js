import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { COLORS } from "../constants/colors";

export default function PrimaryButton({ title, onPress, disabled, accent = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: accent ? COLORS.accent : COLORS.primary }, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 14, borderRadius: 10, alignItems: "center" },
  text: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.6 },
});
