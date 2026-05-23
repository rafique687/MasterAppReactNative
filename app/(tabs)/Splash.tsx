import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { useApp } from "../../context/AppContext";
import { getAppConfig } from "../../services/api";

export default function Splash() {
  const router = useRouter();

  const { setAppConfig } = useApp();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const appId = "101";

      const config = await getAppConfig(appId);

      setAppConfig(config);

      router.replace("/home");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading App...</Text>
    </View>
  );
}
