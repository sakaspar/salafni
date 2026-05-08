import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/onboarding/SplashScreen";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import RegisterScreen from "../screens/onboarding/RegisterScreen";
import OtpScreen from "../screens/onboarding/OtpScreen";
import KycUploadScreen from "../screens/onboarding/KycUploadScreen";
import PendingVerificationScreen from "../screens/onboarding/PendingVerificationScreen";
import HomeScreen from "../screens/HomeScreen";
import MerchantSearchScreen from "../screens/loan/MerchantSearchScreen";
import AmountSelectorScreen from "../screens/loan/AmountSelectorScreen";
import BreakdownScreen from "../screens/loan/BreakdownScreen";
import ConfirmationScreen from "../screens/loan/ConfirmationScreen";
import SubmittedScreen from "../screens/loan/SubmittedScreen";
import RepaymentScreen from "../screens/RepaymentScreen";
import CreditScoreScreen from "../screens/CreditScoreScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="KycUpload" component={KycUploadScreen} />
        <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MerchantSearch" component={MerchantSearchScreen} />
        <Stack.Screen name="AmountSelector" component={AmountSelectorScreen} />
        <Stack.Screen name="Breakdown" component={BreakdownScreen} />
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        <Stack.Screen name="Submitted" component={SubmittedScreen} />
        <Stack.Screen name="Repayments" component={RepaymentScreen} />
        <Stack.Screen name="CreditScore" component={CreditScoreScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
