import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {WIDTH} from '../../../constants/dimension';
import AppText from '../../../components/AppText';
import {COLORS} from '../../../constants/colors';
import {ICONS} from '../../../constants/icon';

type TCard = {
  label: string;
  icon: React.ReactNode;
  isBorder?: boolean;
  isCheck?: boolean;
  onPress: () => void;
};
const Card = ({label, icon, isCheck, isBorder, onPress}: TCard) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.overall,
        isBorder && styles.border,
        isCheck && styles.checkStyle,
      ]}>
      <View style={styles.rows}>
        {icon}
        <AppText
          color={COLORS.foundation.neutral.n700}
          value={label}
          fontSize={14}
          fontWeight={600}
        />
      </View>
      {isCheck && <ICONS.check />}
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  overall: {
    width: WIDTH - 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkStyle: {
    backgroundColor: COLORS.foundation.blue.b50,
  },
});
