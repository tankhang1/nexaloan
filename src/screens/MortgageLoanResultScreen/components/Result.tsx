import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import React, {useMemo} from 'react';
import {COLORS} from '../../../constants/colors';
import {WIDTH} from '../../../constants/dimension';
import AppText from '../../../components/AppText';
import {TMortgageLoan} from '../../../redux/slices/mortgage_loan_slices';
import {calculateFixedMonthlyPayment} from '../../../hooks/fixed_monthly_payment';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {useTranslation} from 'react-i18next';
import {formatMonth} from '../../../hooks/format_month';
import {formatNumber} from '../../../hooks/format_number';
import Animated, {LinearTransition} from 'react-native-reanimated';
import {calculateFixedPrincipal} from '../../../hooks/fixed_principal';
import AppBanner from '../../../components/AppBanner';
import {Feather} from '@expo/vector-icons';

type TResult = {
  mortgage?: TMortgageLoan;
  label: string;
};
const Result = ({mortgage, label}: TResult) => {
  const {t} = useTranslation();
  const {currency} = useSelector((state: RootState) => state.app);
  const result = useMemo(
    () =>
      mortgage?.type === 1
        ? calculateFixedPrincipal(mortgage!)
        : calculateFixedMonthlyPayment(mortgage!),
    [mortgage],
  );
  return (
    <Animated.View layout={LinearTransition} style={styles.overall}>
      <View style={styles.panel}>
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Feather
                  name="trending-up"
                  size={16}
                  color={COLORS.foundation.blue.b500}
                />
                <AppText
                  fontSize={12}
                  fontWeight={600}
                  color={COLORS.foundation.blue.b500}
                  value={t('mortgageResult.summaryBadge')}
                />
              </View>
            </View>
            <AppText
              fontSize={28}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
              value={label}
            />
            <AppText
              fontSize={13}
              fontWeight={400}
              color={COLORS.foundation.neutral.n500}
              value={t('mortgageResult.summaryDesc')}
            />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.dataCard}>
              <View style={styles.infoRow}>
                <AppText
                  fontSize={13}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                  value={t('mortgageResult.result.loanAmount')}
                />
                <AppText
                  fontSize={16}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  value={formatNumber(
                    mortgage?.loan_amount || 0,
                    currency.locale,
                    true,
                    currency.code,
                  )}
                />
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <AppText
                  fontSize={13}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                  value={t('mortgageResult.result.duration')}
                />
                <AppText
                  fontSize={16}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  value={formatMonth(mortgage?.duration || 0, t)}
                />
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <AppText
                  fontSize={13}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n500}
                  value={t('mortgageResult.result.interestRate')}
                />
                <AppText
                  fontSize={16}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  value={`${mortgage?.int_rate || 0}%`}
                />
              </View>
            </View>
            <View style={styles.promotionCard}>
              <AppBanner />
            </View>
          </View>
          <View style={styles.footerContainer}>
            <View style={[styles.rows, styles.gap12]}>
              <Pressable style={styles.halfWidthButton}>
                <View style={styles.metricContent}>
                  <View style={[styles.metricPill, styles.greenPill]}>
                    <Feather
                      name="calendar"
                      size={14}
                      color={COLORS.foundation.blue.b500}
                    />
                    <AppText
                      fontSize={11}
                      fontWeight={600}
                      value="AVG"
                      color={COLORS.foundation.blue.b500}
                    />
                  </View>
                  <AppText
                    fontSize={12}
                    fontWeight={500}
                    value={t('mortgageResult.result.monthlyPayment') + ' (Avg)'}
                    color={COLORS.foundation.neutral.n500}
                  />
                  <AppText
                    allowFontScaling={true}
                    fontSize={20}
                    fontWeight={700}
                    value={formatNumber(
                      result.averageMonthlyPayment,
                      currency.locale,
                      true,
                      currency.code,
                    )}
                    color={COLORS.foundation.blue.b500}
                  />
                </View>
              </Pressable>
              <Pressable style={styles.halfWidthButton}>
                <View style={styles.metricContent}>
                  <View style={[styles.metricPill, styles.orangePill]}>
                    <Feather name="percent" size={14} color="#B66A2A" />
                    <AppText
                      fontSize={11}
                      fontWeight={600}
                      value="COST"
                      color="#B66A2A"
                    />
                  </View>
                  <AppText
                    fontSize={12}
                    fontWeight={500}
                    value={t('mortgageResult.result.totalInterestPaid')}
                    color={COLORS.foundation.neutral.n500}
                  />
                  <AppText
                    fontSize={20}
                    fontWeight={700}
                    value={formatNumber(
                      result.totalInterest,
                      currency.locale,
                      true,
                      currency.code,
                    )}
                    color="#B66A2A"
                  />
                </View>
              </Pressable>
            </View>
            <Pressable style={styles.fullWidthButton}>
              <View style={styles.metricContent}>
                <View style={[styles.metricPill, styles.purplePill]}>
                  <Feather name="layers" size={14} color="#6E4DD8" />
                  <AppText
                    fontSize={11}
                    fontWeight={600}
                    value="TOTAL"
                    color="#6E4DD8"
                  />
                </View>
                <AppText
                  fontSize={12}
                  fontWeight={500}
                  value={t('mortgageResult.result.totalPayments')}
                  color={COLORS.foundation.neutral.n500}
                />
                <AppText
                  fontSize={24}
                  fontWeight={700}
                  value={formatNumber(
                    result.totalPayment,
                    currency.locale,
                    true,
                    currency.code,
                  )}
                  color="#6E4DD8"
                />
              </View>
            </Pressable>
          </View>
        </View>
    </Animated.View>
  );
};

export default Result;

const styles = StyleSheet.create({
  overall: {
    width: WIDTH - 32,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    overflow: 'hidden',
    padding: 18,
    gap: 18,
  },
  hero: {
    backgroundColor: '#F3EFE5',
    borderRadius: 24,
    padding: 18,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    right: -40,
    top: -40,
    borderRadius: 999,
    backgroundColor: 'rgba(205, 235, 226, 0.75)',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
  contentContainer: {
    gap: 14,
  },
  dataCard: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.foundation.neutral.n50,
  },
  promotionCard: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  footerContainer: {
    gap: 12,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfWidthButton: {
    width: (WIDTH - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    minHeight: 118,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    overflow: 'hidden',
  },
  fullWidthButton: {
    width: WIDTH - 68,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    minHeight: 128,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    overflow: 'hidden',
  },
  metricContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
    justifyContent: 'center',
    flex: 1,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 2,
  },
  greenPill: {
    backgroundColor: COLORS.foundation.blue.b50,
  },
  orangePill: {
    backgroundColor: '#FCE9D6',
  },
  purplePill: {
    backgroundColor: '#EFE8FF',
  },
  gap12: {
    gap: 12,
  },
});
