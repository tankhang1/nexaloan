import {View, StyleSheet, Pressable} from 'react-native';
import React from 'react';
import AppText from '../../../components/AppText';
import {COLORS} from '../../../constants/colors';
import {WIDTH} from '../../../constants/dimension';
import Animated, {FadeIn} from 'react-native-reanimated';

type TCard = {
  icon: React.ReactNode;
  title: string;
  value: string;
  year: string;
  time: string;
  index: number;
  onPress: (value: string) => void;
  id: string;
};
const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);
const Card = ({icon, time, title, value, year, id, index, onPress}: TCard) => {
  return (
    <AnimatedTouchable
      entering={FadeIn.delay(index * 100)}
      onPress={() => onPress(id)}>
      <View style={styles.overall}>
        <View style={styles.leftSection}>
          <View style={styles.icon}>{icon}</View>
          <View style={styles.contentContainer}>
            <AppText
              value={title}
              fontSize={12}
              fontWeight={500}
              color={COLORS.foundation.neutral.n700}
            />
            <AppText
              value={value}
              fontSize={16}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
            />
          </View>
        </View>
        <View style={styles.rightSection}>
          <AppText
            value={year}
            fontSize={14}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
          <AppText
            value={time}
            fontSize={11}
            fontWeight={400}
            color={COLORS.foundation.neutral.n700}
          />
        </View>
      </View>
    </AnimatedTouchable>
  );
};

export default Card;

const styles = StyleSheet.create({
  overall: {
    width: WIDTH - 34,
    backgroundColor: 'rgba(255,255,255,0.96)',
    minHeight: 76,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    gap: 4,
    alignItems: 'flex-end',
  },
  contentContainer: {},
  icon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.foundation.blue.b300,
  },
});
