import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import AppText from '../../../components/AppText';
import {COLORS} from '../../../constants/colors';
import {ICONS} from '../../../constants/icon';

type TCard = {
  label: string;
  leftIcon?: React.ReactNode;
  iconBackgroundColor?: string;
  rightSection?: {
    label: string;
    icon: React.ReactNode;
  };
  onPress?: () => void;
  isBorder?: boolean;
};
const Card = ({
  label,
  leftIcon,
  iconBackgroundColor = COLORS.foundation.blue.b50,
  rightSection,
  onPress,
  isBorder,
}: TCard) => {
  return (
    <TouchableOpacity style={styles.overall} onPress={onPress}>
      {leftIcon && (
        <View style={[styles.iconTile, {backgroundColor: iconBackgroundColor}]}>
          {leftIcon}
        </View>
      )}
      <View style={[styles.content, isBorder && styles.border]}>
        <AppText
          color={COLORS.foundation.neutral.n700}
          value={label}
          fontSize={15}
          fontWeight={600}
          numberOfLines={1}
          textStyle={styles.label}
        />
        <View style={styles.rows}>
          {rightSection && (
            <View style={styles.rows}>
              <AppText
                color={COLORS.foundation.neutral.n500}
                value={rightSection.label}
                fontSize={14}
                fontWeight={500}
                numberOfLines={1}
              />
              {rightSection.icon}
            </View>
          )}
          <ICONS.button.chervon_right />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 14,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 16,
    paddingRight: 14,
  },
  label: {
    flexShrink: 1,
  },
  border: {
    borderBottomWidth: 1,
    borderColor: COLORS.foundation.neutral.n50,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
