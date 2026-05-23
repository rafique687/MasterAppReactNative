import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Product = {
  _id: string;
  product_name: string;
  category_name: string;
  image: string;
  price: number;
  status: "active" | "deactive";
};

export default function ViewProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem("token");

      type JwtPayload = {
        AppName: string;
        user_id: string;
        mobile: string;
        iat: number;
        exp: number;
      };

      if (!token) return null;

      const decoded = jwtDecode<JwtPayload>(token);

      const app_id = decoded.user_id;

      const res = await fetch(`${API_URL}/api/product/view?app_id=${app_id}`, {
        method: "GET",
      });

      const json = await res.json();

      setProducts(json.data || json);
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = (id: string) => {
    Alert.alert("Delete Product", "Are you sure you want to delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setProducts((prev) => prev.filter((item) => item._id !== id));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6a5acd" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.product_name}</Text>

              <Text style={styles.category}>
                Category: {item.category_name}
              </Text>

              <Text style={styles.price}>₹{item.price}</Text>

              <Text
                style={[
                  styles.status,
                  {
                    backgroundColor:
                      item.status === "active" ? "#d1fae5" : "#fee2e2",
                    color: item.status === "active" ? "#065f46" : "#991b1b",
                  },
                ]}
              >
                {item.status === "active" ? "Active" : "Deactive"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteProduct(item._id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    color: "#111827",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  category: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },

  status: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
