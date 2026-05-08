import React from "react";
import { StatusBar } from "expo-status-bar";
import "./i18n";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
