import {View, StyleSheet, ScrollView} from 'react-native';
import React, {useMemo, useState} from 'react';
import {COLORS} from '../../constants/colors';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {navigationRef} from '../../navigation';
import AppText from '../../components/AppText';
import {WIDTH} from '../../constants/dimension';
import Card from './components/Card';
import AppIndicator from '../../components/AppIndicator';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import dayjs from 'dayjs';
import {ELoan, TLoan} from '../../redux/slices/history';
import {useTranslation} from 'react-i18next';
import {formatNumber} from '../../hooks/format_number';
import {formatMonth} from '../../hooks/format_month';
import AppBanner from '../../components/AppBanner';
import {BannerAdSize} from 'react-native-google-mobile-ads';
import {
  Feather,
  Ionicons,
  FontAwesome6,
} from '@expo/vector-icons';

const HistoryScreen = () => {
  const {t} = useTranslation();
  const [type, setType] = useState(0);
  const [timeType, setTimeType] = useState(0);

  const history = useSelector((state: RootState) => state.history);
  const listHistory = useMemo(() => {
    if (type === 0) {
      return timeType === 1 ? history : [...history].reverse();
    }
    if (type === 1) {
      const mortgages = [...history].filter(
        item => item.type === ELoan.MORTGAGE_LOAN,
      );
      return timeType === 1 ? mortgages : mortgages.reverse();
    }
    if (type === 2) {
      const personal = [...history].filter(
        item => item.type === ELoan.PERSONAL_LOAN,
      );
      return timeType === 1 ? personal : personal.reverse();
    }
    if (type === 3) {
      const business = [...history].filter(
        item => item.type === ELoan.BUSINESS_LOAN,
      );
      return timeType === 1 ? business : business.reverse();
    }
    if (type === 4) {
      const car = [...history].filter(item => item.type === ELoan.CAR_LOAN);
      return timeType === 1 ? car : car.reverse();
    }
    return [];
  }, [timeType, history, type]);
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onNavSettingScreen = () => {
    navigationRef.navigate('SettingScreen');
  };
  const onNavMortgageDetailScreen = (mortgage: TLoan) => {
    navigationRef.navigate('MortgageLoanResultDetailScreen', {
      id: mortgage.id,
      isHistory: true,
      label: mortgage.label,
    });
  };
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <Feather
            name="chevron-left"
            size={24}
            color={COLORS.foundation.neutral.n900}
          />
        </AppIconButton>
        <AppText
          value={t('history.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
        <AppIconButton onPress={onNavSettingScreen}>
          <Feather
            name="settings"
            size={24}
            color={COLORS.foundation.neutral.n900}
          />
        </AppIconButton>
      </View>
      <View style={styles.rows}>
        <AppIndicator
          tabs={[
            {
              id: 0,
              children: t('history.tabs.all'),
              isLeftBorder: true,
            },
            {
              id: 1,
              children: (
                <Ionicons
                  name="home"
                  size={18}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
            },
            {
              id: 2,
              children: (
                <Ionicons
                  name="person"
                  size={18}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
            },
            {
              id: 3,
              children: (
                <FontAwesome6
                  name="briefcase"
                  size={15}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
            },
            {
              id: 4,
              children: (
                <Ionicons
                  name="car-sport"
                  size={18}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
              isRightBorder: true,
            },
          ]}
          activeKey={type}
          onPress={setType}
          tabWidth={(WIDTH - 34) / 8}
        />
        <AppIndicator
          tabs={[
            {
              id: 0,
              children: t('history.tabs.newest'),
              isLeftBorder: true,
            },
            {
              id: 1,
              children: t('history.tabs.oldest'),
              isRightBorder: true,
            },
          ]}
          activeKey={timeType}
          onPress={setTimeType}
          tabWidth={(WIDTH - 34) / 6}
        />
      </View>

      <ScrollView contentContainerStyle={[styles.center, styles.gap16]}>
        {listHistory?.map((mortgage, index) => (
          <Card
            id={mortgage.id}
            onPress={() => onNavMortgageDetailScreen(mortgage)}
            index={index}
            key={Math.random()}
            icon={
              mortgage.type === ELoan.MORTGAGE_LOAN ? (
                <Ionicons
                  name="home"
                  size={22}
                  color={COLORS.foundation.neutral.n0}
                />
              ) : mortgage.type === ELoan.PERSONAL_LOAN ? (
                <Ionicons
                  name="person"
                  size={22}
                  color={COLORS.foundation.neutral.n0}
                />
              ) : mortgage.type === ELoan.BUSINESS_LOAN ? (
                <FontAwesome6
                  name="briefcase"
                  size={18}
                  color={COLORS.foundation.neutral.n0}
                />
              ) : (
                <Ionicons
                  name="car-sport"
                  size={22}
                  color={COLORS.foundation.neutral.n0}
                />
              )
            }
            title={
              mortgage.type === ELoan.BUSINESS_LOAN
                ? t('main.business.title')
                : mortgage.type === ELoan.CAR_LOAN
                ? t('main.car.title')
                : mortgage.type === ELoan.MORTGAGE_LOAN
                ? t('main.mortgage.title')
                : t('main.personal.title')
            }
            value={formatNumber(
              mortgage.loan_amount,
              mortgage.currency.locale,
              true,
              mortgage.currency.code,
            )}
            year={formatMonth(mortgage.duration || 0, t)}
            time={`${dayjs(mortgage.date).format('DD/MM/YYYY')}`}
          />
        ))}
        <View style={{height: 100}} />
      </ScrollView>

      <AppBanner size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </AppView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    gap: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  rows: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  gap16: {
    gap: 16,
  },
  center: {
    alignItems: 'center',
  },
});
