import { NativeStackScreenProps } from "@react-navigation/native-stack";
import dayjs from "dayjs";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useInterstitialAd } from "react-native-google-mobile-ads";
import Share from "react-native-share";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import { useDispatch, useSelector } from "react-redux";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AppIconButton from "../../components/AppIconButton";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { ADS } from "../../constants/ads";
import { COLORS } from "../../constants/colors";
import { WIDTH } from "../../constants/dimension";
import { ICONS } from "../../constants/icon";
import { navigationRef } from "../../navigation";
import { addLoan, ELoan } from "../../redux/slices/history";
import { RootState } from "../../redux/store";
import { TNavigation } from "../../utils/types/navigation";
const Result = lazy(() => import("./components/Result"));

type Props = NativeStackScreenProps<TNavigation, "MortgageLoanResultScreen">;
const MortgageLoanResultScreen = ({ route }: Props) => {
  const [isPending, startTransition] = useTransition();
  const { isLoaded, isClosed, load, show } = useInterstitialAd(
    ADS.interstitial,
  );
  const [shouldSaveAfterAd, setShouldSaveAfterAd] = useState(false);
  const { t } = useTranslation();
  const viewRef = useRef<ViewShot>(null);
  const confettiRef = useRef<ConfettiCannon>(null);
  const mortgage = useSelector((state: RootState) => state.mortgage_loan);
  const dispatch = useDispatch();
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onNavMortgageLoanResultDetail = () => {
    startTransition(() => {
      navigationRef.navigate("MortgageLoanResultDetailScreen", {
        label: route.params.label,
      });
    });
  };
  const onSave = useCallback(() => {
    Toast.show({
      text1: t("mortgageResult.notificationTitle"),
      text2: t("mortgageResult.notificationMessage"),
      type: "success",
      position: "top",
    });
    dispatch(
      addLoan({
        ...mortgage,
        label: route.params.label,
        type:
          route.params.label === t("main.mortgage.title")
            ? ELoan.MORTGAGE_LOAN
            : route.params.label === t("main.car.title")
              ? ELoan.CAR_LOAN
              : route.params.label === t("main.business.title")
                ? ELoan.BUSINESS_LOAN
                : ELoan.PERSONAL_LOAN,
      }),
    );
  }, [dispatch, mortgage, t, route]);
  const onNavSetting = () => {
    navigationRef.navigate("SettingScreen");
  };
  const onGoHome = () => {
    navigationRef.navigate("MainScreen");
  };
  const onOpenShare = () => {
    if (!viewRef.current) return;

    setTimeout(() => {
      //@ts-expect-error no check
      viewRef.current
        .capture()
        .then((uri) => {
          Share.open({ url: uri, title: t("mortgageResult.resultTitle") });
        })
        .catch(console.log);
    }, 500); // delay 500ms to ensure render
  };
  useEffect(() => {
    confettiRef.current?.start();
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (isClosed && shouldSaveAfterAd) {
      setShouldSaveAfterAd(false);
      onSave();
    }
  }, [isClosed, onSave, shouldSaveAfterAd]);
  return (
    <ViewShot
      ref={viewRef}
      options={{
        fileName: `${t("mortgageResult.result.title")}-${dayjs(
          new Date(),
        ).format("DD-MM-YYYY")}`,
        format: "jpg",
        quality: 1,
      }}
      style={styles.flex}
    >
      <AppView appStyle={styles.overall}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppIconButton onPress={onGoBack}>
              <ICONS.button.chervon_left />
            </AppIconButton>
            <AppIconButton onPress={onNavSetting}>
              <ICONS.button.setting />
            </AppIconButton>
          </View>
          {mortgage && (
            <Suspense
              fallback={
                <View
                  style={[
                    styles.flex,
                    styles.flexRow,
                    styles.gap8,
                    styles.center,
                  ]}
                >
                  <ActivityIndicator />
                  <AppText
                    fontSize={14}
                    fontWeight={600}
                    color={COLORS.foundation.neutral.n900}
                    value={t("loading")}
                  />
                </View>
              }
            >
              <Result mortgage={mortgage} label={route.params.label} />
            </Suspense>
          )}
          <View style={styles.actionGroup}>
            <View style={[styles.rows, styles.gap8]}>
              <Pressable
                style={[styles.button, styles.halfWidthButton]}
                onPress={onNavMortgageLoanResultDetail}
              >
                {isPending && <ActivityIndicator />}
                {!isPending && (
                  <MaterialIcons
                    name="pie-chart-outline"
                    size={22}
                    color={COLORS.foundation.blue.b500}
                  />
                )}
                {!isPending && (
                  <AppText
                    fontSize={14}
                    fontWeight={600}
                    value={t("mortgageResult.amortization")}
                    color={COLORS.foundation.neutral.n700}
                  />
                )}
              </Pressable>
              <Pressable
                style={[styles.button, styles.halfWidthButton]}
                onPress={onOpenShare}
              >
                <Feather
                  name="share-2"
                  size={21}
                  color={COLORS.foundation.blue.b500}
                />
                <AppText
                  fontSize={14}
                  fontWeight={600}
                  value={t("mortgageResult.share")}
                  color={COLORS.foundation.neutral.n700}
                />
              </Pressable>
            </View>
            <View style={[styles.rows]}>
              <Pressable
                style={[styles.button, styles.homeButton]}
                onPress={onGoHome}
              >
                <Ionicons
                  name="home"
                  size={21}
                  color={COLORS.foundation.blue.b500}
                />
                <AppText
                  value={t("mortgageResult.home")}
                  color={COLORS.foundation.neutral.n700}
                  fontWeight={600}
                  fontSize={14}
                />
              </Pressable>
              <Pressable
                style={[styles.button, styles.fullWidthButton]}
                onPress={() => {
                  if (isLoaded) {
                    setShouldSaveAfterAd(true);
                    show();
                  } else {
                    onSave();
                    load();
                  }
                }}
              >
                <Feather
                  name="bookmark"
                  size={20}
                  color={COLORS.foundation.blue.b500}
                />
                <AppText
                  fontSize={14}
                  fontWeight={600}
                  value={t("mortgageResult.save")}
                  color={COLORS.foundation.neutral.n700}
                />
              </Pressable>
            </View>
          </View>
        </ScrollView>
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          ref={confettiRef}
        />
      </AppView>
    </ViewShot>
  );
};

export default MortgageLoanResultScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 52,
    gap: 16,
  },
  halfWidthButton: {
    width: (WIDTH - 32) / 2 - 7,
    gap: 10,
    height: 60,
  },
  fullWidthButton: {
    width: WIDTH - 32 - 116 - 14,
    gap: 10,
    height: 60,
  },
  homeButton: {
    width: 116,
    height: 60,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
  gap8: {
    gap: 8,
  },
  gap14: {
    gap: 14,
    paddingBottom: 10,
  },
  actionGroup: {
    gap: 14,
    paddingBottom: 14,
    paddingRight: 2,
  },
  rows: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingVertical: 4,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
});
