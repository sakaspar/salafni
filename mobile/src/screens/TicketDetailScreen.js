import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

export default function TicketDetailScreen({ route }) {
  const { id } = route.params;
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/support/tickets/${id}`);
      setTicket(res.data.data.ticket);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000); // Poll for replies
    return () => clearInterval(interval);
  }, []);

  const sendReply = async () => {
    if (!message) return;
    setLoading(true);
    try {
      await api.post(`/support/tickets/${id}/message`, { message });
      setMessage("");
      fetchTicket();
    } catch (e) {
      alert("Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return <Screen><Text>Chargement...</Text></Screen>;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Screen>
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>{ticket.subject}</Text>
            <Text style={{ fontSize: 12, color: "#64748B" }}>#{ticket.id.slice(0, 8)}</Text>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {ticket.messages.map((m, idx) => (
              <View key={idx} style={{
                alignSelf: m.senderRole === "USER" ? "flex-end" : "flex-start",
                backgroundColor: m.senderRole === "USER" ? "#1B4FD8" : "#F1F5F9",
                padding: 12,
                borderRadius: 16,
                borderBottomRightRadius: m.senderRole === "USER" ? 0 : 16,
                borderBottomLeftRadius: m.senderRole === "USER" ? 16 : 0,
                marginBottom: 12,
                maxWidth: "85%"
              }}>
                <Text style={{ color: m.senderRole === "USER" ? "white" : "#1E293B", fontSize: 15 }}>{m.message}</Text>
                <Text style={{
                  color: m.senderRole === "USER" ? "rgba(255,255,255,0.7)" : "#94A3B8",
                  fontSize: 10,
                  marginTop: 4,
                  textAlign: m.senderRole === "USER" ? "right" : "left"
                }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 8, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" }}>
            <TextInput
              style={{ flex: 1, backgroundColor: "#F8FAFC", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#E2E8F0" }}
              placeholder="Votre message..."
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              onPress={sendReply}
              disabled={loading || !message}
              style={{ backgroundColor: "#1B4FD8", width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", opacity: (!message || loading) ? 0.5 : 1 }}
            >
              <Text style={{ color: "white", fontSize: 20 }}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
