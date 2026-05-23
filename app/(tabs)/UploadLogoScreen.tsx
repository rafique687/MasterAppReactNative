import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UploadLogoScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [mobileNum, setMobileNum] = useState("");
  const [token, setToken] = useState("");
  const [appName, setAppName] = useState("");

  // =========================
  // Load User Data
  // =========================
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      const getAppname = await AsyncStorage.getItem("AppName");

      if (getAppname) {
        setAppName(getAppname);
      }

      if (storedToken) {
        setToken(storedToken);
      }

      if (userString) {
        const userData = JSON.parse(userString);

        if (userData?.mobile) {
          setMobileNum(userData.mobile);
        }
      }
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  };

  // =========================
  // Pick Image
  // =========================
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        setImage(selectedImage.uri);

        console.log("Selected Image:", selectedImage);
      }
    } catch (error) {
      console.log("IMAGE PICK ERROR:", error);

      Alert.alert("Error", "Failed to pick image");
    }
  };

  // =========================
  // Remove Image
  // =========================
  const removeImage = () => {
    setImage(null);
  };

  // =========================
  // Upload Logo
  // =========================
  const uploadLogo = async () => {
    console.log("UPLOAD BUTTON CLICKED");

    // =========================
    // Validation
    // =========================
    if (!image) {
      Alert.alert("Error", "Please select image first");
      return;
    }

    if (!token) {
      Alert.alert("Error", "User token not found");
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      console.log("API URL:", API_URL);

      if (!API_URL) {
        Alert.alert("Error", "API URL missing");
        return;
      }

      // =========================
      // File Extension
      // =========================
      const fileExtension = image.split(".").pop()?.toLowerCase() || "jpg";

      // =========================
      // MIME TYPE
      // =========================
      const mimeType =
        fileExtension === "png"
          ? "image/png"
          : fileExtension === "webp"
            ? "image/webp"
            : "image/jpeg";

      // =========================
      // Create FormData
      // =========================
      const formData = new FormData();

      // WEB SUPPORT
      if (Platform.OS === "web") {
        const response = await fetch(image);
        const blob = await response.blob();

        formData.append("logo", blob, `logo.${fileExtension}`);
      } else {
        formData.append("logo", {
          uri: image,
          name: `logo_${Date.now()}.${fileExtension}`,
          type: mimeType,
        } as any);
      }

      formData.append("app_name", appName);
      formData.append("mobile", mobileNum);

      console.log("Uploading image...");

      // =========================
      // Upload API
      // =========================

      const uploadResponse = await fetch(`${API_URL}/api/upload_logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      console.log("UPLOAD STATUS:", uploadResponse.status);

      const uploadData = await uploadResponse.json();

      console.log("UPLOAD RESPONSE:");
      console.table(uploadData);
      router.push("/PrepareApp");
      // =========================
      // Upload Failed
      // =========================
      if (!uploadResponse.ok) {
        Alert.alert(
          "Upload Failed",
          uploadData?.message || "Image upload failed",
        );

        return;
      }

      // =========================
      // Uploaded Image Path
      // =========================
      const uploadedLogo =
        uploadData?.logo ||
        uploadData?.image ||
        uploadData?.path ||
        uploadData?.file;

      console.log("UPLOADED LOGO:", uploadedLogo);

      if (!uploadedLogo) {
        Alert.alert("Error", "Uploaded image path missing");
        return;
      }

      // =========================
      // Save Database Record
      // =========================
      console.log("Saving database record...");

      const saveResponse = await fetch(`${API_URL}/api/save_logo_record`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },

        body: JSON.stringify({
          app_name: appName,
          mobile: mobileNum,
          logo: uploadedLogo,
          created_at: new Date().toISOString(),
        }),
      });

      console.log("SAVE STATUS:", saveResponse.status);

      const saveData = await saveResponse.json();

      console.log("SAVE RESPONSE:");
      console.table(saveData);

      // =========================
      // Success
      // =========================
      if (saveResponse.ok) {
        Alert.alert("Success", "Logo uploaded and saved successfully");

        setImage(null);
      } else {
        Alert.alert(
          "Database Error",
          saveData?.message || "Failed to save data",
        );
      }
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error);

      Alert.alert("Network Error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Upload Logo</Text>

      {/* =========================
          Image Preview
      ========================== */}
      {image ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.image} />

          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No Image Selected</Text>
        </View>
      )}

      {/* =========================
          Pick Button
      ========================== */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.pickButton}
        onPress={pickImage}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {/* =========================
          Upload Button
      ========================== */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.uploadButton, loading && styles.disabledButton]}
        onPress={uploadLogo}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Logo</Text>
        )}
      </TouchableOpacity>

      {/* =========================
          User Info
      ========================== */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Mobile: {mobileNum || "N/A"}</Text>

        <Text style={styles.infoText}>App Name: {appName}</Text>
      </View>
    </ScrollView>
  );
}

// =========================
// Styles
// =========================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 25,
  },

  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#3b82f6",
  },

  emptyBox: {
    width: 180,
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#64748b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
  },

  pickButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    marginTop: 10,
  },

  uploadButton: {
    backgroundColor: "#10b981",
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  removeButton: {
    backgroundColor: "#ef4444",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },

  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  infoBox: {
    marginTop: 30,
    width: "100%",
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
  },

  infoText: {
    color: "#e2e8f0",
    fontSize: 14,
    marginBottom: 5,
  },
});
