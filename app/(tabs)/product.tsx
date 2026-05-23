import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DUMMY_IMAGE = "https://via.placeholder.com/300x200.png?text=No+Image";

const PRODUCTS = [
  {
    _id: "1",
    product_name: "iPhone 15",
    price: 80000,
    description: "Latest Apple smartphone with powerful camera",
    category: "Electronics",
    image: "",
  },
  {
    _id: "2",
    product_name: "Nike Shoes",
    price: 4500,
    description: "Comfortable running shoes",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  },
  {
    _id: "3",
    product_name: "Smart Watch",
    price: 3000,
    description: "Track your fitness and notifications",
    category: "Gadgets",
    image: "",
  },
  {
    _id: "4",
    product_name: "Headphones",
    price: 2000,
    description: "Wireless high quality sound",
    category: "Audio",
    image: "",
  },
  {
    _id: "5",
    product_name: "Laptop",
    price: 55000,
    description: "High performance laptop for work",
    category: "Electronics",
    image: "",
  },
  {
    _id: "6",
    product_name: "Backpack",
    price: 1200,
    description: "Durable travel backpack",
    category: "Accessories",
    image: "",
  },
];

export default function ProductsScreen() {
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // ADD TO CART
  const handleAddToCart = (item: any) => {
    const exists = cart.find((c) => c._id === item._id);

    if (exists) {
      Alert.alert("Cart", "Already added to cart");
      return;
    }

    setCart([...cart, item]);
    Alert.alert("Cart", "Added to cart");
  };

  // ADD TO WISHLIST
  const handleAddToWishlist = (item: any) => {
    const exists = wishlist.find((w) => w._id === item._id);

    if (exists) {
      Alert.alert("Wishlist", "Already in wishlist");
      return;
    }

    setWishlist([...wishlist, item]);
    Alert.alert("Wishlist", "Added to wishlist");
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        {/* IMAGE */}
        <Image
          source={{
            uri:
              item.image && item.image.trim() !== "" ? item.image : DUMMY_IMAGE,
          }}
          style={styles.image}
        />

        {/* NAME */}
        <Text style={styles.name}>{item.product_name}</Text>

        {/* PRICE */}
        <Text style={styles.price}>₹ {item.price}</Text>

        {/* DESCRIPTION */}
        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>

        {/* CATEGORY */}
        <Text style={styles.category}>{item.category}</Text>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.btnText}>Add Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.wishBtn}
            onPress={() => handleAddToWishlist(item)}
          >
            <Text style={styles.btnText}>Wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Products</Text>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f2ff",
    padding: 10,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#b42ea9",
    textAlign: "center",
    marginBottom: 15,
  },

  row: {
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    width: "48%",
    elevation: 5,
  },

  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },

  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },

  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#b63eee",
    marginVertical: 4,
  },

  description: {
    fontSize: 12,
    color: "#666",
  },

  category: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  cartBtn: {
    flex: 1,
    backgroundColor: "#b63eee",
    padding: 6,
    borderRadius: 8,
    marginRight: 5,
  },

  wishBtn: {
    flex: 1,
    backgroundColor: "#ff4d6d",
    padding: 6,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
});
