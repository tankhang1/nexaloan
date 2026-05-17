import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
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
import { addLoan } from "../../redux/slices/mortgage_loan_slices";
import { RootState } from "../../redux/store";
import { TNavigation } from "../../utils/types/navigation";
type Props = NativeStackScreenProps<TNavigation, "MortgageLoanScreen">;
const MortgageLoanScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const { currency } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();

  const [loanAmount, setLoanAmount] = useState<string | number>(4000);
  const [month, setMonth] = useState(1);
  const [type, setType] = useState(0);
  const [rate, setRate] = useState<string | number>(1);
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
  return (
    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
      <AppView appStyle={styles.overall}>
        <View style={styles.header}>
          <AppIconButton onPress={onGoBack}>
            <ICONS.button.chervon_left />
          </AppIconButton>
          <AppText
            value={route.params.label || t("mortgage.title")}
            fontSize={20}
            fontWeight={600}
            color={COLORS.foundation.neutral.n700}
          />
          <AppIconButton onPress={onNavSetting}>
            <ICONS.button.setting />
          </AppIconButton>
        </View>
        <View style={styles.body_container}>
          <View style={styles.gap40}>
            <View style={[styles.center, styles.gap8]}>
              <View style={[styles.rows, styles.gap8]}>
                <AppText
                  fontSize={14}
                  fontWeight={500}
                  value={t("mortgage.loanAmount")}
                  color={COLORS.foundation.neutral.n200}
                />
                {/* <ICONS.info /> */}
              </View>
              <AppInput
                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, ""); // Keep only digits
                  if (!isNaN(+numericValue)) {
                    setLoanAmount(numericValue);
                  }
                }}
                keyboardType="numbers-and-punctuation"
                fontSize={40}
                fontWeight={500}
                value={new Intl.NumberFormat(currency.locale).format(
                  +loanAmount,
                )}
                color={COLORS.foundation.neutral.n700}
                textStyle={{ width: "100%", textAlign: "center" }}
              />
              <AppSlider
                prefix={true}
                minValue={sliderLimits.min}
                maxValue={sliderLimits.max}
                curValue={+loanAmount}
                setCurValue={setLoanAmount}
              />
            </View>
            <View style={styles.gap8}>
              <View style={styles.rows_between}>
                <View style={[styles.rows_left, styles.gap8]}>
                  <AppText
                    fontSize={14}
                    fontWeight={500}
                    value={t("mortgage.duration")}
                    color={COLORS.foundation.neutral.n200}
                  />
                  {/* <ICONS.info /> */}
                </View>
                <AppInput
                  keyboardType="numbers-and-punctuation"
                  onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9]/g, ""); // Keep only digits
                    if (!isNaN(+numericValue)) {
                      setMonth(+numericValue);
                    }
                  }}
                  value={month.toString()}
                  fontSize={16}
                  fontWeight={600}
                  color={COLORS.foundation.neutral.n700}
                  textStyle={styles.inputBox}
                />
              </View>
              <AppSlider
                minValue={1}
                maxValue={200}
                curValue={month}
                setCurValue={setMonth}
                prefix={false}
              />
            </View>
            <View style={styles.gap8}>
              <View style={styles.rows_between}>
                <View style={[styles.rows_left, styles.gap8]}>
                  <AppText
                    fontSize={14}
                    fontWeight={500}
                    value={
                      type === 2
                        ? t("mortgage.interestRateMonthly")
                        : t("mortgage.interestRate")
                    }
                    color={COLORS.foundation.neutral.n200}
                  />
                  {/* <ICONS.info /> */}
                </View>
                <AppInput
                  fontSize={16}
                  fontWeight={600}
                  value={rate.toString()}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9.]/g, "");
                    if (!isNaN(+numericValue)) {
                      setRate(numericValue);
                    }
                  }}
                  textStyle={styles.rateInputBox}
                  color={COLORS.foundation.neutral.n700}
                />
              </View>
              <AppSlider
                minValue={type === 2 ? 0.1 : 1}
                maxValue={type === 2 ? 25 : 25}
                curValue={+rate}
                isFloat={true}
                setCurValue={setRate}
                prefix={false}
              />
            </View>
          </View>
          <View style={styles.gap14}>
            <AppIndicator
              tabs={[
                {
                  id: 0,
                  children: t("mortgage.fixedPayment"),
                  isLeftBorder: true,
                  tabWidth: (WIDTH - 36) * 0.33,
                },
                {
                  id: 1,
                  children: t("mortgage.fixedPrincipal"),
                  tabWidth: (WIDTH - 36) * 0.34,
                },
                {
                  id: 2,
                  children: t("mortgage.flatRate"),
                  isRightBorder: true,
                  tabWidth: (WIDTH - 36) * 0.33,
                },
              ]}
              activeKey={type}
              onPress={setType}
              isEqual={false}
            />
            <View style={{ minHeight: 40, paddingHorizontal: 4 }}>
              <AppText
                value={
                  type === 0
                    ? t("mortgage.descFixedPayment")
                    : type === 1
                      ? t("mortgage.descFixedPrincipal")
                      : t("mortgage.descFlatRate")
                }
                fontSize={12}
                fontWeight={400}
                color={COLORS.foundation.neutral.n500}
                textStyle={{ fontStyle: "italic", lineHeight: 18 }}
              />
            </View>
            <AppTrustNotice
              summary={getFormulaSummary(type, t)}
              details={getFormulaDetails(type, t)}
              expandLabel={t("trust.actions.viewFormula")}
              collapseLabel={t("trust.actions.hideFormula")}
            />
            <AppTrustNotice
              summary={t("trust.disclaimer.short")}
              details={t("trust.disclaimer.long")}
              expandLabel={t("trust.actions.readDisclaimer")}
              collapseLabel={t("trust.actions.hideDisclaimer")}
            />
            <AppIconButton
              style={{ width: WIDTH - 36 }}
              onPress={onNavMortgageLoanResult}
            >
              <View style={[styles.rows, styles.gap8]}>
                {isPending && <ActivityIndicator />}
                {!isPending && <ICONS.calculator />}
                {!isPending && (
                  <AppText
                    color="#090A0B"
                    fontWeight={600}
                    fontSize={14}
                    value={t("mortgage.calculate")}
                  />
                )}
              </View>
            </AppIconButton>
          </View>
        </View>
      </AppView>
    </KeyboardAwareScrollView>
  );
};

export default MortgageLoanScreen;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 15,
    gap: 16,
    width: "100%",
  },
  header: {
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rows: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rows_between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rows_left: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  gap8: { gap: 8 },
  gap14: { gap: 14 },
  gap40: { gap: 40 },
  textCenter: {
    textAlign: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  keyboardAvoiding: { flex: 1 },
  body_container: { justifyContent: "space-between", flex: 1 },
  inputBox: {
    width: 70,
    textAlign: "center",
  },
  rateInputBox: {
    width: 92,
    textAlign: "center",
  },
});
