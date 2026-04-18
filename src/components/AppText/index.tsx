import {StyleProp, Text, TextStyle} from 'react-native';
import React from 'react';
import {FONT_FAMILY} from '../../constants/font_family';

type TAppText = {
  value: string;
  color: string;
  fontWeight: number;
  fontSize: number;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
  allowFontScaling?: boolean;
};
const AppText = ({
  value,
  color,
  numberOfLines,
  fontSize,
  fontWeight,
  textStyle,
  allowFontScaling = false,
}: TAppText) => {
  return (
    <Text
      allowFontScaling={allowFontScaling}
      numberOfLines={numberOfLines}
      style={[
        {
          color,
          fontFamily: FONT_FAMILY[fontWeight],
          fontSize,
        },
        textStyle,
      ]}>
      {value}
    </Text>
  );
};

export default AppText;
