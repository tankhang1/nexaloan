import {
  StyleSheet,
  ImageBackground,
  View,
  ImageSourcePropType,
  Pressable,
} from 'react-native';
import React from 'react';
import {COLORS} from '../../../constants/colors';
import {Shadow} from 'react-native-shadow-2';
import {WIDTH} from '../../../constants/dimension';
import AppText from '../../../components/AppText';

type TCard = {
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
  title?: string;
  desc?: string;
  onPress?: () => void;
  isDisable?: boolean;
};
const Card = ({
  desc,
  icon,
  image,
  title,
  isDisable = false,
  onPress,
}: TCard) => {
  return (
    <Pressable onPress={onPress} disabled={isDisable}>
      <Shadow
        distance={1}
        startColor={isDisable ? '#ffff' : 'rgba(9, 9, 9, 1)'}
        offset={[4, 4]}>
        <ImageBackground
          source={image}
          style={[styles.cardWrapper, isDisable ? styles.opacity : null]}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={styles.textContainer}>
            <AppText
              value={title || ''}
              fontSize={20}
              fontWeight={700}
              color={COLORS.foundation.neutral.n900}
            />
            <AppText
              value={desc || ''}
              fontSize={10}
              fontWeight={400}
              color={COLORS.foundation.neutral.n700}
            />
          </View>
        </ImageBackground>
      </Shadow>
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create({
  cardWrapper: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n700,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 36,
    width: WIDTH - 36,
    height: 150, // give it a fixed height or responsive layout
    padding: 16,
    overflow: 'hidden', // optional if you want rounded images
    gap: 14,
  },
  cardDisableWrapper: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n700,
    backgroundColor: 'transparent',
    borderRadius: 36,
    width: WIDTH - 36,
    height: 150, // give it a fixed height or responsive layout
    padding: 16,
    overflow: 'hidden', // optional if you want rounded images
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.foundation.neutral.n900,
    borderRadius: 44,
  },
  textContainer: {
    gap: 4,
  },
  opacity: {opacity: 0.5},
});
