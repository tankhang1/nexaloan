import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import {navigationRef} from '../../navigation';
import AppSelectRow from '../../components/AppSelectRow';
import {formatNumber} from '../../hooks/format_number';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  markCurrencyInitialized,
  updateCurrency,
} from '../../redux/slices/app_slices';
import {CURRENCIES} from '../../constants/currency';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

const CurrencyScreen = () => {
  const {t} = useTranslation();
  const {currency} = useSelector((state: RootState) => state.app);
  const [curCurrency, setCurCurrency] = useState<{
    code: string;
    symbol: string;
    locale: string;
  }>();
  const dispatch = useDispatch();
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onSave = () => {
    if (curCurrency) {
      dispatch(updateCurrency(curCurrency));
      dispatch(markCurrencyInitialized());
      Toast.show({
        text1: t('currency.notification.title'),
        text2: t('currency.notification.success'),
        position: 'top',
        type: 'success',
      });
    }
  };
  useEffect(() => {
    setCurCurrency(currency);
  }, [currency]);
  const hasChanged = !!curCurrency && curCurrency.code !== currency.code;

  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('currency.title')}
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
          {CURRENCIES.map((item, index) => (
            <AppSelectRow
              onPress={() => {
                setCurCurrency({
                  code: item.label,
                  symbol: item.symbol,
                  locale: item.locale,
                });
              }}
              label={item.label}
              subLabel={formatNumber(SAMPLE_AMOUNT, item.locale, true, item.label)}
              key={item.label}
              icon={item.icon}
              isBorder={index < CURRENCIES.length - 1}
              isCheck={item.label === curCurrency?.code}
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
          value={t('currency.save')}
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

export default CurrencyScreen;

// Shown under each code so users can preview the number format.
const SAMPLE_AMOUNT = 1234567.89;

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
