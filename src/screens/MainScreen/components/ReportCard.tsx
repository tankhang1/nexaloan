import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import AppText from '../../../components/AppText';
import AppProgressRing from '../../../components/AppProgressRing';
import {COLORS} from '../../../constants/colors';
import {formatNumber} from '../../../hooks/format_number';
import {FINANCE_IMAGES} from '../../../assets';

type TReportCard = {
  loanCount: number;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  paidProgress: number;
  locale: string;
  currencyCode: string;
  onStart: () => void;
};

const ReportCard = ({
  loanCount,
  totalDebt,
  totalPaid,
  remainingDebt,
  paidProgress,
  locale,
  currencyCode,
  onStart,
}: TReportCard) => {
  const {t} = useTranslation();
  const format = (value: number) =>
    formatNumber(value, locale, true, currencyCode);

  return (
    <ImageBackground
      source={FINANCE_IMAGES.cityBackground}
      resizeMode="cover"
      style={styles.card}
      imageStyle={styles.cardImage}>
      <View pointerEvents="none" style={styles.overlay} />

      {loanCount === 0 ? (
        // Empty state: invite the first calculation instead of showing zeros.
        <View style={styles.emptyRow}>
          <View style={styles.emptyText}>
            <AppText
              value={t('main.heroTitle')}
              fontSize={20}
              fontWeight={700}
              color={COLORS.foundation.neutral.n0}
              lineHeight={26}
            />
            <AppText
              value={t('main.heroDesc')}
              fontSize={12}
              fontWeight={400}
              color="rgba(255,255,255,0.75)"
              lineHeight={18}
            />
            <Pressable
              style={({pressed}) => [styles.cta, pressed && styles.pressed]}
              onPress={onStart}>
              <AppText
                value={t('mortgage.calculate')}
                fontSize={14}
                fontWeight={700}
                color={COLORS.foundation.blue.b500}
              />
              <Feather
                name="arrow-right"
                size={16}
                color={COLORS.foundation.blue.b500}
              />
            </Pressable>
          </View>
          <Image
            source={FINANCE_IMAGES.growthOrb}
            resizeMode="contain"
            style={styles.emptyImage}
          />
        </View>
      ) : (
        <>
          <View style={styles.topRow}>
            <View style={styles.flex}>
              <AppText
                value={`${t('main.report')} · ${loanCount}`}
                fontSize={12}
                fontWeight={600}
                color={COLORS.foundation.gold.g300}
              />
              <AppText
                value={t('main.remainingBalance')}
                fontSize={13}
                fontWeight={500}
                color="rgba(255,255,255,0.75)"
                textStyle={styles.remainingLabel}
              />
              <AppText
                value={format(remainingDebt)}
                fontSize={28}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
                numberOfLines={1}
                adjustsFontSizeToFit
              />
            </View>
            <AppProgressRing progress={paidProgress} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View style={[styles.dot, styles.dotTotal]} />
              <View style={styles.flex}>
                <AppText
                  value={t('main.totalDebt')}
                  fontSize={11}
                  fontWeight={500}
                  color="rgba(255,255,255,0.7)"
                />
                <AppText
                  value={format(totalDebt)}
                  fontSize={14}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n0}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                />
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={[styles.dot, styles.dotPaid]} />
              <View style={styles.flex}>
                <AppText
                  value={t('main.totalPaid')}
                  fontSize={11}
                  fontWeight={500}
                  color="rgba(255,255,255,0.7)"
                />
                <AppText
                  value={format(totalPaid)}
                  fontSize={14}
                  fontWeight={700}
                  color={COLORS.foundation.gold.g300}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                />
              </View>
            </View>
          </View>
        </>
      )}
    </ImageBackground>
  );
};

export default ReportCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    gap: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.foundation.blue.b500,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  cardImage: {
    borderRadius: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 30, 60, 0.35)',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    flex: 1,
    gap: 8,
  },
  emptyImage: {
    width: 104,
    height: 140,
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.foundation.gold.g300,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  remainingLabel: {
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(226,194,117,0.3)',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotTotal: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotPaid: {
    backgroundColor: COLORS.foundation.gold.g300,
  },
});
