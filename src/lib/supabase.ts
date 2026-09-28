import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://qmufrbkfvzapmemkvjuv.supabase.co";
const supabasePublishableKey = "sb_publishable_nxAe2qzs80ZudF9igtIfhQ_I8w64QKv";

const customStorage = Platform.OS === "web" ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
