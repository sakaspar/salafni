import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("salafni_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function cacheLoansAndRepayments() {
  try {
    const { data: loansData } = await api.get("/loans/my");
    await AsyncStorage.setItem("cached_loans", JSON.stringify(loansData.loans || []));
    const repaymentsByLoan = {};
    for (const loan of loansData.loans || []) {
      const { data: repayData } = await api.get(`/loans/${loan.id}/repayments`);
      repaymentsByLoan[loan.id] = repayData.repayments || [];
    }
    await AsyncStorage.setItem("cached_repayments", JSON.stringify(repaymentsByLoan));
  } catch (_e) {
    // silent fallback to old cache
  }
}

export default api;
