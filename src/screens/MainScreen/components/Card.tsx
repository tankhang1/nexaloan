import {
  StyleSheet,
  View,
  Pressable,
  ColorValue,
  Image,
  ImageSourcePropType,
} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import {COLORS} from '../../../constants/colors';
import {WIDTH} from '../../../constants/dimension';
import AppText from '../../../components/AppText';

type TCard = {
  icon?: React.ReactNode;
  image?: ImageSourcePropType;
  title?: string;
  desc?: string;
  onPress?: () => void;
  isDisable?: boolean;
  badgeLabel?: string;
  accentColor?: ColorValue;
  iconBackgroundColor?: ColorValue;
  variant?: 'featured' | 'compact' | 'grid';
};

const Card = ({
  desc,
  icon,
  image,
  title,
  isDisable = false,
  onPress,
  badgeLabel = 'Calculator',
  accentColor = COLORS.foundation.blue.b500,
  iconBackgroundColor = COLORS.foundation.blue.b300,
  variant = 'compact',
}: TCard) => {
  const isFeatured = variant === 'featured';
  const isGrid = variant === 'grid';

  return (
    <Pressable onPress={onPress} disabled={isDisable}>
      <View
        style={[
          styles.cardWrapper,
          isFeatured
            ? styles.featuredCard
            : isGrid
            ? styles.gridCard
            : styles.compactCard,
          isDisable ? styles.opacity : null,
        ]}>
        {isGrid ? (
          <>
            <View style={styles.gridTopRow}>
              <View
                style={[
                  styles.gridIconContainer,
                  {backgroundColor: iconBackgroundColor},
                ]}>
                {image ? (
                  <Image
                    source={image}
                    style={styles.gridImage}
                    resizeMode="contain"
                  />
                ) : (
                  icon
                )}
              </View>
              <View style={styles.gridArrowWrap}>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={COLORS.foundation.neutral.n500}
                />
              </View>
            </View>
            <View style={styles.gridContent}>
              <AppText
                value={title || ''}
                fontSize={16}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                numberOfLines={2}
              />
              <AppText
                value={desc || ''}
                fontSize={11}
                fontWeight={400}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
                textStyle={styles.gridDescription}
              />
            </View>
          </>
        ) : isFeatured ? (
          <>
            <View style={styles.featuredTopRow}>
              <View
                style={[
                  styles.featuredIconContainer,
                  {backgroundColor: iconBackgroundColor},
                ]}>
                {icon}
              </View>
              <View style={[styles.featuredBadge, {backgroundColor: accentColor}]}>
                <AppText
                  value={badgeLabel}
                  fontSize={12}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n0}
                  numberOfLines={1}
                />
                <Feather
                  name="arrow-up-right"
                  size={15}
                  color={COLORS.foundation.neutral.n0}
                />
              </View>
            </View>
            <View style={styles.featuredContent}>
              <AppText
                value={title || ''}
                fontSize={26}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
                numberOfLines={2}
              />
              <AppText
                value={desc || ''}
                fontSize={14}
                fontWeight={400}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
                textStyle={styles.featuredDescription}
              />
            </View>
          </>
        ) : (
          <>
            <View
              style={[
                styles.iconContainer,
                {backgroundColor: iconBackgroundColor},
              ]}>
              {icon}
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <AppText
                  value={title || ''}
                  fontSize={18}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  numberOfLines={1}
                  textStyle={styles.titleText}
                />
                <View style={[styles.badge, {backgroundColor: accentColor}]}>
                  <AppText
                    value={badgeLabel}
                    fontSize={10}
                    fontWeight={700}
                    color={COLORS.foundation.neutral.n0}
                    numberOfLines={1}
                  />
                </View>
              </View>
              <AppText
                value={desc || ''}
                fontSize={12}
                fontWeight={400}
                color={COLORS.foundation.neutral.n500}
                numberOfLines={2}
                textStyle={styles.description}
              />
            </View>
            <View style={styles.chevronWrap}>
              <Feather
                name="chevron-right"
                size={20}
                color={COLORS.foundation.neutral.n500}
              />
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 22,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    width: WIDTH - 36,
    minHeight: 112,
    padding: 14,
    overflow: 'hidden',
    gap: 14,
    position: 'relative',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCard: {
    width: (WIDTH - 44) / 2,
    minHeight: 156,
    padding: 14,
    justifyContent: 'space-between',
  },
  featuredCard: {
    minHeight: 172,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: COLORS.foundation.neutral.n0,
  },
  iconContainer: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  featuredIconContainer: {
    width: 62,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  featuredContent: {
    gap: 8,
    maxWidth: '82%',
  },
  featuredDescription: {
    lineHeight: 21,
  },
  gridTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridIconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  gridImage: {
    width: 56,
    height: 56,
  },
  gridArrowWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.foundation.neutral.n25,
  },
  gridContent: {
    gap: 6,
  },
  gridDescription: {
    lineHeight: 16,
  },
  badge: {
    maxWidth: 84,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleText: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  description: {
    lineHeight: 18,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.foundation.neutral.n25,
  },
  opacity: {opacity: 0.5},
});
