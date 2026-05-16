import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import dayjs from "dayjs";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
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
import AppView from "../../components/AppView";
import { COLORS } from "../../constants/colors";
import { WIDTH } from "../../constants/dimension";
import { ICONS } from "../../constants/icon";
import { exportLoanXlsxToDownloadsRNFA } from "../../hooks/export_excel";
import { calculateFixedMonthlyPayment, calculateFlatRatePayment } from "../../hooks/fixed_monthly_payment";
import { calculateFixedPrincipal } from "../../hooks/fixed_principal";
import { formatMonth } from "../../hooks/format_month";
import { formatNumber } from "../../hooks/format_number";
import { uuid } from "../../hooks/uuid";
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
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");

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
    return sortedPayments.reduce<{title: string; data: TPayment[]}[]>(
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
  const onClosePaymentModal = () => {
    setIsModalVisible(false);
    setPaymentAmount("");
    setPaymentError("");
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
              payment => payment.id !== paymentId,
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
        <View style={styles.statistic}>
          <View style={styles.title}>
            <AppText
              value={route.params?.label}
              fontSize={24}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
            />
          </View>
          <View style={[styles.rows, styles.justifyBetween]}>
            <AppText
              value={t("mortgageDetail.loanAmount")}
              fontSize={14}
              fontWeight={500}
              color={COLORS.foundation.neutral.n50}
            />
            <AppText
              value={formatNumber(
                mortgage?.loan_amount || 0,
                mortgage?.currency?.locale || currency.locale,
                true,
                mortgage?.currency?.code || currency.code,
              )}
              fontSize={15}
              fontWeight={500}
              color={COLORS.foundation.neutral.n0}
            />
          </View>
          <View style={[styles.rows, styles.justifyBetween]}>
            <AppText
              value={t("mortgageDetail.duration")}
              fontSize={14}
              fontWeight={500}
              color={COLORS.foundation.neutral.n50}
            />
            <AppText
              value={formatMonth(mortgage?.duration || 0, t)}
              fontSize={15}
              fontWeight={500}
              color={COLORS.foundation.neutral.n0}
            />
          </View>
          <View style={[styles.rows, styles.justifyBetween]}>
            <AppText
              value={t("mortgageDetail.interestRate")}
              fontSize={14}
              fontWeight={500}
              color={COLORS.foundation.neutral.n50}
            />
            <AppText
              value={`${mortgage?.int_rate || 0}%`}
              fontSize={15}
              fontWeight={500}
              color={COLORS.foundation.neutral.n0}
            />
          </View>
          <View style={styles.gap14}>
            <View style={[styles.rows, styles.gap8]}>
              <Pressable style={styles.halfWidthButton}>
                <AppText
                  fontSize={12}
                  fontWeight={500}
                  value={t("mortgageDetail.monthlyPayment") + " (Avg)"}
                  textStyle={styles.center}
                  color={COLORS.foundation.neutral.n500}
                />
                <AppText
                  allowFontScaling={true}
                  fontSize={15}
                  fontWeight={700}
                  value={formatNumber(
                    result?.averageMonthlyPayment || 0,
                    mortgage?.currency?.locale || currency.locale,
                    true,
                    mortgage?.currency?.code || currency.code,
                  )}
                  color={COLORS.foundation.blue.b500}
                />
              </Pressable>
              <Pressable style={styles.halfWidthButton}>
                <AppText
                  fontSize={12}
                  fontWeight={500}
                  value={t("mortgageDetail.totalInterestPaid")}
                  color={COLORS.foundation.neutral.n500}
                />
                <AppText
                  allowFontScaling={true}
                  fontSize={15}
                  fontWeight={700}
                  value={formatNumber(
                    result?.totalInterest || 0,
                    mortgage?.currency?.locale || currency.locale,
                    true,
                    mortgage?.currency?.code || currency.code,
                  )}
                  color={COLORS.foundation.blue.b500}
                />
              </Pressable>
            </View>
            <Pressable style={styles.fullWidthButton}>
              <AppText
                fontSize={12}
                fontWeight={500}
                value={t("mortgageDetail.totalPayments")}
                color={COLORS.foundation.neutral.n500}
              />
              <AppText
                allowFontScaling={true}
                fontSize={15}
                fontWeight={700}
                value={formatNumber(
                  result?.totalPayment || 0,
                  mortgage?.currency?.locale || currency.locale,
                  true,
                  mortgage?.currency?.code || currency.code,
                )}
                color={COLORS.foundation.blue.b500}
              />
            </Pressable>
          </View>
        </View>
      )}
      {tab === 1 && (
        <View style={styles.borderRadius}>
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
          <View style={styles.paymentSummary}>
            <View style={styles.paymentSummaryHeader}>
              <View>
                <AppText
                  value={t("main.totalPaid")}
                  fontSize={12}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                />
                <AppText
                  value={formatNumber(
                    paymentStats.paidAmount,
                    mortgage?.currency?.locale || currency.locale,
                    true,
                    mortgage?.currency?.code || currency.code,
                  )}
                  fontSize={20}
                  fontWeight={700}
                  color={COLORS.foundation.blue.b500}
                />
              </View>
              <Pressable
                style={[
                  styles.updateBtn,
                  paymentStats.remainingAmount <= 0 && styles.disabledBtn,
                ]}
                disabled={paymentStats.remainingAmount <= 0}
                onPress={onOpenPaymentModal}
              >
                <AppText
                  value={
                    paymentStats.remainingAmount <= 0
                      ? t("main.fullyPaid")
                      : t("main.updatePayment")
                  }
                  color={COLORS.foundation.neutral.n0}
                  fontWeight={600}
                  fontSize={14}
                />
              </Pressable>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${paymentStats.progress}%` },
                ]}
              />
            </View>
            <View style={styles.paymentStatGrid}>
              <View style={styles.paymentStatItem}>
                <AppText
                  value={t("main.remainingBalance")}
                  fontSize={11}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                />
                <AppText
                  value={formatNumber(
                    paymentStats.remainingAmount,
                    mortgage?.currency?.locale || currency.locale,
                    true,
                    mortgage?.currency?.code || currency.code,
                  )}
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  numberOfLines={1}
                />
              </View>
              <View style={styles.paymentStatItem}>
                <AppText
                  value={t("main.repaymentProgress")}
                  fontSize={11}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                />
                <AppText
                  value={`${paymentStats.progress.toFixed(0)}%`}
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                />
              </View>
              <View style={styles.paymentStatItem}>
                <AppText
                  value={t("main.paymentsRecorded")}
                  fontSize={11}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                />
                <AppText
                  value={sortedPayments.length.toString()}
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                />
              </View>
              <View style={styles.paymentStatItem}>
                <AppText
                  value={t("main.lastPayment")}
                  fontSize={11}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                />
                <AppText
                  value={
                    paymentStats.lastPayment
                      ? dayjs(paymentStats.lastPayment.date).format("DD/MM/YYYY")
                      : "--"
                  }
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                />
              </View>
            </View>
          </View>

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
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={COLORS.foundation.blue.b300}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          value={dayjs(payment.date).format("DD/MM/YYYY HH:mm")}
                          fontSize={14}
                          fontWeight={600}
                          color={COLORS.foundation.neutral.n700}
                        />
                        <AppText
                          value={t("main.monthlyRepayment")}
                          fontSize={12}
                          color={COLORS.foundation.neutral.n500}
                          fontWeight={400}
                        />
                      </View>
                      <AppText
                        value={`+${formatNumber(
                          payment.amount,
                          mortgage?.currency?.locale || currency.locale,
                          true,
                          mortgage?.currency?.code || currency.code,
                        )}`}
                        fontSize={15}
                        fontWeight={700}
                        color={COLORS.foundation.blue.b300}
                        numberOfLines={1}
                      />
                      <Pressable
                        onPress={() => onDeletePayment(payment.id)}
                        style={styles.deletePaymentBtn}
                      >
                        <Feather
                          name="trash-2"
                          size={16}
                          color="#D92D20"
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyPayments}>
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color={COLORS.foundation.neutral.n200}
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
  statistic: {
    width: WIDTH - 36,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    backgroundColor: COLORS.foundation.blue.b200,
    borderWidth: 1,
    borderColor: "black",
  },
  title: {
    width: WIDTH - 72,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n700,
    justifyContent: "center",
    alignItems: "center",
  },
  halfWidthButton: {
    width: (WIDTH - 36 - 44) / 2,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    gap: 4,
    height: 63,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  fullWidthButton: {
    width: WIDTH - 32 - 40,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    gap: 4,
    height: 63,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
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
  borderRadius: {
    borderRadius: 20,
    overflow: "hidden",
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
    gap: 20,
  },
  paymentList: {
    flex: 1,
  },
  paymentListContent: {
    gap: 16,
    paddingBottom: 12,
  },
  paymentSummary: {
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    gap: 14,
  },
  paymentSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    height: 8,
    width: "100%",
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: COLORS.foundation.neutral.n100,
  },
  progressFill: {
    height: "100%",
    borderRadius: 100,
    backgroundColor: COLORS.foundation.blue.b300,
  },
  paymentStatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentStatItem: {
    width: (WIDTH - 36 - 32 - 8) / 2,
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: COLORS.foundation.blue.b50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  updateBtn: {
    backgroundColor: COLORS.foundation.blue.b300,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  disabledBtn: {
    backgroundColor: COLORS.foundation.neutral.n200,
  },
  paymentGroup: {
    gap: 8,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
  deletePaymentBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.foundation.blue.b50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPayments: {
    padding: 40,
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
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
