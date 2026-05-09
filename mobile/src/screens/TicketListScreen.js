import React, { useEffect, useState } from "react";
import { Text, View, FlatList, TouchableOpacity } from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";

export default function TicketListScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/support/tickets/my");
      setTickets(res.data.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("TicketDetail", { id: item.id })}
      style={{ padding: 16, backgroundColor: "white", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ flex: 1, fontWeight: "700", fontSize: 16 }}>{item.subject}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Text style={{ fontSize: 12, color: "#64748B", backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
          {item.category}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748B" }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Mes Tickets</Text>
        <TouchableOpacity onPress={() => navigation.navigate("NewTicket")}>
          <Text style={{ color: "#1B4FD8", fontWeight: "700" }}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchTickets}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#64748B", marginTop: 40 }}>Aucun ticket pour le moment.</Text>}
      />
    </Screen>
  );
}

function StatusBadge({ status }) {
  const colors = {
    OPEN: "#3B82F6",
    IN_PROGRESS: "#F59E0B",
    RESOLVED: "#22C55E",
    CLOSED: "#64748B",
  };
  return (
    <View style={{ backgroundColor: colors[status] || "#64748B", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
      <Text style={{ color: "white", fontSize: 10, fontWeight: "800" }}>{status}</Text>
    </View>
  );
}
