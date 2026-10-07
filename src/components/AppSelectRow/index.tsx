import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import AppText from '../AppText';
import {COLORS} from '../../constants/colors';

type TAppSelectRow = {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  isBorder?: boolean;
  isCheck?: boolean;
  onPress: () => void;
};
const AppSelectRow = ({label, subLabel, onPress, icon, isCheck, isBorder}: TAppSelectRow) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.overall, isCheck && styles.checkStyle]}>
      <View style={styles.flag}>{icon}</View>
      <View style={[styles.content, isBorder && !isCheck && styles.border]}>
        <View style={styles.textCol}>
          <AppText
            color={COLORS.foundation.neutral.n700}
            value={label}
            fontSize={15}
            fontWeight={isCheck ? 700 : 600}
            numberOfLines={1}
          />
          {!!subLabel && subLabel !== label && (
            <AppText
              color={COLORS.foundation.neutral.n500}
              value={subLabel}
              fontSize={12}
              fontWeight={500}
              numberOfLines={1}
            />
          )}
        </View>
        <View style={[styles.radio, isCheck && styles.radioChecked]}>
          {isCheck && <View style={styles.radioDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AppSelectRow;

const styles = StyleSheet.create({
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 14,
    borderRadius: 16,
  },
  checkStyle: {
    backgroundColor: COLORS.foundation.blue.b50,
  },
  flag: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{scale: 1.3}],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingRight: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderColor: COLORS.foundation.neutral.n50,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.foundation.neutral.n100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioChecked: {
    borderColor: COLORS.foundation.blue.b400,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.foundation.blue.b400,
  },
});
