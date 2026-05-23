import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCategory() {
  const expoConfig = Constants.expoConfig;
  const app_id = expoConfig?.slug ?? "111";

  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState<any>(null);

  // 📸 Pick Image
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Allow gallery access");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // ✅ Updated API
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.log("IMAGE PICK ERROR:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // 📤 Upload Category
  const addCategory = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      if (!API_URL) {
        Alert.alert("Error", "API URL not set");
        return;
      }

      if (!categoryName.trim()) {
        Alert.alert("Error", "Please enter category name");
        return;
      }

      if (!image?.uri) {
        Alert.alert("Error", "Please select an image");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();

      formData.append("name", categoryName);
      formData.append("appid", app_id);
      formData.append("image", {
        uri: image.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any);

      const response = await fetch(`${API_URL}/api/category/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });
      const data = await response.json();

      console.log("SERVER RESPONSE:", data);

      if (response.ok) {
        Alert.alert("Success", "Category Added");

        setCategoryName("");
        setImage(null);

        router.push("/dashboard/viewCategory");
      } else {
        Alert.alert("Error", data.message || "Failed");
      }
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Category</Text>

      <TextInput
        placeholder="Category Name"
        style={styles.input}
        value={categoryName}
        onChangeText={setCategoryName}
      />

      {/* 📸 Pick Image Button */}
      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={styles.imageBtnText}>Pick Image</Text>
      </TouchableOpacity>

      {/* 👀 Preview */}
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      {/* 📤 Submit Button */}
      <TouchableOpacity style={styles.button} onPress={addCategory}>
        <Text style={styles.buttonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },

  imageBtn: {
    backgroundColor: "#f59e0b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  imageBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  preview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#6a5acd",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
