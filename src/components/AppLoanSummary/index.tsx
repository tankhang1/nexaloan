import {View, StyleSheet, Image, ImageBackground} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {COLORS} from '../../constants/colors';
import AppText from '../AppText';
import {formatMonth} from '../../hooks/format_month';
import {formatNumber} from '../../hooks/format_number';
import {FINANCE_IMAGES} from '../../assets';

type TAppLoanSummary = {
  label: string;
  loanAmount: number;
  duration: number;
  interestRate: number;
  averageMonthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  locale: string;
  currencyCode: string;
  // Rendered between the hero and the breakdown card (e.g. an ad banner).
  children?: React.ReactNode;
};
const AppLoanSummary = ({
  label,
  loanAmount,
  duration,
  interestRate,
  averageMonthlyPayment,
  totalInterest,
  totalPayment,
  locale,
  currencyCode,
  children,
}: TAppLoanSummary) => {
  const {t} = useTranslation();
  const format = (value: number) =>
    formatNumber(value, locale, true, currencyCode);

  const principal = loanAmount;
  const principalShare =
    totalPayment > 0 ? Math.min((principal / totalPayment) * 100, 100) : 100;

  return (
    <View style={styles.overall}>
      {/* Hero: the answer first */}
      <ImageBackground
        source={FINANCE_IMAGES.cityBackground}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}>
        <View pointerEvents="none" style={styles.heroOverlay} />
        <Image
          source={FINANCE_IMAGES.growthOrb}
          resizeMode="contain"
          style={styles.heroOrb}
        />
        <AppText
          fontSize={13}
          fontWeight={600}
          color={COLORS.foundation.gold.g300}
          value={label}
          numberOfLines={1}
          textStyle={styles.heroText}
        />
        <AppText
          fontSize={13}
          fontWeight={500}
          color="rgba(255,255,255,0.75)"
          value={t('mortgageResult.result.averageMonthlyPayment')}
          numberOfLines={2}
          textStyle={styles.heroText}
        />
        <AppText
          fontSize={30}
          fontWeight={700}
          color={COLORS.foundation.neutral.n0}
          value={format(averageMonthlyPayment)}
          numberOfLines={1}
          adjustsFontSizeToFit
        />
        <View style={styles.chipRow}>
          {[
            format(principal),
            formatMonth(duration, t),
            `${interestRate}%`,
          ].map(chip => (
            <View key={chip} style={styles.chip}>
              <AppText
                fontSize={12}
                fontWeight={600}
                color={COLORS.foundation.neutral.n0}
                value={chip}
                numberOfLines={1}
              />
            </View>
          ))}
        </View>
      </ImageBackground>

      {children}

      {/* Breakdown: principal vs interest */}
      <View style={styles.card}>
        <View style={styles.row}>
          <AppText
            fontSize={13}
            fontWeight={500}
            color={COLORS.foundation.neutral.n500}
            value={t('mortgageResult.result.totalPayments')}
            textStyle={styles.flex}
          />
          <AppText
            fontSize={20}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
            value={format(totalPayment)}
            numberOfLines={1}
            adjustsFontSizeToFit
          />
        </View>
        <View style={styles.bar}>
          <View style={[styles.barPrincipal, {flex: principalShare}]} />
          <View style={[styles.barInterest, {flex: 100 - principalShare}]} />
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendLabel}>
              <View style={[styles.dot, styles.barPrincipal]} />
              <AppText
                fontSize={12}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                value={`${t('mortgageDetail.table.principal')} · ${principalShare.toFixed(0)}%`}
              />
            </View>
            <AppText
              fontSize={15}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
              value={format(principal)}
              numberOfLines={1}
              adjustsFontSizeToFit
            />
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendLabel}>
              <View style={[styles.dot, styles.barInterest]} />
              <AppText
                fontSize={12}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                value={`${t('mortgageDetail.table.interest')} · ${(100 - principalShare).toFixed(0)}%`}
              />
            </View>
            <AppText
              fontSize={15}
              fontWeight={700}
              color={COLORS.foundation.gold.g500}
              value={format(totalInterest)}
              numberOfLines={1}
              adjustsFontSizeToFit
            />
          </View>
        </View>
      </View>

    </View>
  );
};

export default AppLoanSummary;

const styles = StyleSheet.create({
  overall: {
    gap: 14,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.foundation.blue.b500,
  },
  heroImage: {
    borderRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 30, 60, 0.4)',
  },
  heroOrb: {
    position: 'absolute',
    width: 96,
    height: 120,
    top: -4,
    right: 6,
  },
  heroText: {
    paddingRight: 90,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(226,194,117,0.35)',
  },
  card: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    gap: 3,
  },
  barPrincipal: {
    backgroundColor: COLORS.foundation.blue.b300,
  },
  barInterest: {
    backgroundColor: COLORS.foundation.gold.g300,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flex: 1,
    gap: 4,
  },
  legendLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
