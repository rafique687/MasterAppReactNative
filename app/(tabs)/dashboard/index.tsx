//import type AsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const expoConfig = Constants.expoConfig;
  const slugUserId = expoConfig?.slug;
  const app_name = expoConfig?.name;
  const [AppName, setName] = useState(app_name);

  const router = useRouter();

  // API CALL FUNCTION
  const registerUser = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      if (!API_URL) {
        Alert.alert("Error", "API URL not set");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_name: AppName,
          user_id: slugUserId ?? "111",
          mobile: "90019793101",
        }),
      });

      const data = await response.json();

      console.log("Response:", data.status);
      await AsyncStorage.setItem("user", JSON.stringify(data.data));
      await AsyncStorage.setItem("token", JSON.stringify(data.token));
      //Alert.alert("Success", data.message || "User created");
      if (data.status == 200 || data.status == 409) {
        router.push("/product");
      }

      /// router.push("/home");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  // RUN API ON PAGE LOAD
  // useEffect(() => {
  //   registerUser();
  // }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: "#b42ea9c5" }]}>Admin Login</Text>

      <TextInput
        placeholder="APP NAME"
        style={styles.input}
        value={AppName}
        onChangeText={setName}
      />

      {/* Manual submit */}
      <TouchableOpacity style={styles.button} onPress={() => registerUser()}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#b63eee8c",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
