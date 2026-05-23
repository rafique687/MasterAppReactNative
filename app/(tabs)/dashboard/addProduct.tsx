import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { jwtDecode } from "jwt-decode";
import { launchImageLibrary } from "react-native-image-picker";

///const API_URL = "http://10.0.2.2:5000";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function AddProductScreen() {
  const [categories, setCategories] = useState([]);
  const [app_id, setAppName] = useState("");

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    status: "active",
    quantity: "",
  });

  const [images, setImages] = useState([]);

  // ✅ GET APP ID
  const getappid = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);
    return decoded.user_id;
  };

  // ✅ FETCH CATEGORIES (use param, NOT state)
  const fetchCategories = async (id) => {
    try {
      //console.log("app_id used:", id);

      const res = await fetch(
        `${API_URL}/api/category/categories?app_id=${id}`,
      );

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.log("Category fetch error:", err);
    }
  };

  // ✅ INIT (FIXED FLOW)
  useEffect(() => {
    const init = async () => {
      const id = await getappid();

      if (!id) return;

      setAppName(id); // store for submit use
      await fetchCategories(id); // fetch using SAME id
    };

    init();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ IMAGE PICKER
  const pickImages = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 10,
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;

        const assets = response.assets || [];

        const formatted = assets.map((item) => ({
          uri: item.uri,
          type: item.type,
          fileName: item.fileName,
        }));

        setImages(formatted);
      },
    );
  };

  // ✅ SUBMIT PRODUCT
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.price || !form.category_id) {
        Alert.alert("Error", "Name, Price and Category required");
        return;
      }

      const formData = new FormData();

      formData.append("app_id", app_id);
      formData.append("category_id", form.category_id);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("status", form.status);
      formData.append("quantity", form.quantity);

      images.forEach((img, index) => {
        formData.append("images", {
          uri: img.uri,
          type: img.type || "image/jpeg",
          name: img.fileName || `image_${index}.jpg`,
        });
      });

      const res = await fetch(`${API_URL}/api/product/add`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Product added successfully");

        setForm({
          category_id: "",
          name: "",
          description: "",
          price: "",
          status: "active",
          quantity: "",
        });

        setImages([]);
      } else {
        Alert.alert("Error", data.message || "Failed");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Product</Text>
      {/* CATEGORY DROPDOWN */}
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={form.category_id}
          onValueChange={(value) => handleChange("category_id", value)}
        >
          <Picker.Item label="Select Category" value="" />

          {categories.map((cat) => (
            <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
          ))}
        </Picker>
      </View>

      {/* NAME */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(v) => handleChange("name", v)}
      />

      {/* DESCRIPTION */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={form.description}
        onChangeText={(v) => handleChange("description", v)}
      />

      {/* PRICE */}
      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(v) => handleChange("price", v)}
      />

      {/* QUANTITY */}
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        keyboardType="numeric"
        value={form.quantity}
        onChangeText={(v) => handleChange("quantity", v)}
      />

      {/* STATUS */}
      <TextInput
        style={styles.input}
        placeholder="Status"
        value={form.status}
        onChangeText={(v) => handleChange("status", v)}
      />

      {/* IMAGE PICK */}
      <View style={{ marginVertical: 10 }}>
        <Button title="Pick Images" onPress={pickImages} />
      </View>

      {/* IMAGE PREVIEW */}
      <ScrollView horizontal>
        {images.map((img, index) =>
          img?.uri ? (
            <Image key={index} source={{ uri: img.uri }} style={styles.image} />
          ) : null,
        )}
      </ScrollView>

      {/* SUBMIT */}
      <View style={{ marginTop: 20 }}>
        <Button title="Submit Product" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },

  image: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,

    fontSize: 50,

    height: 60, // ✅ increase container height
    justifyContent: "center",
  },

  picker: {
    height: 100, // ✅ increase picker height
  },
});
