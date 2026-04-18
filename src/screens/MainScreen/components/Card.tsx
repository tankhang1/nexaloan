import {StyleSheet, View, Pressable, ColorValue} from 'react-native';
import React from 'react';
import {COLORS} from '../../../constants/colors';
import {WIDTH} from '../../../constants/dimension';
import AppText from '../../../components/AppText';

type TCard = {
  icon?: React.ReactNode;
  title?: string;
  desc?: string;
  onPress?: () => void;
  isDisable?: boolean;
  badgeLabel?: string;
  accentColor?: ColorValue;
  iconBackgroundColor?: ColorValue;
};

const Card = ({
  desc,
  icon,
  title,
  isDisable = false,
  onPress,
  badgeLabel = 'Calculator',
  accentColor = COLORS.foundation.blue.b500,
  iconBackgroundColor = COLORS.foundation.blue.b300,
}: TCard) => {
  return (
    <Pressable onPress={onPress} disabled={isDisable}>
      <View style={[styles.cardWrapper, isDisable ? styles.opacity : null]}>
        <View
          style={[
            styles.decorCircle,
            {backgroundColor: iconBackgroundColor},
          ]}
        />
        <View
          style={[
            styles.decorArc,
            {borderColor: accentColor},
          ]}
        />
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: iconBackgroundColor},
            ]}>
            {icon}
          </View>
          <View style={[styles.badge, {backgroundColor: accentColor}]}>
            <AppText
              value={badgeLabel}
              fontSize={11}
              fontWeight={600}
              color={COLORS.foundation.neutral.n0}
            />
          </View>
        </View>
        <View style={styles.contentRow}>
          <View style={styles.textContainer}>
            <AppText
              value={title || ''}
              fontSize={21}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
            />
            <AppText
              value={desc || ''}
              fontSize={13}
              fontWeight={400}
              color={COLORS.foundation.neutral.n500}
              numberOfLines={3}
            />
          </View>
          <View style={[styles.accentRail, {backgroundColor: accentColor}]}>
            <View style={styles.accentRailInner} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create({
  cardWrapper: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 28,
    width: WIDTH - 36,
    minHeight: 184,
    padding: 18,
    overflow: 'hidden',
    gap: 18,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 14,
    flex: 1,
  },
  textContainer: {
    gap: 8,
    maxWidth: '74%',
    justifyContent: 'flex-end',
    flex: 1,
  },
  accentRail: {
    width: 44,
    borderRadius: 18,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 12,
    opacity: 0.18,
  },
  accentRailInner: {
    width: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.foundation.neutral.n0,
  },
  decorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    right: -24,
    top: -26,
    opacity: 0.08,
  },
  decorArc: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    right: -84,
    bottom: -92,
    borderWidth: 24,
    opacity: 0.08,
  },
  opacity: {opacity: 0.5},
});
