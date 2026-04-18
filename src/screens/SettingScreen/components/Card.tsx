import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {WIDTH} from '../../../constants/dimension';
import AppText from '../../../components/AppText';
import {COLORS} from '../../../constants/colors';
import {ICONS} from '../../../constants/icon';

type TCard = {
  label: string;
  rightSection?: {
    label: string;
    icon: React.ReactNode;
  };
  onPress?: () => void;
  isBorder?: boolean;
};
const Card = ({label, rightSection, onPress, isBorder}: TCard) => {
  return (
    <TouchableOpacity
      style={[styles.overall, isBorder && styles.border]}
      onPress={onPress}>
      <AppText
        color={COLORS.foundation.neutral.n700}
        value={label}
        fontSize={14}
        fontWeight={600}
      />
      <View style={styles.rows}>
        {rightSection && (
          <View style={[styles.rows, styles.gap8]}>
            <AppText
              color={COLORS.foundation.neutral.n700}
              value={rightSection.label}
              fontSize={14}
              fontWeight={400}
            />
            {rightSection.icon}
          </View>
        )}
        <ICONS.button.chervon_right />
      </View>
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
    gap: 4,
  },
  gap8: {
    gap: 8,
  },
});
