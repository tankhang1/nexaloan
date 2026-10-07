import React from 'react';
import {StyleSheet, View} from 'react-native';
import AppText from '../AppText';
import {COLORS} from '../../constants/colors';

type TAppCurrencyBadge = {
  symbol: string;
  size?: number;
};
const AppCurrencyBadge = ({symbol, size = 28}: TAppCurrencyBadge) => {
  // Long symbols (CHF, lei, R$) need a smaller font to fit the circle.
  const fontSize = size * (symbol.length >= 3 ? 0.32 : symbol.length === 2 ? 0.4 : 0.52);

  return (
    <View
      style={[
        styles.badge,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      <AppText
        value={symbol}
        fontSize={fontSize}
        fontWeight={700}
        color={COLORS.foundation.gold.g300}
      />
    </View>
  );
};

export default AppCurrencyBadge;

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.foundation.blue.b400,
  },
});
