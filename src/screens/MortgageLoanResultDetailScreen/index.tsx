import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useInterstitialAd } from "react-native-google-mobile-ads";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import AppBanner from "../../components/AppBanner";
import AppIconButton from "../../components/AppIconButton";
import AppIndicator from "../../components/AppIndicator";
import AppInput from "../../components/AppInput";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { ADS } from "../../constants/ads";
import { COLORS } from "../../constants/colors";
import { WIDTH } from "../../constants/dimension";
import { ICONS } from "../../constants/icon";
import { exportLoanXlsxToDownloadsRNFA } from "../../hooks/export_excel";
import { calculateFixedMonthlyPayment, calculateFlatRatePayment } from "../../hooks/fixed_monthly_payment";
import { calculateFixedPrincipal } from "../../hooks/fixed_principal";
import { formatMonth } from "../../hooks/format_month";
import { formatNumber } from "../../hooks/format_number";
import { navigationRef } from "../../navigation";
import { TLoan, updateLoan } from "../../redux/slices/history";
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
  const { isLoaded, load, show, isClosed } = useInterstitialAd(
    ADS.interstitial,
  );
  const [shouldDownloadAfterAd, setShouldDownloadAfterAd] = useState(false);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const [tab, setTab] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

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

  const onUpdatePayment = () => {
    if (mortgage && paymentAmount) {
      const numericAmount = parseFloat(paymentAmount);
      if (!isNaN(numericAmount)) {
        const activeLoan = mortgage as TLoan;
        dispatch(
          updateLoan({
            ...activeLoan,
            label: activeLoan.label || route.params?.label || "",
            paid_amount: (activeLoan.paid_amount || 0) + numericAmount,
            payments: [
              ...(activeLoan.payments || []),
              {
                id: Math.random().toString(),
                date: new Date().toISOString(),
                amount: numericAmount,
              },
            ],
          } as TLoan),
        );
        setIsModalVisible(false);
        setPaymentAmount("");
      }
    }
  };
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (isClosed && shouldDownloadAfterAd) {
      setShouldDownloadAfterAd(false);
      onDownload();
    }
  }, [isClosed, onDownload, shouldDownloadAfterAd]);
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
        <AppIconButton
          onPress={() => {
            if (isLoaded) {
              setShouldDownloadAfterAd(true);
              show();
            } else {
              onDownload();
              load();
            }
          }}
        >
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
            <View>
              <AppText
                value={t("main.totalPaid")}
                fontSize={12}
                color={COLORS.foundation.neutral.n500}
                fontWeight={400}
              />
              <AppText
                value={formatNumber(
                  mortgage?.paid_amount || 0,
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
              style={styles.updateBtn}
              onPress={() => setIsModalVisible(true)}
            >
              <AppText
                value={t("main.updatePayment")}
                color={COLORS.foundation.neutral.n0}
                fontWeight={600}
                fontSize={14}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.paymentList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.paymentListContent}
          >
            {mortgage?.payments && mortgage.payments.length > 0 ? (
              [...mortgage.payments].reverse().map((payment) => (
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
                      value={t('main.monthlyRepayment')}
                      fontSize={12}
                      color={COLORS.foundation.neutral.n500}
                      fontWeight={400}
                    />
                  </View>
                  <AppText
                    value={`+${formatNumber(payment.amount, mortgage?.currency?.locale || currency.locale, true, mortgage?.currency?.code || currency.code)}`}
                    fontSize={15}
                    fontWeight={700}
                    color={COLORS.foundation.blue.b300}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyPayments}>
                <AppText
                  value={t('main.noPayments')}
                  color={COLORS.foundation.neutral.n500}
                  fontWeight={400}
                  fontSize={14}
                />
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {isModalVisible && (
        <View style={styles.modalOverlay}>
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
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              color={COLORS.foundation.neutral.n700}
              fontSize={16}
              fontWeight={400}
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
            <View style={[styles.rows, { marginTop: 24, gap: 12 }]}>
              <Pressable
                style={[
                  styles.modalBtn,
                  { backgroundColor: COLORS.foundation.neutral.n100 },
                ]}
                onPress={() => setIsModalVisible(false)}
              >
                <AppText
                  value={t('main.cancel')}
                  fontWeight={600}
                  fontSize={15}
                  color={COLORS.foundation.neutral.n700}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.modalBtn,
                  { backgroundColor: COLORS.foundation.blue.b300 },
                ]}
                onPress={onUpdatePayment}
              >
                <AppText
                  value={t('main.confirm')}
                  color={COLORS.foundation.neutral.n0}
                  fontWeight={600}
                  fontSize={15}
                />
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
    gap: 12,
    paddingBottom: 12,
  },
  paymentSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
  updateBtn: {
    backgroundColor: COLORS.foundation.blue.b300,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
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
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 24,
    gap: 12,
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
