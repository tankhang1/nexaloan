import {View, StyleSheet, Pressable} from 'react-native';
import React from 'react';
import {Shadow} from 'react-native-shadow-2';
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
      <Shadow
        distance={1} // equivalent to elevation
        startColor="rgba(0, 0, 0, 1)" // your rgba color
        offset={[4, 4]} // X, Y offset
      >
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
      </Shadow>
    </AnimatedTouchable>
  );
};

export default Card;

const styles = StyleSheet.create({
  overall: {
    width: WIDTH - 34,
    backgroundColor: COLORS.foundation.neutral.n0,
    height: 64,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSection: {
    gap: 2,
    alignItems: 'flex-end',
  },
  contentContainer: {},
  icon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 41,
    backgroundColor: COLORS.foundation.neutral.n900,
  },
});
