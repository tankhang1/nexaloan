import {StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import Card from './components/Card';
import {navigationRef} from '../../navigation';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {CURRENCIES} from '../../constants/currency';
import {useTranslation} from 'react-i18next';
import {LANGUAGES} from '../../constants/language';
import AppBanner from '../../components/AppBanner';
import {BannerAdSize} from 'react-native-google-mobile-ads';

const SettingScreen = () => {
  const {t} = useTranslation();
  const {currency, language} = useSelector((state: RootState) => state.app);
  const curCurrency = useMemo(
    () => CURRENCIES.find(item => item.label === currency.code),
    [currency],
  );
  const curLanguage = useMemo(
    () => LANGUAGES.find(item => item.code === language),
    [language],
  );
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onNavLanguageScreen = () => {
    navigationRef.navigate('LanguageScreen');
  };
  const onNavAboutUsScreen = () => {
    navigationRef.navigate('AboutUsScreen');
  };
  const onNavCurrencyScreen = () => {
    navigationRef.navigate('CurrencyScreen');
  };
  const onNavTOUScreen = () => {
    navigationRef.navigate('TOUScreen');
  };
  const onNavPrivacyPolicyScreen = () => {
    navigationRef.navigate('PrivacyPolicyScreen');
  };
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('settings.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
      </View>
      <View style={styles.container}>
        <Card
          label={t('settings.selectLanguage')}
          rightSection={{
            label: curLanguage?.label || '',
            icon: curLanguage?.icon,
          }}
          onPress={onNavLanguageScreen}
          isBorder
        />
        <Card
          label={t('settings.currency')}
          rightSection={{
            label: curCurrency?.label || '',
            icon: curCurrency?.icon,
          }}
          isBorder
          onPress={onNavCurrencyScreen}
        />
        <Card
          label={t('settings.aboutUs')}
          isBorder
          onPress={onNavAboutUsScreen}
        />
        <Card label={t('settings.terms')} isBorder onPress={onNavTOUScreen} />
        <Card
          label={t('settings.privacy')}
          onPress={onNavPrivacyPolicyScreen}
        />
      </View>
      <View style={styles.banner}>
        <AppBanner size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    </AppView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  container: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  banner: {alignItems: 'center', position: 'absolute', bottom: 40},
});
