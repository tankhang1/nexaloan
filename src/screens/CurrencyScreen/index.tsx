import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import {navigationRef} from '../../navigation';
import Card from './components/Card';
import {HEIGHT, WIDTH} from '../../constants/dimension';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {updateCurrency} from '../../redux/slices/app_slices';
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
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('currency.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
      </View>
      <View style={styles.scrollContainer}>
        <View style={styles.container}>
          <ScrollView>
            {CURRENCIES.map((item, index) => (
              <Card
                onPress={() => {
                  setCurCurrency({
                    code: item.label,
                    symbol: item.symbol,
                    locale: item.locale,
                  });
                }}
                label={item.label}
                key={index}
                icon={item.icon}
                isBorder
                isCheck={item.label === curCurrency?.code}
              />
            ))}
          </ScrollView>
        </View>

        <AppIconButton style={styles.button} onPress={onSave}>
          <AppText
            value={t('currency.save')}
            fontSize={14}
            fontWeight={600}
            color={COLORS.foundation.neutral.n900}
          />
        </AppIconButton>
      </View>
    </AppView>
  );
};

export default CurrencyScreen;

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
    height: HEIGHT * 0.55,
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
