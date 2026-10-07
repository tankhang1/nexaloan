import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import AppText from "../../../components/AppText";
import { COLORS } from "../../../constants/colors";
import {
  FixedPrincipalResult,
  MonthlyBreakdown,
} from "../../../hooks/fixed_monthly_payment";
import { formatNumber } from "../../../hooks/format_number";
import { TMortgageLoan } from "../../../redux/slices/mortgage_loan_slices";
import { RootState } from "../../../redux/store";

type TTable = {
  result?: FixedPrincipalResult;
  mortgage?: TMortgageLoan;
  onScrollEnd?: () => void;
};
const Table = ({ result, mortgage, onScrollEnd }: TTable) => {
  const { t } = useTranslation();
  const { currency } = useSelector((state: RootState) => state.app);
  const locale = mortgage?.currency?.locale || currency.locale;
  const code = mortgage?.currency?.code || currency.code;
  const format = useCallback(
    (value: number) => formatNumber(value, locale, true, code),
    [locale, code],
  );

  const renderItem = ({ item }: ListRenderItemInfo<MonthlyBreakdown>) => {
    const total = item.principalPayment + item.interestPayment;
    const principalShare = total > 0 ? (item.principalPayment / total) * 100 : 0;
    const isYearStart = (item.month - 1) % 12 === 0;

    return (
      <View style={styles.itemWrap}>
        {isYearStart && (
          <AppText
            value={`${t("mortgageDetail.year")} ${Math.floor((item.month - 1) / 12) + 1}`}
            fontSize={13}
            fontWeight={700}
            color={COLORS.foundation.gold.g500}
            textStyle={styles.yearLabel}
          />
        )}
        <View style={styles.card}>
          <View style={styles.monthBadge}>
            <AppText
              value={item.month.toString()}
              fontSize={15}
              fontWeight={700}
              color={COLORS.foundation.blue.b400}
            />
          </View>
          <View style={styles.body}>
            <View style={styles.topRow}>
              <View style={styles.flex}>
                <AppText
                  value={t("mortgageDetail.table.monthlyPayment")}
                  fontSize={11}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                />
                <AppText
                  value={format(item.totalPayment)}
                  fontSize={16}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                />
              </View>
              <View style={[styles.flex, styles.alignEnd]}>
                <AppText
                  value={t("mortgageDetail.table.endingBalance")}
                  fontSize={11}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                  numberOfLines={1}
                />
                <AppText
                  value={format(item.remainingPrincipal)}
                  fontSize={13}
                  fontWeight={600}
                  color={COLORS.foundation.neutral.n700}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                />
              </View>
            </View>
            <View style={styles.bar}>
              <View style={[styles.principalFill, { flex: principalShare }]} />
              <View style={[styles.interestFill, { flex: 100 - principalShare }]} />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legend}>
                <View style={[styles.dot, styles.principalFill]} />
                <AppText
                  value={`${t("mortgageDetail.table.principal")} ${format(item.principalPayment)}`}
                  fontSize={11}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  textStyle={styles.flexShrink}
                />
              </View>
              <View style={styles.legend}>
                <View style={[styles.dot, styles.interestFill]} />
                <AppText
                  value={`${t("mortgageDetail.table.interest")} ${format(item.interestPayment)}`}
                  fontSize={11}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  textStyle={styles.flexShrink}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      data={result?.monthlyBreakdown}
      renderItem={renderItem}
      keyExtractor={(item) => item.month.toString()}
      onScrollEndDrag={onScrollEnd}
      initialNumToRender={12}
      windowSize={7}
    />
  );
};

export default Table;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  itemWrap: {
    marginBottom: 10,
  },
  yearLabel: {
    marginTop: 6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.foundation.neutral.n0,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  monthBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.foundation.blue.b50,
  },
  body: {
    flex: 1,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    gap: 10,
  },
  bar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    gap: 2,
  },
  principalFill: {
    backgroundColor: COLORS.foundation.blue.b300,
  },
  interestFill: {
    backgroundColor: COLORS.foundation.gold.g300,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
  },
  legend: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
