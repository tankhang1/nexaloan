import {ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import AppView from '../../components/AppView';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import {ICONS} from '../../constants/icon';
import AppIconButton from '../../components/AppIconButton';
import Card from './components/Card';
import {navigationRef} from '../../navigation';
import {useTranslation} from 'react-i18next';

const MainScreen = () => {
  const {t} = useTranslation();
  const onNavSettingScreen = () => {
    navigationRef.navigate('SettingScreen');
  };
  const onNavHistoryScreen = () => {
    navigationRef.navigate('HistoryScreen');
  };
  const onNavMortgageLoanScreen = (
    type: 'mortgage' | 'car' | 'personal' | 'business',
  ) => {
    navigationRef.navigate('MortgageLoanScreen', {
      label: t(`main.${type}.title`),
    });
  };

  // const onNotiFeatureReleaseSoon = () => {
  //   Toast.show({
  //     text1: t('noti.title'),
  //     text2: t('noti.desc'),
  //     position: 'top',
  //     type: 'info',
  //   });
  // };

  return (
    <AppView appStyle={styles.overall}>
      <View style={[styles.header, styles.rows]}>
        <View style={styles.headerLeftSection}>
          <AppText
            value={t('main.greeting')}
            fontSize={14}
            fontWeight={500}
            color={COLORS.foundation.neutral.n500}
          />
          <AppText
            value={t('main.title')}
            fontSize={32}
            fontWeight={700}
            color={COLORS.foundation.neutral.n900}
          />
        </View>
        <View style={styles.headerRightSection}>
          <AppIconButton onPress={onNavSettingScreen}>
            <ICONS.button.setting />
          </AppIconButton>
          <AppIconButton onPress={onNavHistoryScreen}>
            <ICONS.button.history />
          </AppIconButton>
        </View>
      </View>
      <View>
        <ScrollView contentContainerStyle={styles.cardContainer}>
          <Card
            image={require('../../assets/mortgage-loan.png')}
            title={t('main.mortgage.title')}
            desc={t('main.mortgage.desc')}
            icon={<ICONS.button.home />}
            onPress={() => onNavMortgageLoanScreen('mortgage')}
          />
          <Card
            image={require('../../assets/car-loan.png')}
            title={t('main.car.title')}
            desc={t('main.car.desc')}
            icon={<ICONS.button.car />}
            onPress={() => onNavMortgageLoanScreen('car')}
          />
          <Card
            image={require('../../assets/personal-loan.png')}
            title={t('main.personal.title')}
            desc={t('main.personal.desc')}
            icon={<ICONS.button.user />}
            onPress={() => onNavMortgageLoanScreen('personal')}
          />
          <Card
            image={require('../../assets/business-loan.png')}
            title={t('main.business.title')}
            desc={t('main.business.desc')}
            icon={<ICONS.button.money />}
            onPress={() => onNavMortgageLoanScreen('business')}
          />
          <View style={styles.spacing} />
        </ScrollView>
      </View>
    </AppView>
  );
};

export default MainScreen;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    backgroundColor: COLORS.foundation.neutral.n25,
    paddingHorizontal: 16,
    gap: 16,
    width: '100%',
  },
  header: {
    gap: 14,
    paddingVertical: 4,
  },
  headerLeftSection: {
    gap: 4,
    maxWidth: '80%',
  },
  headerRightSection: {
    gap: 14,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContainer: {
    gap: 14,
  },
  spacing: {height: 100},
});
