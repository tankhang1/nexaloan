import {ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import AppView from '../../components/AppView';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import AppIconButton from '../../components/AppIconButton';
import Card from './components/Card';
import {navigationRef} from '../../navigation';
import {useTranslation} from 'react-i18next';
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome6,
} from '@expo/vector-icons';

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
            fontSize={34}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
        </View>
        <View style={styles.headerRightSection}>
          <AppIconButton onPress={onNavSettingScreen}>
            <Feather
              name="settings"
              size={24}
              color={COLORS.foundation.neutral.n900}
            />
          </AppIconButton>
          <AppIconButton onPress={onNavHistoryScreen}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={COLORS.foundation.neutral.n900}
            />
          </AppIconButton>
        </View>
      </View>
      <View style={styles.heroCard}>
        <AppText
          value={t('main.heroTitle')}
          fontSize={17}
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <AppText
          value={t('main.heroDesc')}
          fontSize={14}
          fontWeight={400}
          color={COLORS.foundation.neutral.n500}
        />
      </View>
      <View style={styles.listSection}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.cardContainer}
          showsVerticalScrollIndicator={false}>
          <Card
            title={t('main.mortgage.title')}
            desc={t('main.mortgage.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#0F8A6A"
            iconBackgroundColor="#0F8A6A"
            icon={
              <Ionicons
                name="home"
                size={24}
                color={COLORS.foundation.neutral.n0}
              />
            }
            onPress={() => onNavMortgageLoanScreen('mortgage')}
          />
          <Card
            title={t('main.car.title')}
            desc={t('main.car.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#5D7CF4"
            iconBackgroundColor="#5D7CF4"
            icon={
              <Ionicons
                name="car-sport"
                size={24}
                color={COLORS.foundation.neutral.n0}
              />
            }
            onPress={() => onNavMortgageLoanScreen('car')}
          />
          <Card
            title={t('main.personal.title')}
            desc={t('main.personal.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#E07A5F"
            iconBackgroundColor="#E07A5F"
            icon={
              <Ionicons
                name="person"
                size={24}
                color={COLORS.foundation.neutral.n0}
              />
            }
            onPress={() => onNavMortgageLoanScreen('personal')}
          />
          <Card
            title={t('main.business.title')}
            desc={t('main.business.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#B45CE0"
            iconBackgroundColor="#B45CE0"
            icon={
              <FontAwesome6
                name="briefcase"
                size={20}
                color={COLORS.foundation.neutral.n0}
              />
            }
            onPress={() => onNavMortgageLoanScreen('business')}
          />
        </ScrollView>
      </View>
    </AppView>
  );
};

export default MainScreen;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 18,
    width: '100%',
  },
  header: {
    gap: 14,
    paddingVertical: 4,
  },
  headerLeftSection: {
    gap: 4,
    maxWidth: '68%',
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
    gap: 16,
    paddingBottom: 140,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: COLORS.foundation.neutral.n100,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 8,
  },
  listSection: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
