import {StyleSheet, View} from 'react-native';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {useTranslation} from 'react-i18next';
import {COLORS} from '../../constants/colors';
import {navigationRef} from '../../navigation';
import WebView from 'react-native-webview';

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
      <WebView
        source={{
          uri: 'https://www.notion.so/Loaner-Privacy-Policy-2303265de24380a29379fcd520cceff4',
        }}
        style={{flex: 1}}
      />
    </AppView>
  );
};
export default PrivacyPolicyScreen;
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
});
