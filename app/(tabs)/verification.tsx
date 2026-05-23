import AsyncStorage from "@react-native-async-storage/async-storage";

import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useRef, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function VerificationScreen() {
  const router = useRouter();

  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [userPhone] = useState(phone);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      Alert.alert("Error", "Please enter full OTP");
      return;
    }

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      if (!API_URL) {
        Alert.alert("Error", "API URL not configured");
        return;
      }

      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: userPhone,
          otp: code,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        Alert.alert("Success", "OTP Verified");
        await AsyncStorage.setItem("token", data.token);

        // Save user
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        router.push("/AppNameScreen");
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to: {phone}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                handleBackspace(digit, index);
              }
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    marginBottom: 30,
    textAlign: "center",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },

  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    backgroundColor: "#1e293b",
  },

  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
