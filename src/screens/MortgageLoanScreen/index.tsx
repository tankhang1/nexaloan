import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useDispatch, useSelector } from "react-redux";
import AppIconButton from "../../components/AppIconButton";
import AppIndicator from "../../components/AppIndicator";
import AppInput from "../../components/AppInput";
import AppSlider from "../../components/AppSlider";
import AppText from "../../components/AppText";
import AppTrustNotice from "../../components/AppTrustNotice";
import AppView from "../../components/AppView";
import { COLORS } from "../../constants/colors";
import { WIDTH } from "../../constants/dimension";
import { ICONS } from "../../constants/icon";
import { getFormulaDetails, getFormulaSummary } from "../../hooks/trust_copy";
import { uuid } from "../../hooks/uuid";
import { navigationRef } from "../../navigation";
import { FINANCE_IMAGES } from "../../assets";
import { addLoan } from "../../redux/slices/mortgage_loan_slices";
import { RootState } from "../../redux/store";
import { TNavigation } from "../../utils/types/navigation";
type Props = NativeStackScreenProps<TNavigation, "MortgageLoanScreen">;

const getDefaultLoanAmount = (code: string) => {
  if (code === "VND" || code === "IDR") {
    return 1000000000;
  }
  if (code === "INR" || code === "JPY" || code === "KRW" || code === "THB") {
    return 10000000;
  }
  return 200000;
};
const MortgageLoanScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const { currency } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();

  const [loanAmount, setLoanAmount] = useState<string | number>(() =>
    getDefaultLoanAmount(currency.code),
  );
  const [month, setMonth] = useState(120);
  const [type, setType] = useState(0);
  const [rate, setRate] = useState<string | number>(8);
  const isRecalculateMode = !!route.params?.recalculateLoanId;

  const sliderLimits = useMemo(() => {
    const code = currency.code;
    if (code === "VND" || code === "IDR") {
      return { min: 10000000, max: 100000000000, step: 1000000 };
    }
    if (code === "INR" || code === "JPY" || code === "KRW" || code === "THB") {
      return { min: 100000, max: 1000000000, step: 10000 };
    }
    // High value currencies (USD, EUR, GBP, CHF, AUD, SGD)
    return { min: 1000, max: 20000000, step: 1000 };
  }, [currency.code]);

  const onNavSetting = () => {
    navigationRef.navigate("SettingScreen");
  };
  const onNavMortgageLoanResult = () => {
    const duration = Math.floor(Number(month));
    const interestRate = Number(rate);
    const principal = Number(loanAmount);

    if (
      !Number.isFinite(duration) ||
      !Number.isFinite(interestRate) ||
      !Number.isFinite(principal) ||
      duration <= 0 ||
      principal <= 0 ||
      interestRate < 0
    ) {
      Alert.alert(t("mortgage.title"), t("compareLoan.enterValidValues"));
      return;
    }

    startTransition(() => {
      const id = route.params?.recalculateLoanId || uuid();
      dispatch(
        addLoan({
          id: id,
          duration,
          int_rate: interestRate,
          loan_amount: principal,
          date: new Date(),
          currency,
          type,
        }),
      );
      navigationRef.navigate("MortgageLoanResultScreen", {
        label: route.params.label,
        recalculateLoanId: route.params?.recalculateLoanId,
        isRecalculate: isRecalculateMode,
      });
    });
  };
  useEffect(() => {
    if (!route.params?.recalculateSource) {
      return;
    }

    setLoanAmount(route.params.recalculateSource.loan_amount);
    setMonth(route.params.recalculateSource.duration);
    setRate(route.params.recalculateSource.int_rate);
    setType(route.params.recalculateSource.type);
  }, [route.params?.recalculateSource]);
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const heroImage = useMemo(() => {
    const label = route.params.label;
    if (label === t("main.car.title")) {
      return FINANCE_IMAGES.auto;
    }
    if (label === t("main.personal.title")) {
      return FINANCE_IMAGES.wallet;
    }
    if (label === t("main.business.title")) {
      return FINANCE_IMAGES.bank;
    }
    return FINANCE_IMAGES.home;
  }, [route.params.label, t]);
  const durationHint =
    month >= 12
      ? `≈ ${+(month / 12).toFixed(1)} ${t("mortgageDetail.years")}`
      : "";

  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={route.params.label || t("mortgage.title")}
          fontSize={20}
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <AppIconButton onPress={onNavSetting}>
          <ICONS.button.setting />
        </AppIconButton>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Loan amount */}
        <View style={styles.card}>
          <View style={styles.amountHeader}>
            <View style={styles.gap4}>
              <AppText
                fontSize={13}
                fontWeight={600}
                value={t("mortgage.loanAmount")}
                color={COLORS.foundation.neutral.n500}
              />
              <AppText
                fontSize={12}
                fontWeight={500}
                value={currency.code}
                color={COLORS.foundation.gold.g500}
              />
            </View>
            <Image
              source={heroImage}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>
          <AppInput
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, ""); // Keep only digits
              if (!isNaN(+numericValue)) {
                setLoanAmount(numericValue);
              }
            }}
            keyboardType="number-pad"
            fontSize={34}
            fontWeight={700}
            value={new Intl.NumberFormat(currency.locale).format(+loanAmount)}
            color={COLORS.foundation.neutral.n700}
            textStyle={styles.amountInput}
          />
          <AppSlider
            prefix={true}
            minValue={sliderLimits.min}
            maxValue={sliderLimits.max}
            curValue={+loanAmount}
            setCurValue={setLoanAmount}
          />
        </View>

        {/* Duration & rate */}
        <View style={styles.card}>
          <View style={styles.gap8}>
            <View style={styles.rows_between}>
              <View style={styles.gap4}>
                <AppText
                  fontSize={13}
                  fontWeight={600}
                  value={t("mortgage.duration")}
                  color={COLORS.foundation.neutral.n500}
                />
                {!!durationHint && (
                  <AppText
                    fontSize={12}
                    fontWeight={500}
                    value={durationHint}
                    color={COLORS.foundation.gold.g500}
                  />
                )}
              </View>
              <AppInput
                keyboardType="number-pad"
                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, ""); // Keep only digits
                  if (!isNaN(+numericValue)) {
                    setMonth(+numericValue);
                  }
                }}
                value={month.toString()}
                fontSize={18}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                textStyle={styles.valuePill}
              />
            </View>
            <AppSlider
              minValue={1}
              maxValue={360}
              curValue={month}
              setCurValue={setMonth}
              prefix={false}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.gap8}>
            <View style={styles.rows_between}>
              <AppText
                fontSize={13}
                fontWeight={600}
                value={
                  type === 2
                    ? t("mortgage.interestRateMonthly")
                    : t("mortgage.interestRate")
                }
                color={COLORS.foundation.neutral.n500}
              />
              <AppInput
                fontSize={18}
                fontWeight={700}
                value={rate.toString()}
                keyboardType="decimal-pad"
                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9.]/g, "");
                  if (!isNaN(+numericValue)) {
                    setRate(numericValue);
                  }
                }}
                textStyle={styles.valuePill}
                color={COLORS.foundation.neutral.n700}
              />
            </View>
            <AppSlider
              minValue={type === 2 ? 0.1 : 1}
              maxValue={25}
              curValue={+rate}
              isFloat={true}
              setCurValue={setRate}
              prefix={false}
            />
          </View>
        </View>

        {/* Repayment method */}
        <View style={styles.card}>
          <AppIndicator
            tabs={[
              {
                id: 0,
                children: t("mortgage.fixedPayment"),
                isLeftBorder: true,
                tabWidth: TAB_AREA * 0.33,
              },
              {
                id: 1,
                children: t("mortgage.fixedPrincipal"),
                tabWidth: TAB_AREA * 0.34,
              },
              {
                id: 2,
                children: t("mortgage.flatRate"),
                isRightBorder: true,
                tabWidth: TAB_AREA * 0.33,
              },
            ]}
            activeKey={type}
            onPress={setType}
            isEqual={false}
          />
          <AppText
            value={
              type === 0
                ? t("mortgage.descFixedPayment")
                : type === 1
                  ? t("mortgage.descFixedPrincipal")
                  : t("mortgage.descFlatRate")
            }
            fontSize={13}
            fontWeight={400}
            color={COLORS.foundation.neutral.n500}
            textStyle={styles.methodDesc}
          />
          <AppTrustNotice
            summary={getFormulaSummary(type, t)}
            details={getFormulaDetails(type, t)}
            expandLabel={t("trust.actions.viewFormula")}
            collapseLabel={t("trust.actions.hideFormula")}
          />
        </View>

        <AppText
          value={t("trust.disclaimer.short")}
          fontSize={11}
          fontWeight={400}
          color={COLORS.foundation.neutral.n500}
          textStyle={styles.disclaimer}
        />
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={onNavMortgageLoanResult}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color={COLORS.foundation.neutral.n0} />
          ) : (
            <>
              <Image
                source={FINANCE_IMAGES.calculator}
                resizeMode="contain"
                style={styles.ctaIcon}
              />
              <AppText
                color={COLORS.foundation.neutral.n0}
                fontWeight={700}
                fontSize={16}
                value={t("mortgage.viewResult")}
              />
            </>
          )}
        </Pressable>
      </View>
    </AppView>
  );
};

export default MortgageLoanScreen;

const TAB_AREA = WIDTH - 32 - 32;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    width: "100%",
  },
  header: {
    paddingVertical: 4,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  amountHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroImage: {
    width: 64,
    height: 52,
  },
  amountInput: {
    width: "100%",
    paddingVertical: 4,
  },
  rows_between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gap4: { gap: 4 },
  gap8: { gap: 8 },
  valuePill: {
    minWidth: 84,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    textAlign: "center",
    backgroundColor: COLORS.foundation.blue.b50,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.foundation.neutral.n50,
  },
  methodDesc: {
    lineHeight: 19,
    paddingHorizontal: 2,
  },
  disclaimer: {
    lineHeight: 16,
    paddingHorizontal: 6,
    textAlign: "center",
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  cta: {
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.foundation.blue.b400,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaIcon: {
    width: 28,
    height: 28,
  },
});
