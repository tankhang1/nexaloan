import {StyleSheet, View, ScrollView, Image} from 'react-native';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {useTranslation} from 'react-i18next';
import {COLORS} from '../../constants/colors';
import {navigationRef} from '../../navigation';

const AboutUsScreen = () => {
  const {t} = useTranslation();
  const onGoBack = () => {
    navigationRef.goBack();
  };
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('settings.aboutUs')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: 'https://nexa-tech-team.vercel.app/assets/logo-CJsuXJSw_1768365608404-CJsuXJSw.jpg',
            }}
            style={styles.logo}
          />
          <AppText
            value="Nexa Loan"
            color={COLORS.foundation.blue.b300}
            fontSize={24}
            fontWeight={700}
          />
          <AppText
            value="Version 1.0.0"
            color={COLORS.foundation.neutral.n500}
            fontSize={14}
          />
        </View>

        <View style={styles.section}>
          <AppText
            value={t('settings.aboutContent.description')}
            color={COLORS.foundation.neutral.n500}
            fontSize={16}
            lineHeight={24}
          />
        </View>

        <View style={styles.section}>
          <AppText
            value={t('settings.aboutContent.features.title')}
            color={COLORS.foundation.neutral.n700}
            fontSize={18}
            fontWeight={600}
            appStyle={styles.sectionTitle}
          />
          <View style={styles.featureList}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.dot} />
                <AppText
                  value={t(`settings.aboutContent.features.f${i}`)}
                  color={COLORS.foundation.neutral.n500}
                  fontSize={15}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText
            value={t('settings.aboutContent.mission')}
            color={COLORS.foundation.neutral.n500}
            fontSize={16}
            lineHeight={24}
          />
        </View>

        <View style={styles.footer}>
          <AppText
            value={t('settings.aboutContent.contact')}
            color={COLORS.foundation.blue.b300}
            fontSize={14}
            fontWeight={500}
          />
          <AppText
            value="© 2024 Nexa Loan. All rights reserved."
            color={COLORS.foundation.neutral.n200}
            fontSize={12}
            appStyle={{marginTop: 8}}
          />
        </View>
      </ScrollView>
    </AppView>
  );
};
export default AboutUsScreen;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 20,
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.foundation.blue.b300,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.foundation.neutral.n200,
    paddingTop: 24,
  },
});
