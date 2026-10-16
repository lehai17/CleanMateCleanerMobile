import { Platform } from "react-native";
import Constants from "expo-constants";

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
const developmentHost = expoHost || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
if (!__DEV__ && !configuredUrl) {
  throw new Error("Configure EXPO_PUBLIC_API_URL before building the mobile app.");
}
// Base URL is the server origin; API modules already include /api in each path.
export const API_BASE_URL = (configuredUrl || `http://${developmentHost}:5238`).replace(/\/+$/, "");
