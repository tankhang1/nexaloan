import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import {navigationRef} from '../../navigation';
import AppSelectRow from '../../components/AppSelectRow';
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
  const hasChanged = curLanguage !== language;

  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('language.title')}
          fontSize={20}
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          {LANGUAGES.map((item, index) => (
            <AppSelectRow
              onPress={() => setCurLanguage(item.code)}
              label={item.nativeName}
              subLabel={item.label}
              icon={item.icon}
              isCheck={curLanguage === item.code}
              isBorder={index < LANGUAGES.length - 1}
              key={item.code}
            />
          ))}
        </ScrollView>
      </View>

      <Pressable
        style={({pressed}) => [
          styles.button,
          !hasChanged && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
        disabled={!hasChanged}
        onPress={onSave}>
        <AppText
          value={t('language.save')}
          fontSize={16}
          fontWeight={700}
          color={
            hasChanged
              ? COLORS.foundation.neutral.n0
              : COLORS.foundation.neutral.n500
          }
        />
      </Pressable>
    </AppView>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerSpacer: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  listContent: {
    padding: 6,
  },
  button: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.foundation.blue.b400,
  },
  buttonDisabled: {
    backgroundColor: COLORS.foundation.neutral.n50,
  },
  pressed: {
    opacity: 0.85,
  },
});
