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

type Category = {
  _id: string;
  category_name: string;
  image: string;
  status: "active" | "deactive";
};

export default function ViewCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
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

      const res = await fetch(
        `${API_URL}/api/category/categories?app_id=${app_id}`,
        {
          method: "GET",
        },
      );

      const json = await res.json();

      // adjust this depending on your API response structure
      setCategories(json.data || json);
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = (id: string) => {
    Alert.alert("Delete Category", "Are you sure you want to delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCategories((prev) => prev.filter((item) => item._id !== id));
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
      <Text style={styles.title}>Categories</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.category_name}</Text>

              <Text
                style={[
                  styles.status,
                  {
                    backgroundColor:
                      item.status == true ? "#d1fae5" : "#fee2e2",
                    color: item.status == true ? "#065f46" : "#991b1b",
                  },
                ]}
              >
                {item.status === "active" ? "Active" : "Deactive"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteCategory(item._id)}
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
    width: 55,
    height: 55,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
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
