import { Platform } from "react-native";
import Constants from "expo-constants";
import { resolveApiBase } from "./apiBase";

// Base URL is the server origin; API modules already include /api in each path.
export const API_BASE_URL = resolveApiBase(Constants.expoConfig, Platform.OS, __DEV__);
