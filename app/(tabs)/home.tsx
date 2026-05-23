import React from "react";
import { Image, Text, View } from "react-native";
import { useApp } from "../../context/AppContext";

export default function Home() {
  const { appConfig } = useApp();

  return (
    <View>
      <Image
        source={{ uri: appConfig?.logo }}
        style={{ width: 100, height: 100 }}
      />

      <Text style={{ fontSize: 22 }}>{appConfig?.app_name}</Text>
    </View>
  );
}
