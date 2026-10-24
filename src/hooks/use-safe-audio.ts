import { Platform } from "react-native";
import { useAudioPlayer, type AudioSource } from "expo-audio";

export function useSafeAudioPlayer(source: AudioSource) {
  const isServer =
    Platform.OS === "web" &&
    (typeof window === "undefined" || typeof window.Audio === "undefined");

  if (isServer) {
    return null;
  }

  return useAudioPlayer(source);
}