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
    width: 55,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
});
