import {StyleSheet, View} from 'react-native';
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
      <View style={styles.body}>
        <AppText
          value="NeoPrototype"
          color={COLORS.foundation.neutral.n700}
          fontSize={18}
          fontWeight={600}
        />
        <AppText
          value="Version: 0.0.2"
          color={COLORS.foundation.neutral.n700}
          fontSize={18}
          fontWeight={600}
        />
      </View>
    </AppView>
  );
};
export default AboutUsScreen;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    gap: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 16,
    gap: 20,
  },
  body: {
    padding: 16,
    gap: 12,
  },
});
