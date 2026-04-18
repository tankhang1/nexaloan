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
  placeholder?: string;
  placeholderTextColor?: string;
};
const AppInput = ({
  color,
  fontSize,
  fontWeight,
  value,
  textStyle,
  keyboardType,
  onChangeText,
  placeholder,
  placeholderTextColor,
}: TAppInput) => {
  return (
    <TextInput
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
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
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
