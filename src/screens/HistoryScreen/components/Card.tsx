import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ImageSourcePropType,
} from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import AppText from '../../../components/AppText';
import {COLORS} from '../../../constants/colors';
import Animated, {FadeIn} from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type TCard = {
  image: ImageSourcePropType;
  title: string;
  value: string;
  year: string;
  time: string;
  index: number;
  onPress: (value: string) => void;
  onLongPress?: (value: string) => void;
  onDelete?: (id: string, closeSwipe: () => void) => void;
  id: string;
};
const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

const Card = ({
  image,
  time,
  title,
  value,
  year,
  id,
  index,
  onPress,
  onLongPress,
  onDelete,
}: TCard) => {
  const swipeableRef = React.useRef<Swipeable | null>(null);

  const renderRightActions = () => {
    return (
      <View style={styles.deleteAction}>
        <Feather name="trash-2" size={24} color={COLORS.foundation.neutral.n0} />
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={onDelete ? renderRightActions : undefined}
      onSwipeableOpen={() =>
        onDelete?.(id, () => {
          swipeableRef.current?.close();
        })
      }
      friction={2}
      rightThreshold={40}
    >
      <AnimatedTouchable
        entering={FadeIn.delay(index * 100)}
        onPress={() => onPress(id)}
        onLongPress={() => onLongPress?.(id)}
      >
        <View style={styles.overall}>
          <View style={styles.imageTile}>
            <Image source={image} resizeMode="contain" style={styles.image} />
          </View>
          <View style={styles.content}>
            <AppText
              value={title}
              fontSize={12}
              fontWeight={600}
              color={COLORS.foundation.neutral.n500}
            />
            <AppText
              value={value}
              fontSize={17}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
              numberOfLines={1}
              adjustsFontSizeToFit
            />
            <View style={styles.metaRow}>
              <View style={styles.chip}>
                <Feather name="clock" size={11} color={COLORS.foundation.blue.b400} />
                <AppText
                  value={year}
                  fontSize={11}
                  fontWeight={600}
                  color={COLORS.foundation.blue.b400}
                />
              </View>
              <AppText
                value={time}
                fontSize={11}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
              />
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.foundation.neutral.n200} />
        </View>
      </AnimatedTouchable>
    </Swipeable>
  );
};

export default Card;

const styles = StyleSheet.create({
  overall: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  imageTile: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.foundation.blue.b50,
  },
  image: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.foundation.blue.b50,
  },
  deleteAction: {
    backgroundColor: '#E5484D',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 22,
    marginLeft: -22, // To overlap with card radius
  },
});
