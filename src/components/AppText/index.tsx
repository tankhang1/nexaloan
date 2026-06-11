import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { FONT_FAMILY } from "../../constants/font_family";

type TAppText = {
  value: string;
  color?: string;
  fontWeight?: number;
  fontSize: number;
  lineHeight?: number;
  appStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
  allowFontScaling?: boolean;
};
const AppText = ({
  value,
  color,
  numberOfLines,
  fontSize,
  fontWeight = 400,
  lineHeight,
  appStyle,
  textStyle,
  allowFontScaling = false,
}: TAppText) => {
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={numberOfLines}
      style={[
        {
          color,
          fontFamily: FONT_FAMILY[fontWeight],
          fontSize,
          lineHeight,
        },
        textStyle,
        appStyle,
      ]}
    >
      {value}
    </Text>
  );
};

export default AppText;
