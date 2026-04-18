import {
  StyleProp,
  TextStyle,
  TextInput,
  KeyboardTypeOptions,
  StyleSheet,
} from 'react-native';
import React from 'react';
import {FONT_FAMILY} from '../../constants/font_family';
import {COLORS} from '../../constants/colors';
type TAppInput = {
  value: string;
  color: string;
  fontWeight: number;
  fontSize: number;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  textStyle?: StyleProp<TextStyle>;
};
const AppInput = ({
  color,
  fontSize,
  fontWeight,
  value,
  textStyle,
  keyboardType,
  onChangeText,
}: TAppInput) => {
  return (
    <TextInput
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      value={value}
      style={[
        styles.inputStyle,
        {color, fontFamily: FONT_FAMILY[fontWeight], fontSize},
        textStyle,
      ]}
    />
  );
};

export default AppInput;

const styles = StyleSheet.create({
  inputStyle: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n200,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
