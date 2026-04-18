import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import {Shadow} from 'react-native-shadow-2';
import {navigationRef} from '../../navigation';
import Card from './components/Card';
import {HEIGHT, WIDTH} from '../../constants/dimension';
import {useTranslation} from 'react-i18next';
import {LANGUAGES} from '../../constants/language';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {updateLanguage} from '../../redux/slices/app_slices';
import Toast from 'react-native-toast-message';
import i18next from 'i18next';

const LanguageScreen = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {language} = useSelector((state: RootState) => state.app);
  const [curLanguage, setCurLanguage] = useState('');
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onSave = () => {
    i18next.changeLanguage(curLanguage);
    Toast.show({
      text1: t('language.notification.title'),
      text2: t('language.notification.success'),
      position: 'top',
      type: 'success',
    });
    dispatch(updateLanguage(curLanguage));
  };
  useEffect(() => {
    setCurLanguage(language);
  }, [language]);
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('language.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
      </View>
      <View style={styles.scrollContainer}>
        <Shadow
          distance={1} // equivalent to elevation
          startColor="rgba(0, 0, 0, 1)" // your rgba color
          offset={[4, 4]} // X, Y offset
        >
          <View style={styles.container}>
            <ScrollView>
              {LANGUAGES.map((item, index) => (
                <Card
                  onPress={() => setCurLanguage(item.code)}
                  label={item.label}
                  icon={item.icon}
                  isCheck={curLanguage === item.code}
                  isBorder
                  key={index}
                />
              ))}
            </ScrollView>
          </View>
        </Shadow>

        <AppIconButton style={styles.button} onPress={onSave}>
          <AppText
            value={t('language.save')}
            fontSize={14}
            fontWeight={600}
            color={COLORS.foundation.neutral.n900}
          />
        </AppIconButton>
      </View>
    </AppView>
  );
};

export default LanguageScreen;

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
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },

  container: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n900,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 16,
    height: HEIGHT * 0.7,
    overflow: 'hidden',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    justifyContent: 'flex-end',
    height: 70,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: WIDTH,
  },
  button: {width: WIDTH - 34, height: 55},
  spacing: {height: 100},
});
