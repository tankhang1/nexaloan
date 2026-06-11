import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const bannerAdUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === "ios"
    ? "ca-app-pub-3012411444875177/7501084633"
    : "ca-app-pub-3012411444875177/1035366792";

const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
    ? "ca-app-pub-3012411444875177/9013772003"
    : "ca-app-pub-3012411444875177/3574959717";

export const ADS = {
  banner: bannerAdUnitId,
  interstitial: interstitialAdUnitId,
};
