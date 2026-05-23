import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function PrepareApp() {
  const [appName, setAppName] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userid, setUSerId] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);

  // Load token
  React.useEffect(() => {
    const load = async () => {
      const t = await AsyncStorage.getItem("token");
      const getAppname = await AsyncStorage.getItem("AppName");
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        setUSerId(userData.id);
      }
      setAppName(getAppname);

      if (t) setToken(t);
    };
    load();
  }, []);

  // Pick Image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Create App API
  const createApp = async () => {
    if (!appName) {
      Alert.alert("Error", "Enter app name");
      return;
    }

    if (!userid) {
      Alert.alert("Error", "User Id not found");
      return;
    }

    if (!token) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      //const fileExtension = image.split(".").pop() || "jpg";

      const formData = new FormData();

      formData.append("app_name", appName);
      formData.append("id", userid);

      const res = await fetch(`${API_URL}/api/prepareApp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // "Content-Type": "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      console.log("APP CREATE RESPONSE:", data);

      if (res.ok) {
        Alert.alert("Success", "App created successfully");
        setAppName("");
        setImage(null);
      } else {
        Alert.alert("Error", data.message || "Failed to create app");
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prepare Your App</Text>

      {/* Image Preview */}

      {/* Pick Button */}
      <TouchableOpacity style={styles.button} onPress={createApp}>
        <Text style={styles.buttonText}>Create App</Text>
      </TouchableOpacity>

      {/* Create App Button */}
      <TouchableOpacity
        style={[styles.createButton, loading && { opacity: 0.7 }]}
        onPress={createApp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Download App</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 15,
  },

  image: {
    width: 160,
    height: 160,
    borderRadius: 15,
    marginBottom: 15,
  },

  placeholder: {
    width: 160,
    height: 160,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },

  createButton: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
