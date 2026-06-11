import { NativeStackScreenProps } from "@react-navigation/native-stack";
import dayjs from "dayjs";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
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
import AppSlider from "../../components/AppSlider";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { ADS } from "../../constants/ads";
import { COLORS } from "../../constants/colors";
import { WIDTH } from "../../constants/dimension";
import { ICONS } from "../../constants/icon";
import { formatMonth } from "../../hooks/format_month";
import { formatNumber } from "../../hooks/format_number";
import {
  addLoan as setCurrentLoan,
  TMortgageLoan,
} from "../../redux/slices/mortgage_loan_slices";
import { navigationRef } from "../../navigation";
import {
  addLoan as addHistoryLoan,
  ELoan,
  TLoan,
  updateLoan as updateHistoryLoan,
} from "../../redux/slices/history";
import { RootState } from "../../redux/store";
import { TNavigation } from "../../utils/types/navigation";
import AppTrustNotice from "../../components/AppTrustNotice";
import { getFormulaDetails, getFormulaSummary } from "../../hooks/trust_copy";
import {
  calculateFixedMonthlyPayment,
  calculateFlatRatePayment,
} from "../../hooks/fixed_monthly_payment";
import { calculateFixedPrincipal } from "../../hooks/fixed_principal";

const Result = lazy(() => import("./components/Result"));

type Props = NativeStackScreenProps<TNavigation, "MortgageLoanResultScreen">;

const useDebouncedValue = <T,>(value: T, delay = 100): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounced;
};

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

  const [rateDraft, setRateDraft] = useState(Number(mortgage.int_rate || 0));
  const [durationDraft, setDurationDraft] = useState(
    Number(mortgage.duration || 1),
  );

  useEffect(() => {
    setRateDraft(Number(mortgage.int_rate || 0));
    setDurationDraft(Number(mortgage.duration || 1));
  }, [mortgage.duration, mortgage.int_rate]);

  const debouncedRate = useDebouncedValue(rateDraft, 100);
  const debouncedDuration = useDebouncedValue(durationDraft, 100);

  const scenarioLoan = useMemo<TMortgageLoan>(() => {
    return {
      ...(mortgage as TMortgageLoan),
      int_rate: Number(Number(debouncedRate).toFixed(2)),
      duration: Math.max(1, Math.floor(debouncedDuration || 1)),
    };
  }, [debouncedDuration, debouncedRate, mortgage]);

  const scenarioResult = useMemo(() => {
    if (scenarioLoan.type === 1) {
      return calculateFixedPrincipal(scenarioLoan);
    }
    if (scenarioLoan.type === 2) {
      return calculateFlatRatePayment(scenarioLoan);
    }
    return calculateFixedMonthlyPayment(scenarioLoan);
  }, [scenarioLoan]);

  const maxPressureMonth = useMemo(() => {
    const list = scenarioResult.monthlyBreakdown || [];
    if (!list.length) {
      return 0;
    }

    return list.reduce((current, item) =>
      item.totalPayment > current.totalPayment ? item : current,
    ).month;
  }, [scenarioResult.monthlyBreakdown]);

  const hasWhatIfChange = useMemo(() => {
    return (
      Number(scenarioLoan.int_rate) !== Number(mortgage.int_rate) ||
      Number(scenarioLoan.duration) !== Number(mortgage.duration)
    );
  }, [mortgage.duration, mortgage.int_rate, scenarioLoan.duration, scenarioLoan.int_rate]);

  const onGoBack = () => {
    navigationRef.goBack();
  };

  const onApplyScenario = () => {
    dispatch(setCurrentLoan(scenarioLoan));
    Toast.show({
      text1: t("mortgageResult.notificationTitle"),
      text2: t("mortgageResult.scenarioApplied"),
      type: "success",
      position: "top",
    });
  };

  const onNavMortgageLoanResultDetail = () => {
    if (hasWhatIfChange) {
      dispatch(setCurrentLoan(scenarioLoan));
    }

    startTransition(() => {
      navigationRef.navigate("MortgageLoanResultDetailScreen", {
        label: route.params.label,
      });
    });
  };

  const onNavCompare = () => {
    navigationRef.navigate("CompareLoanScreen", {
      prefill: {
        loan_amount: scenarioLoan.loan_amount,
        duration: scenarioLoan.duration,
        int_rate: scenarioLoan.int_rate,
        type: scenarioLoan.type,
        currency: scenarioLoan.currency,
      },
    });
  };

  const onSave = useCallback(() => {
    const nextType =
      route.params.label === t("main.mortgage.title")
        ? ELoan.MORTGAGE_LOAN
        : route.params.label === t("main.car.title")
          ? ELoan.CAR_LOAN
          : route.params.label === t("main.business.title")
            ? ELoan.BUSINESS_LOAN
            : ELoan.PERSONAL_LOAN;

    if (route.params?.isRecalculate && route.params?.recalculateLoanId) {
      dispatch(
        updateHistoryLoan({
          ...(scenarioLoan as TLoan),
          id: route.params.recalculateLoanId,
          label: route.params.label,
          type: nextType,
          date: new Date(),
        }),
      );
      Toast.show({
        text1: t("mortgageResult.notificationTitle"),
        text2: t("mortgageResult.updateSuccess"),
        type: "success",
        position: "top",
      });
      return;
    }

    Toast.show({
      text1: t("mortgageResult.notificationTitle"),
      text2: t("mortgageResult.notificationMessage"),
      type: "success",
      position: "top",
    });
    dispatch(
      addHistoryLoan({
        ...(scenarioLoan as TLoan),
        label: route.params.label,
        type: nextType,
      }),
    );
  }, [dispatch, route.params, scenarioLoan, t]);

  const onSaveAsNew = useCallback(() => {
    Toast.show({
      text1: t("mortgageResult.notificationTitle"),
      text2: t("mortgageResult.notificationMessage"),
      type: "success",
      position: "top",
    });

    const nextType =
      route.params.label === t("main.mortgage.title")
        ? ELoan.MORTGAGE_LOAN
        : route.params.label === t("main.car.title")
          ? ELoan.CAR_LOAN
          : route.params.label === t("main.business.title")
            ? ELoan.BUSINESS_LOAN
            : ELoan.PERSONAL_LOAN;

    dispatch(
      addHistoryLoan({
        ...(scenarioLoan as TLoan),
        id: `${(scenarioLoan as TLoan).id}-copy-${Date.now()}`,
        label: route.params.label,
        type: nextType,
        date: new Date(),
      }),
    );
  }, [dispatch, route.params.label, scenarioLoan, t]);

  const onNavSetting = () => {
    navigationRef.navigate("SettingScreen");
  };
  const onGoHome = () => {
    navigationRef.navigate("MainScreen");
  };
  const onOpenShare = () => {
    if (!viewRef.current) return;

    setTimeout(() => {
      // @ts-expect-error no check
      viewRef.current
        .capture()
        .then((uri) => {
          Share.open({ url: uri, title: t("mortgageResult.resultTitle") });
        })
        .catch(console.log);
    }, 500);
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
        fileName: `${t("mortgageResult.result.title")}-${dayjs(new Date()).format("DD-MM-YYYY")}`,
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

          <Suspense
            fallback={
              <View style={[styles.flex, styles.flexRow, styles.gap8, styles.center]}>
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
            <Result mortgage={scenarioLoan} label={route.params.label} />
          </Suspense>

          <View style={styles.insightCard}>
            <AppText
              value={t("mortgageResult.quickInsight")}
              fontSize={16}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
            />
            <View style={styles.insightRow}>
              <AppText
                value={t("mortgageResult.insight.totalInterest")}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
                textStyle={styles.rowLabel}
              />
              <AppText
                value={formatNumber(
                  scenarioResult.totalInterest,
                  scenarioLoan.currency.locale,
                  true,
                  scenarioLoan.currency.code,
                )}
                fontSize={15}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                numberOfLines={1}
                textStyle={styles.rowValue}
              />
            </View>
            <View style={styles.insightRow}>
              <AppText
                value={t("mortgageResult.insight.totalPayment")}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
                textStyle={styles.rowLabel}
              />
              <AppText
                value={formatNumber(
                  scenarioResult.totalPayment,
                  scenarioLoan.currency.locale,
                  true,
                  scenarioLoan.currency.code,
                )}
                fontSize={15}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                numberOfLines={1}
                textStyle={styles.rowValue}
              />
            </View>
            <View style={styles.insightRow}>
              <AppText
                value={t("mortgageResult.insight.highestPressureMonth")}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
                textStyle={styles.rowLabel}
              />
              <AppText
                value={formatMonth(maxPressureMonth, t)}
                fontSize={15}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                numberOfLines={1}
                textStyle={styles.rowValue}
              />
            </View>
          </View>

          <View style={styles.whatIfCard}>
            <AppText
              value={t("mortgageResult.whatIfRealtime")}
              fontSize={16}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
            />
            <View style={styles.whatIfSection}>
              <AppText
                value={
                  scenarioLoan.type === 2
                    ? t("mortgageResult.insight.monthlyRate")
                    : t("mortgageResult.insight.yearlyRate")
                }
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
              />
              <AppSlider
                minValue={scenarioLoan.type === 2 ? 0.1 : 1}
                maxValue={25}
                curValue={rateDraft}
                isFloat
                setCurValue={setRateDraft}
                prefix={false}
              />
            </View>
            <View style={styles.whatIfSection}>
              <AppText
                value={t("mortgageResult.insight.durationMonths")}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
              />
              <AppSlider
                minValue={1}
                maxValue={360}
                curValue={durationDraft}
                setCurValue={setDurationDraft}
                prefix={false}
              />
            </View>
            {hasWhatIfChange && (
              <Pressable style={styles.applyScenarioBtn} onPress={onApplyScenario}>
                <AppText
                  value={t("mortgageResult.applyScenario")}
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                />
              </Pressable>
            )}
          </View>

          <AppTrustNotice
            summary={t("trust.result.estimation")}
            details={`${getFormulaSummary(scenarioLoan.type || 0, t)}\n\n${getFormulaDetails(
              scenarioLoan.type || 0,
              t,
            )}\n\n${t("trust.disclaimer.notAdvice")}`}
            expandLabel={t("trust.actions.viewFormula")}
            collapseLabel={t("trust.actions.hideFormula")}
          />

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

            <Pressable style={[styles.button, styles.compareButton]} onPress={onNavCompare}>
              <MaterialIcons
                name="compare-arrows"
                size={21}
                color={COLORS.foundation.blue.b500}
              />
              <AppText
                fontSize={14}
                fontWeight={700}
                value={t("mortgageResult.compareScenario")}
                color={COLORS.foundation.neutral.n700}
              />
            </Pressable>

            <View style={[styles.rows]}>
              <Pressable style={[styles.button, styles.homeButton]} onPress={onGoHome}>
                <Ionicons name="home" size={21} color={COLORS.foundation.blue.b500} />
                <AppText
                  value={t("mortgageResult.home")}
                  color={COLORS.foundation.neutral.n700}
                  fontWeight={600}
                  fontSize={14}
                />
              </Pressable>
              {route.params?.isRecalculate ? (
                <View style={[styles.rows, styles.recalculateActionGroup]}>
                  <Pressable
                    style={[styles.button, styles.recalculateButton]}
                    onPress={onSave}
                  >
                    <Feather
                      name="refresh-cw"
                      size={18}
                      color={COLORS.foundation.blue.b500}
                    />
                    <AppText
                      fontSize={12}
                      fontWeight={600}
                      value={t("mortgageResult.updateSaved")}
                      color={COLORS.foundation.neutral.n700}
                    />
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.recalculateButton]}
                    onPress={onSaveAsNew}
                  >
                    <Feather
                      name="bookmark"
                      size={18}
                      color={COLORS.foundation.blue.b500}
                    />
                    <AppText
                      fontSize={12}
                      fontWeight={600}
                      value={t("mortgageResult.saveNew")}
                      color={COLORS.foundation.neutral.n700}
                    />
                  </Pressable>
                </View>
              ) : (
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
              )}
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
  compareButton: {
    height: 56,
    gap: 10,
  },
  homeButton: {
    width: 116,
    height: 60,
  },
  recalculateActionGroup: {
    width: WIDTH - 32 - 116 - 14,
    gap: 8,
  },
  recalculateButton: {
    width: (WIDTH - 32 - 116 - 14 - 8) / 2,
    height: 60,
    gap: 8,
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
  insightCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    padding: 14,
    gap: 10,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    flex: 1,
    flexShrink: 1,
  },
  rowValue: {
    flexShrink: 0,
    textAlign: "right",
  },
  whatIfCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    padding: 14,
    gap: 10,
  },
  whatIfSection: {
    gap: 4,
  },
  applyScenarioBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.blue.b50,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
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
