import {StyleSheet, View, ScrollView} from 'react-native';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {useTranslation} from 'react-i18next';
import {COLORS} from '../../constants/colors';
import {navigationRef} from '../../navigation';

const PrivacyPolicyScreen = () => {
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
          value={t('settings.privacy')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText
          value={t('settings.privacyContent.title')}
          fontSize={22}
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
          appStyle={styles.mainTitle}
        />
        <AppText
          value={t('settings.privacyContent.intro')}
          fontSize={16}
          color={COLORS.foundation.neutral.n500}
          appStyle={styles.intro}
        />

        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.section}>
            <AppText
              value={t(`settings.privacyContent.section${i}.title`)}
              fontSize={18}
              fontWeight={600}
              color={COLORS.foundation.neutral.n700}
              appStyle={styles.sectionTitle}
            />
            <AppText
              value={t(`settings.privacyContent.section${i}.content`)}
              fontSize={15}
              color={COLORS.foundation.neutral.n500}
              lineHeight={22}
            />
          </View>
        ))}
      </ScrollView>
    </AppView>
  );
};
export default PrivacyPolicyScreen;
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
  mainTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  intro: {
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
});
