import {View, StyleSheet, Pressable} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AppView from '../../components/AppView';
import AppText from '../../components/AppText';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import {COLORS} from '../../constants/colors';
import {Shadow} from 'react-native-shadow-2';
import {WIDTH} from '../../constants/dimension';
import Table from './components/Table';
import {navigationRef} from '../../navigation';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {calculateFixedMonthlyPayment} from '../../hooks/fixed_monthly_payment';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TNavigation} from '../../utils/types/navigation';
import {useTranslation} from 'react-i18next';
import {exportLoanCsvToDownloadsRNFA} from '../../hooks/export_excel';
import {formatMonth} from '../../hooks/format_month';
import {formatNumber} from '../../hooks/format_number';
import dayjs from 'dayjs';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import AppIndicator from '../../components/AppIndicator';
import {calculateFixedPrincipal} from '../../hooks/fixed_principal';
import AppBanner from '../../components/AppBanner';
import {useInterstitialAd} from 'react-native-google-mobile-ads';
import {ADS} from '../../constants/ads';

type Props = NativeStackScreenProps<
  TNavigation,
  'MortgageLoanResultDetailScreen'
>;
const MortgageLoanResultDetailScreen = ({route}: Props) => {
  const {t} = useTranslation();
  const {isLoaded, load, show, isClosed} = useInterstitialAd(ADS.interstitial);
  const [shouldDownloadAfterAd, setShouldDownloadAfterAd] = useState(false);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const [tab, setTab] = useState(0);
  const {currency} = useSelector((state: RootState) => state.app);
  const history = useSelector((state: RootState) => state.history);

  const historyMorgage = useMemo(() => {
    if (route.params?.id) {
      return history.find(item => item.id === route.params?.id);
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
        : calculateFixedMonthlyPayment(mortgage!),
    [mortgage],
  );
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onDownload = useCallback(() => {
    exportLoanCsvToDownloadsRNFA(
      result?.monthlyBreakdown || [],
      `Report-${dayjs(new Date()).format('DD-MM-YYYY')}`,
      {
        locale: mortgage?.currency?.locale || currency.locale,
        code: mortgage?.currency?.code || currency.code,
      },
    );
  }, [result, mortgage, currency]);
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
            value={t('mortgageDetail.amortization')}
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
          }}>
          <ICONS.download />
        </AppIconButton>
      </View>
      <AppIndicator
        tabs={[
          {
            id: 0,
            children: t('mortgageDetail.summary'),
            isLeftBorder: true,
            tabWidth: (WIDTH - 36) * 0.5,
          },

          {
            id: 1,
            children: t('mortgageDetail.analysisByMonth'),
            isRightBorder: true,
            tabWidth: (WIDTH - 36) * 0.5,
          },
        ]}
        activeKey={tab}
        onPress={setTab}
        isEqual={false}
      />
      {tab === 0 && (
        <Shadow
          distance={1} // equivalent to elevation
          startColor="rgba(0, 0, 0, 1)" // your rgba color
          offset={[4, 4]} // X, Y offset
        >
          <View style={styles.statistic}>
            <Shadow
              distance={1} // equivalent to elevation
              startColor="rgba(0, 0, 0, 1)" // your rgba color
              offset={[4, 4]} // X, Y offset
            >
              <View style={styles.title}>
                <AppText
                  value={route.params?.label}
                  fontSize={24}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                />
              </View>
            </Shadow>
            <View style={[styles.rows, styles.justifyBetween]}>
              <AppText
                value={t('mortgageDetail.loanAmount')}
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
                value={t('mortgageDetail.duration')}
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
                value={t('mortgageDetail.interestRate')}
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
                <Shadow
                  distance={1} // equivalent to elevation
                  startColor="rgba(0, 0, 0, 1)" // your rgba color
                  offset={[4, 4]} // X, Y offset
                >
                  <Pressable style={styles.halfWidthButton}>
                    <AppText
                      fontSize={12}
                      fontWeight={500}
                      value={t('mortgageDetail.monthlyPayment') + ' (Avg)'}
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
                      value={t('mortgageDetail.totalInterestPaid')}
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
                    value={t('mortgageDetail.totalPayments')}
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
              </Shadow>
            </View>
          </View>
        </Shadow>
      )}
      {tab === 1 && (
        <Shadow
          distance={1} // equivalent to elevation
          startColor="rgba(0, 0, 0, 1)" // your rgba color
          offset={[4, 4]} // X, Y offset
          style={styles.borderRadius}>
          <Table
            result={result}
            mortgage={mortgage}
            onScrollEnd={() => {
              scrollRef.current?.scrollToEnd();
            }}
          />
        </Shadow>
      )}
      <View style={{flex: 1}} />
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.promotion}>
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
    width: '100%',
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  home: {
    width: 33,
    height: 33,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.foundation.neutral.n900,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  statistic: {
    width: WIDTH - 36,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    backgroundColor: COLORS.foundation.blue.b200,
    borderWidth: 1,
    borderColor: 'black',
  },
  title: {
    width: WIDTH - 72,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfWidthButton: {
    width: (WIDTH - 36 - 44) / 2,
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
    width: WIDTH - 32 - 40,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    gap: 4,
    height: 63,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  gap8: {
    gap: 8,
  },
  gap14: {
    gap: 14,
  },
  promotion: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    height: 40,
    backgroundColor: COLORS.foundation.blue.b300,
  },
  text: {margin: 6, color: COLORS.foundation.neutral.n0},
  borderRadius: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  center: {
    textAlign: 'center',
  },
  titleCenter: {
    width: '55%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '90deg'}],
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: COLORS.foundation.neutral.n0,
  },
  floatingDown: {
    transform: [{rotate: '-90deg'}],
  },
});
