import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AppNameScreen() {
  const router = useRouter();

  const [mobileNum, setMobileNum] = useState("");
  const [token, setToken] = useState("");
  const [appName, setAppName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
      }

      if (userString) {
        const userData = JSON.parse(userString);

        // assuming backend saved mobile like this:
        if (userData?.mobile) {
          setMobileNum(userData.mobile);
        }
      }
    };

    loadData();
  }, []);

  const handleContinue = async () => {
    if (!appName.trim()) {
      Alert.alert("Error", "Please enter app name");
      return;
    }

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/appcreat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobileNum,
          appName: appName,
        }),
      });

      const data = await res.json();
      await AsyncStorage.setItem("AppName", JSON.stringify(data.appname));
      //console.log("Response:", data);

      if (res.ok) {
        Alert.alert("Success", "App created successfully");
        router.push("/UploadLogoScreen"); // change route if needed
      } else {
        Alert.alert("Error", data.message || "Failed to create app");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your App</Text>
      <Text style={styles.subtitle}>Enter your app name to continue</Text>

      <TextInput
        placeholder="App Name"
        value={appName}
        onChangeText={setAppName}
        style={styles.input}
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
