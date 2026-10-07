import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import AppText from '../AppText';
import {COLORS} from '../../constants/colors';

type TAppProgressRing = {
  progress: number;
  size?: number;
  strokeWidth?: number;
};
const AppProgressRing = ({
  progress,
  size = 96,
  strokeWidth = 10,
}: TAppProgressRing) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.foundation.gold.g300}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.label}>
        <AppText
          value={`${clamped.toFixed(0)}%`}
          fontSize={size / 4.8}
          fontWeight={700}
          color={COLORS.foundation.neutral.n0}
        />
      </View>
    </View>
  );
};

export default AppProgressRing;

const styles = StyleSheet.create({
  label: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
