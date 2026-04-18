import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
} from 'react-native';
import React, {useMemo} from 'react';
import {COLORS} from '../../../constants/colors';
import {Shadow} from 'react-native-shadow-2';
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
    <ImageBackground
      source={require('../../../assets/layout.png')}
      resizeMode="stretch">
      <Animated.View layout={LinearTransition} style={styles.overall}>
        <Image source={require('../../../assets/cup.png')} style={styles.cup} />
        <View style={styles.bodyContainer}>
          <Shadow
            distance={1} // equivalent to elevation
            startColor="rgba(0, 0, 0, 1)" // your rgba color
            offset={[4, 4]} // X, Y offset
          >
            <View style={styles.title}>
              <AppText
                fontSize={24}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                value={label}
              />
            </View>
          </Shadow>
          <View style={styles.contentContainer}>
            <View style={styles.rows}>
              <AppText
                fontSize={14}
                fontWeight={500}
                color={COLORS.foundation.neutral.n50}
                value={t('mortgageResult.result.loanAmount')}
              />
              <AppText
                fontSize={15}
                fontWeight={600}
                color={COLORS.foundation.neutral.n0}
                value={formatNumber(
                  mortgage?.loan_amount || 0,
                  currency.locale,
                  true,
                  currency.code,
                )}
              />
            </View>
            <View style={styles.rows}>
              <AppText
                fontSize={14}
                fontWeight={500}
                color={COLORS.foundation.neutral.n50}
                value={t('mortgageResult.result.duration')}
              />
              <AppText
                fontSize={15}
                fontWeight={600}
                color={COLORS.foundation.neutral.n0}
                value={formatMonth(mortgage?.duration || 0, t)}
              />
            </View>
            <View style={styles.rows}>
              <AppText
                fontSize={14}
                fontWeight={500}
                color={COLORS.foundation.neutral.n50}
                value={t('mortgageResult.result.interestRate')}
              />
              <AppText
                fontSize={15}
                fontWeight={600}
                color={COLORS.foundation.neutral.n0}
                value={`${mortgage?.int_rate || 0}%`}
              />
            </View>
            <View style={styles.promotion}>
              <AppBanner />
            </View>
          </View>
        </View>
        <View style={styles.footerContainer}>
          <View style={styles.dividerContainer}>
            {/* <AppText
              value={t('mortgageResult.result.result')}
              fontSize={14}
              fontWeight={500}
              color={COLORS.foundation.neutral.n25}
            /> */}
          </View>

          <View style={styles.gap14}>
            <View style={[styles.rows, styles.gap8]}>
              <Shadow
                distance={1} // equivalent to elevation
                startColor="rgba(0, 0, 0, 1)" // your rgba color
                offset={[4, 4]} // X, Y offset
              >
                <Pressable style={styles.halfWidthButton}>
                  <AppText
                    fontSize={12}
                    fontWeight={500}
                    value={t('mortgageResult.result.monthlyPayment') + ' (Avg)'}
                    textStyle={styles.center}
                    color={COLORS.foundation.neutral.n500}
                  />
                  <AppText
                    allowFontScaling={true}
                    fontSize={15}
                    fontWeight={700}
                    value={formatNumber(
                      result.averageMonthlyPayment,
                      currency.locale,
                      true,
                      currency.code,
                    )}
                    color={COLORS.foundation.blue.b500}
                  />
                </Pressable>
              </Shadow>
              <Shadow
                distance={1} // equivalent to elevation
                startColor="rgba(0, 0, 0, 1)" // your rgba color
                offset={[4, 4]} // X, Y offset
              >
                <Pressable style={styles.halfWidthButton}>
                  <AppText
                    fontSize={12}
                    fontWeight={500}
                    value={t('mortgageResult.result.totalInterestPaid')}
                    color={COLORS.foundation.neutral.n500}
                  />
                  <AppText
                    fontSize={15}
                    fontWeight={700}
                    value={formatNumber(
                      result.totalInterest,
                      currency.locale,
                      true,
                      currency.code,
                    )}
                    color={COLORS.foundation.blue.b500}
                  />
                </Pressable>
              </Shadow>
            </View>
            <Shadow
              distance={1} // equivalent to elevation
              startColor="rgba(0, 0, 0, 1)" // your rgba color
              offset={[4, 4]} // X, Y offset
            >
              <Pressable style={styles.fullWidthButton}>
                <AppText
                  fontSize={12}
                  fontWeight={500}
                  value={t('mortgageResult.result.totalPayments')}
                  color={COLORS.foundation.neutral.n500}
                />
                <AppText
                  fontSize={15}
                  fontWeight={700}
                  value={formatNumber(
                    result.totalPayment,
                    currency.locale,
                    true,
                    currency.code,
                  )}
                  color={COLORS.foundation.blue.b500}
                />
              </Pressable>
            </Shadow>
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
};

export default Result;

const styles = StyleSheet.create({
  overall: {
    width: WIDTH - 32,
    padding: 16,
    paddingTop: 64,
    gap: 20,
  },
  cup: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    position: 'absolute',
    top: -50,
  },
  title: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: WIDTH - 64,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n700,
  },
  bodyContainer: {
    gap: 24,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {gap: 14},
  promotion: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  divider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#000000',
    borderRadius: 40,
  },
  footerContainer: {
    gap: 20,
    marginTop: 30,
    marginBottom: 5,
  },
  halfWidthButton: {
    width: (WIDTH - 76) / 2,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    gap: 4,
    height: 63,
    borderWidth: 1,

    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fullWidthButton: {
    width: WIDTH - 64,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    gap: 4,
    height: 63,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
  },
  gap8: {
    gap: 8,
  },
  gap14: {
    gap: 14,
  },
  center: {
    textAlign: 'center',
  },
});
