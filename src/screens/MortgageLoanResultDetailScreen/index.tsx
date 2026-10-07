import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import AppBanner from "../../components/AppBanner";
import AppIconButton from "../../components/AppIconButton";
import AppIndicator from "../../components/AppIndicator";
import AppInput from "../../components/AppInput";
import AppText from "../../components/AppText";
import AppTrustNotice from "../../components/AppTrustNotice";
import AppLoanSummary from "../../components/AppLoanSummary";
import AppProgressRing from "../../components/AppProgressRing";
import { FINANCE_IMAGES } from "../../assets";
import AppView from "../../components/AppView";
import { COLORS } from "../../constants/colors";
import { WIDTH } from "../../constants/dimension";
import { ICONS } from "../../constants/icon";
import { exportLoanXlsxToDownloadsRNFA } from "../../hooks/export_excel";
import {
  calculateFixedMonthlyPayment,
  calculateFlatRatePayment,
} from "../../hooks/fixed_monthly_payment";
import { calculateFixedPrincipal } from "../../hooks/fixed_principal";
import { formatMonth } from "../../hooks/format_month";
import { formatNumber } from "../../hooks/format_number";
import { getFormulaDetails, getFormulaSummary } from "../../hooks/trust_copy";
import { uuid } from "../../hooks/uuid";
import { simulateWithExtraPayment } from "../../hooks/what_if_simulator";
import { navigationRef } from "../../navigation";
import { TLoan, TPayment, updateLoan } from "../../redux/slices/history";
import { RootState } from "../../redux/store";
import { TNavigation } from "../../utils/types/navigation";
import Table from "./components/Table";

type Props = NativeStackScreenProps<
  TNavigation,
  "MortgageLoanResultDetailScreen"
>;
const MortgageLoanResultDetailScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const scrollRef = useRef<Animated.ScrollView>(null);
  const [tab, setTab] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWhatIfModalVisible, setIsWhatIfModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [extraPayment, setExtraPayment] = useState("");

  const { currency } = useSelector((state: RootState) => state.app);
  const history = useSelector((state: RootState) => state.history);

  const historyMorgage = useMemo(() => {
    if (route.params?.id) {
      return history.find((item) => item.id === route.params?.id);
    }
  }, [history, route.params?.id]);
  const curMortgage = useSelector((state: RootState) => state.mortgage_loan);
  const mortgage = useMemo(
    () => (route.params?.isHistory ? historyMorgage : curMortgage),
    [historyMorgage, curMortgage, route.params?.isHistory],
  );
  const result = useMemo(
    () =>
      mortgage?.type === 1
        ? calculateFixedPrincipal(mortgage)
        : mortgage?.type === 2
          ? calculateFlatRatePayment(mortgage)
          : calculateFixedMonthlyPayment(mortgage!),
    [mortgage],
  );
  const sortedPayments = useMemo(() => {
    return [...(mortgage?.payments || [])].sort(
      (left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf(),
    );
  }, [mortgage?.payments]);
  const paymentStats = useMemo(() => {
    const paidFromHistory = sortedPayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );
    const paidAmount = Math.max(paidFromHistory, mortgage?.paid_amount || 0);
    const totalAmount = result?.totalPayment || mortgage?.loan_amount || 0;
    const remainingAmount = Math.max(totalAmount - paidAmount, 0);
    const progress = totalAmount
      ? Math.min((paidAmount / totalAmount) * 100, 100)
      : 0;

    return {
      paidAmount,
      remainingAmount,
      progress,
      lastPayment: sortedPayments[0],
    };
  }, [
    mortgage?.loan_amount,
    mortgage?.paid_amount,
    result?.totalPayment,
    sortedPayments,
  ]);
  const groupedPayments = useMemo(() => {
    return sortedPayments.reduce<{ title: string; data: TPayment[] }[]>(
      (groups, payment) => {
        const title = dayjs(payment.date).format("MM/YYYY");
        const currentGroup = groups.find((group) => group.title === title);

        if (currentGroup) {
          currentGroup.data.push(payment);
        } else {
          groups.push({ title, data: [payment] });
        }

        return groups;
      },
      [],
    );
  }, [sortedPayments]);
  const normalizedPaymentAmount = useMemo(
    () => Number(paymentAmount),
    [paymentAmount],
  );
  const formattedPaymentAmount = useMemo(() => {
    if (!paymentAmount) {
      return "";
    }

    return new Intl.NumberFormat(
      mortgage?.currency?.locale || currency.locale,
    ).format(Number(paymentAmount));
  }, [currency.locale, mortgage?.currency?.locale, paymentAmount]);
  const canSubmitPayment =
    !!mortgage &&
    normalizedPaymentAmount > 0 &&
    paymentStats.remainingAmount > 0 &&
    normalizedPaymentAmount <= paymentStats.remainingAmount;
  const normalizedExtraPayment = useMemo(
    () => Number(extraPayment || 0),
    [extraPayment],
  );
  const whatIfResult = useMemo(() => {
    if (!mortgage || !result) {
      return null;
    }

    return simulateWithExtraPayment(
      mortgage,
      normalizedExtraPayment,
      result.totalInterest || 0,
    );
  }, [mortgage, normalizedExtraPayment, result]);
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onDownload = useCallback(() => {
    exportLoanXlsxToDownloadsRNFA(
      result?.monthlyBreakdown || [],
      `Report-${dayjs(new Date()).format("DD-MM-YYYY")}`,
      {
        locale: mortgage?.currency?.locale || currency.locale,
        code: mortgage?.currency?.code || currency.code,
      },
    );
  }, [result, mortgage, currency]);
  const onRecalculate = useCallback(() => {
    if (!mortgage) {
      return;
    }

    navigationRef.navigate("MortgageLoanScreen", {
      label: route.params?.label || "",
      recalculateLoanId: route.params?.id,
      recalculateSource: {
        loan_amount: mortgage.loan_amount,
        duration: mortgage.duration,
        int_rate: mortgage.int_rate,
        type: mortgage.type,
      },
    });
  }, [mortgage, route.params?.id, route.params?.label]);

  const onOpenPaymentModal = () => {
    setPaymentError("");
    setIsModalVisible(true);
  };
  const onChangePaymentAmount = (value: string) => {
    const normalizedValue = value.replace(/[^0-9]/g, "");
    const nextAmount = Number(normalizedValue);

    setPaymentAmount(normalizedValue);
    setPaymentError(
      paymentStats.remainingAmount > 0 &&
        nextAmount > paymentStats.remainingAmount
        ? t("main.paymentAmountExceeded")
        : "",
    );
  };
  const onPayAll = () => {
    const nextAmount = Number(paymentStats.remainingAmount.toFixed(2));
    setPaymentAmount(nextAmount.toString());
    setPaymentError("");
  };
  const onClosePaymentModal = () => {
    setIsModalVisible(false);
    setPaymentAmount("");
    setPaymentError("");
  };
  const onOpenWhatIfModal = () => {
    setIsWhatIfModalVisible(true);
  };
  const onCloseWhatIfModal = () => {
    setIsWhatIfModalVisible(false);
  };
  const onChangeExtraPayment = (value: string) => {
    const normalizedValue = value.replace(/[^0-9]/g, "");
    setExtraPayment(normalizedValue);
  };
  const onUpdatePayment = () => {
    if (!mortgage || normalizedPaymentAmount <= 0) {
      setPaymentError(t("main.invalidPaymentAmount"));
      return;
    }

    if (paymentStats.remainingAmount <= 0) {
      setPaymentError(t("main.fullyPaid"));
      return;
    }

    if (normalizedPaymentAmount > paymentStats.remainingAmount) {
      setPaymentError(t("main.paymentAmountExceeded"));
      return;
    }

    const activeLoan = mortgage as TLoan;
    const payments = [
      ...(activeLoan.payments || []),
      {
        id: uuid(),
        date: new Date().toISOString(),
        amount: normalizedPaymentAmount,
      },
    ];

    dispatch(
      updateLoan({
        ...activeLoan,
        label: activeLoan.label || route.params?.label || "",
        paid_amount: payments.reduce(
          (total, payment) => total + payment.amount,
          0,
        ),
        payments,
      } as TLoan),
    );
    onClosePaymentModal();
  };
  const onDeletePayment = (paymentId: string) => {
    if (!mortgage) {
      return;
    }

    Alert.alert(
      t("mortgageDetail.deletePaymentTitle"),
      t("mortgageDetail.deletePaymentDesc"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
        },
        {
          text: t("mortgageDetail.deletePaymentAction"),
          style: "destructive",
          onPress: () => {
            const activeLoan = mortgage as TLoan;
            const payments = (activeLoan.payments || []).filter(
              (payment) => payment.id !== paymentId,
            );

            dispatch(
              updateLoan({
                ...activeLoan,
                label: activeLoan.label || route.params?.label || "",
                paid_amount: payments.reduce(
                  (total, payment) => total + payment.amount,
                  0,
                ),
                payments,
              } as TLoan),
            );
          },
        },
      ],
    );
  };
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <View style={[styles.rows, styles.titleCenter]}>
          <AppText
            value={t("mortgageDetail.amortization")}
            fontSize={20}
            fontWeight={600}
            color={COLORS.foundation.neutral.n700}
            numberOfLines={1}
          />
        </View>
        <AppIconButton onPress={onDownload}>
          <ICONS.download />
        </AppIconButton>
      </View>
      <AppIndicator
        tabs={[
          {
            id: 0,
            children: t("mortgageDetail.summary"),
            isLeftBorder: true,
            tabWidth: (WIDTH - 36) * (route.params?.isHistory ? 0.33 : 0.5),
          },

          {
            id: 1,
            children: t("mortgageDetail.analysisByMonth"),
            tabWidth: (WIDTH - 36) * (route.params?.isHistory ? 0.33 : 0.5),
            isRightBorder: !route.params?.isHistory,
          },
          ...(route.params?.isHistory
            ? [
                {
                  id: 2,
                  children: t("main.updatePayment"),
                  isRightBorder: true,
                  tabWidth: (WIDTH - 36) * 0.33,
                },
              ]
            : []),
        ]}
        activeKey={tab}
        onPress={setTab}
        isEqual={false}
      />
      {tab === 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.summaryScrollContent}
        >
          <AppLoanSummary
            label={route.params?.label || ""}
            loanAmount={mortgage?.loan_amount || 0}
            duration={mortgage?.duration || 0}
            interestRate={mortgage?.int_rate || 0}
            averageMonthlyPayment={result?.averageMonthlyPayment || 0}
            totalInterest={result?.totalInterest || 0}
            totalPayment={result?.totalPayment || 0}
            locale={mortgage?.currency?.locale || currency.locale}
            currencyCode={mortgage?.currency?.code || currency.code}
          />
          <View style={styles.whatIfActionRow}>
            <Pressable style={styles.actionTile} onPress={onOpenWhatIfModal}>
              <Image
                source={FINANCE_IMAGES.savingsJar}
                resizeMode="contain"
                style={styles.actionTileImage}
              />
              <AppText
                value={t("whatIf.title")}
                fontSize={13}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                numberOfLines={2}
                textStyle={styles.actionTileText}
              />
            </Pressable>
            {route.params?.isHistory && (
              <Pressable style={styles.actionTile} onPress={onRecalculate}>
                <Image
                  source={FINANCE_IMAGES.calculator}
                  resizeMode="contain"
                  style={styles.actionTileImage}
                />
                <AppText
                  value={t("mortgageResult.recalculate")}
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  numberOfLines={2}
                  textStyle={styles.actionTileText}
                />
              </Pressable>
            )}
          </View>
          <AppTrustNotice
            summary={getFormulaSummary(mortgage?.type || 0, t)}
            details={`${getFormulaDetails(mortgage?.type || 0, t)}\n\n${t(
              "trust.disclaimer.notAdvice",
            )}`}
            expandLabel={t("trust.actions.viewFormula")}
            collapseLabel={t("trust.actions.hideFormula")}
          />
        </ScrollView>
      )}
      {tab === 1 && (
        <View style={styles.tableContainer}>
          <Table
            result={result}
            mortgage={mortgage}
            onScrollEnd={() => {
              scrollRef.current?.scrollToEnd();
            }}
          />
        </View>
      )}
      {tab === 2 && (
        <View style={styles.paymentContainer}>
          <ImageBackground
            source={FINANCE_IMAGES.cityBackground}
            resizeMode="cover"
            style={styles.paymentHero}
            imageStyle={styles.paymentHeroImage}
          >
            <View pointerEvents="none" style={styles.paymentHeroOverlay} />
            <View style={styles.paymentHeroTop}>
              <View style={styles.flex}>
                <AppText
                  value={t("main.remainingBalance")}
                  fontSize={13}
                  fontWeight={500}
                  color="rgba(255,255,255,0.75)"
                />
                <AppText
                  value={formatNumber(
                  paymentStats.remainingAmount,
                  mortgage?.currency?.locale || currency.locale,
                  true,
                  mortgage?.currency?.code || currency.code,
                )}
                  fontSize={26}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n0}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                />
                <AppText
                  value={`${t("main.totalPaid")}: ${formatNumber(
                  paymentStats.paidAmount,
                  mortgage?.currency?.locale || currency.locale,
                  true,
                  mortgage?.currency?.code || currency.code,
                )}`}
                  fontSize={12}
                  fontWeight={600}
                  color={COLORS.foundation.gold.g300}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                />
              </View>
              <AppProgressRing progress={paymentStats.progress} size={84} />
            </View>
            <View style={styles.paymentHeroStats}>
              <View style={styles.flex}>
                <AppText
                  value={t("main.paymentsRecorded")}
                  fontSize={11}
                  fontWeight={500}
                  color="rgba(255,255,255,0.7)"
                />
                <AppText
                  value={sortedPayments.length.toString()}
                  fontSize={15}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n0}
                />
              </View>
              <View style={styles.paymentHeroDivider} />
              <View style={styles.flex}>
                <AppText
                  value={t("main.lastPayment")}
                  fontSize={11}
                  fontWeight={500}
                  color="rgba(255,255,255,0.7)"
                />
                <AppText
                  value={
                    paymentStats.lastPayment
                      ? dayjs(paymentStats.lastPayment.date).format("DD/MM/YYYY")
                      : "--"
                  }
                  fontSize={15}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n0}
                />
              </View>
            </View>
          </ImageBackground>

          <Pressable
            style={({ pressed }) => [
              styles.paymentCta,
              paymentStats.remainingAmount <= 0 && styles.paymentCtaDone,
              pressed && styles.pressed,
            ]}
            disabled={paymentStats.remainingAmount <= 0}
            onPress={onOpenPaymentModal}
          >
            <Feather
              name={paymentStats.remainingAmount <= 0 ? "check-circle" : "plus-circle"}
              size={20}
              color={COLORS.foundation.neutral.n0}
            />
            <AppText
              value={
                paymentStats.remainingAmount <= 0
                  ? t("main.fullyPaid")
                  : t("main.updatePayment")
              }
              color={COLORS.foundation.neutral.n0}
              fontWeight={700}
              fontSize={16}
            />
          </Pressable>

          <ScrollView
            style={styles.paymentList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.paymentListContent}
          >
            {groupedPayments.length > 0 ? (
              groupedPayments.map((group) => (
                <View key={group.title} style={styles.paymentGroup}>
                  <AppText
                    value={group.title}
                    fontSize={12}
                    color={COLORS.foundation.neutral.n500}
                    fontWeight={600}
                  />
                  {group.data.map((payment) => (
                    <View key={payment.id} style={styles.paymentItem}>
                      <View style={styles.paymentIcon}>
                        <Image
                          source={FINANCE_IMAGES.receipt}
                          resizeMode="contain"
                          style={styles.paymentIconImage}
                        />
                      </View>
                      <View style={styles.flex}>
                        <AppText
                          value={`+${formatNumber(
                            payment.amount,
                            mortgage?.currency?.locale || currency.locale,
                            true,
                            mortgage?.currency?.code || currency.code,
                          )}`}
                          fontSize={16}
                          fontWeight={700}
                          color={COLORS.foundation.sage.s500}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        />
                        <AppText
                          value={dayjs(payment.date).format("DD/MM/YYYY · HH:mm")}
                          fontSize={12}
                          fontWeight={500}
                          color={COLORS.foundation.neutral.n500}
                        />
                      </View>
                      <Pressable
                        onPress={() => onDeletePayment(payment.id)}
                        style={styles.deletePaymentBtn}
                        hitSlop={8}
                      >
                        <Feather name="trash-2" size={15} color="#D92D20" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyPayments}>
                <Image
                  source={FINANCE_IMAGES.receipt}
                  resizeMode="contain"
                  style={styles.emptyPaymentsImage}
                />
                <AppText
                  value={t("main.noPayments")}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                  fontSize={14}
                />
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={onClosePaymentModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback accessible={false}>
              <View style={styles.modalContent}>
                <AppText
                  value={t("main.updatePayment")}
                  fontSize={20}
                  fontWeight={700}
                  textStyle={{ marginBottom: 20 }}
                  color={COLORS.foundation.neutral.n700}
                />
                <AppInput
                  placeholder={t("main.paidThisMonth")}
                  value={formattedPaymentAmount}
                  onChangeText={onChangePaymentAmount}
                  keyboardType="number-pad"
                  color={COLORS.foundation.neutral.n700}
                  fontSize={16}
                  fontWeight={400}
                  placeholderTextColor={COLORS.foundation.neutral.n200}
                />
                <View style={styles.modalHint}>
                  <AppText
                    value={`${t("main.remainingBalance")}: ${formatNumber(
                      paymentStats.remainingAmount,
                      mortgage?.currency?.locale || currency.locale,
                      true,
                      mortgage?.currency?.code || currency.code,
                    )}`}
                    color={COLORS.foundation.neutral.n500}
                    fontWeight={400}
                    fontSize={12}
                  />
                  <Pressable
                    style={styles.payAllBtn}
                    onPress={onPayAll}
                    disabled={paymentStats.remainingAmount <= 0}
                  >
                    <AppText
                      value={t("main.payAll")}
                      color={COLORS.foundation.blue.b300}
                      fontWeight={700}
                      fontSize={12}
                    />
                  </Pressable>
                  {!!paymentError && (
                    <AppText
                      value={paymentError}
                      color="#D92D20"
                      fontWeight={500}
                      fontSize={12}
                    />
                  )}
                </View>
                <View style={[styles.rows, { marginTop: 24, gap: 12 }]}>
                  <Pressable
                    style={[
                      styles.modalBtn,
                      { backgroundColor: COLORS.foundation.neutral.n100 },
                    ]}
                    onPress={onClosePaymentModal}
                  >
                    <AppText
                      value={t("main.cancel")}
                      fontWeight={600}
                      fontSize={15}
                      color={COLORS.foundation.neutral.n700}
                    />
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalBtn,
                      {
                        backgroundColor: canSubmitPayment
                          ? COLORS.foundation.blue.b300
                          : COLORS.foundation.neutral.n100,
                      },
                    ]}
                    disabled={!canSubmitPayment}
                    onPress={onUpdatePayment}
                  >
                    <AppText
                      value={t("main.confirm")}
                      color={
                        canSubmitPayment
                          ? COLORS.foundation.neutral.n0
                          : COLORS.foundation.neutral.n500
                      }
                      fontWeight={600}
                      fontSize={15}
                    />
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="fade"
        transparent
        visible={isWhatIfModalVisible}
        onRequestClose={onCloseWhatIfModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback accessible={false}>
              <View style={styles.modalContent}>
                <AppText
                  value={t("whatIf.title")}
                  fontSize={20}
                  fontWeight={700}
                  textStyle={{ marginBottom: 12 }}
                  color={COLORS.foundation.neutral.n700}
                />
                {mortgage?.type !== 0 ? (
                  <AppText
                    value={t("whatIf.supportNote")}
                    fontSize={12}
                    fontWeight={400}
                    color={COLORS.foundation.neutral.n500}
                  />
                ) : (
                  <>
                    <AppInput
                      placeholder={t("whatIf.extraMonthly")}
                      value={
                        extraPayment
                          ? new Intl.NumberFormat(
                              mortgage?.currency?.locale || currency.locale,
                            ).format(Number(extraPayment))
                          : ""
                      }
                      onChangeText={onChangeExtraPayment}
                      keyboardType="number-pad"
                      color={COLORS.foundation.neutral.n700}
                      fontSize={15}
                      fontWeight={500}
                      placeholderTextColor={COLORS.foundation.neutral.n200}
                    />
                    <View style={styles.whatIfGrid}>
                      <View style={styles.whatIfItem}>
                        <AppText
                          value={t("whatIf.monthsSaved")}
                          fontSize={11}
                          fontWeight={400}
                          color={COLORS.foundation.neutral.n500}
                        />
                        <AppText
                          value={`${whatIfResult?.monthsSaved || 0}`}
                          fontSize={14}
                          fontWeight={700}
                          color={COLORS.foundation.blue.b500}
                        />
                      </View>
                      <View style={styles.whatIfItem}>
                        <AppText
                          value={t("whatIf.interestSaved")}
                          fontSize={11}
                          fontWeight={400}
                          color={COLORS.foundation.neutral.n500}
                        />
                        <AppText
                          value={formatNumber(
                            whatIfResult?.interestSaved || 0,
                            mortgage?.currency?.locale || currency.locale,
                            true,
                            mortgage?.currency?.code || currency.code,
                          )}
                          fontSize={14}
                          fontWeight={700}
                          color={COLORS.foundation.blue.b500}
                          numberOfLines={1}
                        />
                      </View>
                    </View>
                    <View style={styles.whatIfGrid}>
                      <View style={styles.whatIfItem}>
                        <AppText
                          value={t("whatIf.newPayoff")}
                          fontSize={11}
                          fontWeight={400}
                          color={COLORS.foundation.neutral.n500}
                        />
                        <AppText
                          value={formatMonth(
                            whatIfResult?.newDurationMonths || 0,
                            t,
                          )}
                          fontSize={14}
                          fontWeight={700}
                          color={COLORS.foundation.neutral.n700}
                        />
                      </View>
                      <View style={styles.whatIfItem}>
                        <AppText
                          value={t("whatIf.newTotalPayment")}
                          fontSize={11}
                          fontWeight={400}
                          color={COLORS.foundation.neutral.n500}
                        />
                        <AppText
                          value={formatNumber(
                            whatIfResult?.newTotalPayment ||
                              result?.totalPayment ||
                              0,
                            mortgage?.currency?.locale || currency.locale,
                            true,
                            mortgage?.currency?.code || currency.code,
                          )}
                          fontSize={14}
                          fontWeight={700}
                          color={COLORS.foundation.neutral.n700}
                          numberOfLines={1}
                        />
                      </View>
                    </View>
                  </>
                )}
                <View style={[styles.rows, { marginTop: 16 }]}>
                  <Pressable
                    style={[
                      styles.modalBtn,
                      { backgroundColor: COLORS.foundation.neutral.n100 },
                    ]}
                    onPress={onCloseWhatIfModal}
                  >
                    <AppText
                      value={t("main.cancel")}
                      fontWeight={600}
                      fontSize={15}
                      color={COLORS.foundation.neutral.n700}
                    />
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.promotion}
      >
        <AppBanner />
      </Animated.View>
    </AppView>
  );
};

export default MortgageLoanResultDetailScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    gap: 14,
    width: "100%",
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  home: {
    width: 33,
    height: 33,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.foundation.neutral.n900,
  },
  rows: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  summaryScrollContent: {
    paddingTop: 14,
    paddingBottom: 120,
    gap: 14,
  },
  gap8: {
    gap: 8,
  },
  gap14: {
    gap: 14,
  },
  head: {
    height: 40,
    backgroundColor: COLORS.foundation.blue.b300,
  },
  text: { margin: 6, color: COLORS.foundation.neutral.n0 },
  tableContainer: {
    flex: 1,
  },
  center: {
    textAlign: "center",
  },
  titleCenter: {
    width: "55%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  paymentContainer: {
    flex: 1,
    gap: 14,
    paddingTop: 14,
  },
  paymentList: {
    flex: 1,
  },
  paymentListContent: {
    gap: 16,
    paddingBottom: 12,
  },
  paymentHero: {
    borderRadius: 26,
    padding: 18,
    gap: 16,
    overflow: "hidden",
    backgroundColor: COLORS.foundation.blue.b500,
  },
  paymentHeroImage: {
    borderRadius: 26,
  },
  paymentHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 30, 60, 0.4)",
  },
  paymentHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  paymentHeroStats: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(226,194,117,0.3)",
  },
  paymentHeroDivider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  paymentCta: {
    height: 54,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.foundation.blue.b400,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  paymentCtaDone: {
    backgroundColor: COLORS.foundation.sage.s500,
    shadowOpacity: 0,
    elevation: 0,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  actionTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.foundation.neutral.n0,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionTileImage: {
    width: 40,
    height: 40,
  },
  actionTileText: {
    flex: 1,
  },
  whatIfActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  whatIfGrid: {
    flexDirection: "row",
    gap: 8,
  },
  whatIfItem: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: COLORS.foundation.blue.b50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  paymentGroup: {
    gap: 8,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 12,
    borderRadius: 20,
    gap: 12,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  deletePaymentBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDECEA",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.foundation.sage.s50,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconImage: {
    width: 36,
    height: 36,
  },
  emptyPayments: {
    padding: 28,
    alignItems: "center",
    gap: 8,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  emptyPaymentsImage: {
    width: 96,
    height: 96,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHint: {
    gap: 6,
  },
  payAllBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: COLORS.foundation.neutral.n0,
  },
  floatingDown: {
    transform: [{ rotate: "-90deg" }],
  },
  promotion: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
});
