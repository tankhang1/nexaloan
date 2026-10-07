import {Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {COLORS} from '../../constants/colors';

type TAppIconButton = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};
const AppIconButton = ({children, style, onPress}: TAppIconButton) => {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.overall, style]}>{children}</View>
    </Pressable>
  );
};

export default AppIconButton;

const styles = StyleSheet.create({
  overall: {
    backgroundColor: COLORS.foundation.neutral.n0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
});
