import Constants from "expo-constants";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BannerAdSize } from "react-native-google-mobile-ads";
import { useSelector } from "react-redux";
import AppBanner from "../../components/AppBanner";
import AppIconButton from "../../components/AppIconButton";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { COLORS } from "../../constants/colors";
import { CURRENCIES } from "../../constants/currency";
import { ICONS } from "../../constants/icon";
import { FINANCE_IMAGES } from "../../assets";
import { LANGUAGES } from "../../constants/language";
import { navigationRef } from "../../navigation";
import { RootState } from "../../redux/store";
import Card from "./components/Card";

const SettingScreen = () => {
  const { t } = useTranslation();
  const { currency, language } = useSelector((state: RootState) => state.app);
  const curCurrency = useMemo(
    () => CURRENCIES.find((item) => item.label === currency.code),
    [currency],
  );
  const curLanguage = useMemo(
    () => LANGUAGES.find((item) => item.code === language),
    [language],
  );
  const appVersionText = useMemo(() => {
    const version =
      Constants.expoConfig?.version ||
      Constants.nativeApplicationVersion ||
      "1.0.0";
    const build = Constants.nativeBuildVersion;
    return build ? `v${version} (${build})` : `v${version}`;
  }, []);
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onNavLanguageScreen = () => {
    navigationRef.navigate("LanguageScreen");
  };
  const onNavAboutUsScreen = () => {
    navigationRef.navigate("AboutUsScreen");
  };
  const onNavCurrencyScreen = () => {
    navigationRef.navigate("CurrencyScreen");
  };
  const onNavTOUScreen = () => {
    navigationRef.navigate("TOUScreen");
  };
  const onNavPrivacyPolicyScreen = () => {
    navigationRef.navigate("PrivacyPolicyScreen");
  };
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t("settings.title")}
          fontSize={20}
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={FINANCE_IMAGES.cityBackground}
          resizeMode="cover"
          style={styles.brandCard}
          imageStyle={styles.brandCardImage}
        >
          <View pointerEvents="none" style={styles.brandOverlay} />
          <Image
            source={FINANCE_IMAGES.shield}
            resizeMode="contain"
            style={styles.brandImage}
          />
          <View style={styles.brandText}>
            <AppText
              value="Nexa Loan"
              fontSize={20}
              fontWeight={700}
              color={COLORS.foundation.neutral.n0}
            />
            <AppText
              value={appVersionText}
              fontSize={12}
              fontWeight={500}
              color={COLORS.foundation.gold.g300}
            />
          </View>
        </ImageBackground>

        <View style={styles.group}>
          <Card
            label={t("settings.selectLanguage")}
            leftIcon={<Feather name="globe" size={18} color={COLORS.foundation.blue.b400} />}
            rightSection={{
              label: curLanguage?.nativeName || "",
              icon: curLanguage?.icon,
            }}
            onPress={onNavLanguageScreen}
            isBorder
          />
          <Card
            label={t("settings.currency")}
            leftIcon={<Feather name="dollar-sign" size={18} color={COLORS.foundation.gold.g500} />}
            iconBackgroundColor={COLORS.foundation.gold.g100}
            rightSection={{
              label: curCurrency?.label || "",
              icon: curCurrency?.icon,
            }}
            onPress={onNavCurrencyScreen}
          />
        </View>

        <View style={styles.group}>
          <Card
            label={t("settings.aboutUs")}
            leftIcon={<Feather name="info" size={18} color={COLORS.foundation.sage.s500} />}
            iconBackgroundColor={COLORS.foundation.sage.s50}
            isBorder
            onPress={onNavAboutUsScreen}
          />
          <Card
            label={t("settings.terms")}
            leftIcon={<Feather name="file-text" size={18} color={COLORS.foundation.blue.b400} />}
            isBorder
            onPress={onNavTOUScreen}
          />
          <Card
            label={t("settings.privacy")}
            leftIcon={<Feather name="lock" size={18} color={COLORS.foundation.blue.b400} />}
            onPress={onNavPrivacyPolicyScreen}
          />
        </View>
      </ScrollView>

      <View style={styles.banner}>
        <AppBanner size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    </AppView>
  );
};

export default SettingScreen;

const CARD_SHADOW = {
  shadowColor: COLORS.foundation.blue.b500,
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 16,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.foundation.blue.b500,
    ...CARD_SHADOW,
  },
  brandCardImage: {
    borderRadius: 24,
  },
  brandOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 30, 60, 0.4)",
  },
  brandImage: {
    width: 56,
    height: 56,
  },
  brandText: {
    gap: 2,
  },
  group: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 22,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  banner: {
    alignItems: "center",
    paddingBottom: 8,
  },
});
