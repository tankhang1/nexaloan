import {Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {COLORS} from '../../constants/colors';
import {Shadow} from 'react-native-shadow-2';

type TAppIconButton = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};
const AppIconButton = ({children, style, onPress}: TAppIconButton) => {
  return (
    <Pressable onPress={onPress}>
      <Shadow
        distance={1} // equivalent to elevation
        startColor="rgba(0, 0, 0, 1)" // your rgba color
        offset={[4, 4]} // X, Y offset
      >
        <View style={[styles.overall, style]}>{children}</View>
      </Shadow>
    </Pressable>
  );
};

export default AppIconButton;

const styles = StyleSheet.create({
  overall: {
    backgroundColor: COLORS.foundation.blue.b75,
    width: 55,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n900,
    // iOS shadow
    shadowColor: 'rgba(0, 0, 0, 1)',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 1,
    shadowRadius: 0,

    // Android shadow (only elevation works)
    elevation: 10,
  },
});
