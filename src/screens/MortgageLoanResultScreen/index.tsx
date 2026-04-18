import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import AppView from '../../components/AppView';
import ConfettiCannon from 'react-native-confetti-cannon';
import {WIDTH} from '../../constants/dimension';
import {COLORS} from '../../constants/colors';
import {Shadow} from 'react-native-shadow-2';
import AppText from '../../components/AppText';
import {navigationRef} from '../../navigation';
import {ICONS} from '../../constants/icon';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import Share from 'react-native-share';
import {addLoan, ELoan} from '../../redux/slices/history';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import ViewShot from 'react-native-view-shot';
import dayjs from 'dayjs';
import AppIconButton from '../../components/AppIconButton';
import {useInterstitialAd} from 'react-native-google-mobile-ads';
import {ADS} from '../../constants/ads';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TNavigation} from '../../utils/types/navigation';
const Result = lazy(() => import('./components/Result'));

type Props = NativeStackScreenProps<TNavigation, 'MortgageLoanResultScreen'>;
const MortgageLoanResultScreen = ({route}: Props) => {
  const [isPending, startTransition] = useTransition();
  const {isLoaded, isClosed, load, show} = useInterstitialAd(ADS.interstitial);
  const [shouldSaveAfterAd, setShouldSaveAfterAd] = useState(false);
  const {t} = useTranslation();
  const viewRef = useRef<ViewShot>(null);
  const confettiRef = useRef<ConfettiCannon>(null);
  const mortgage = useSelector((state: RootState) => state.mortgage_loan);
  const dispatch = useDispatch();
  const onGoBack = () => {
    navigationRef.goBack();
  };
  const onNavMortgageLoanResultDetail = () => {
    startTransition(() => {
      navigationRef.navigate('MortgageLoanResultDetailScreen', {
        label: route.params.label,
      });
    });
  };
  const onSave = useCallback(() => {
    Toast.show({
      text1: t('mortgageResult.notificationTitle'),
      text2: t('mortgageResult.notificationMessage'),
      type: 'success',
      position: 'top',
    });
    dispatch(
      addLoan({
        ...mortgage,
        label: route.params.label,
        type:
          route.params.label === t('main.mortgage.title')
            ? ELoan.MORTGAGE_LOAN
            : route.params.label === t('main.car.title')
            ? ELoan.CAR_LOAN
            : route.params.label === t('main.business.title')
            ? ELoan.BUSINESS_LOAN
            : ELoan.PERSONAL_LOAN,
        }),
    );
  }, [dispatch, mortgage, t, route]);
  const onNavSetting = () => {
    navigationRef.navigate('SettingScreen');
  };
  const onGoHome = () => {
    navigationRef.navigate('MainScreen');
  };
  const onOpenShare = () => {
    if (!viewRef.current) return;

    setTimeout(() => {
      //@ts-expect-error no check
      viewRef.current
        .capture()
        .then(uri => {
          Share.open({url: uri, title: t('mortgageResult.resultTitle')});
        })
        .catch(console.log);
    }, 500); // delay 500ms to ensure render
  };
  useEffect(() => {
    confettiRef.current?.start();
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (isClosed && shouldSaveAfterAd) {
      setShouldSaveAfterAd(false);
      onSave();
    }
  }, [isClosed, onSave, shouldSaveAfterAd]);
  return (
    <ViewShot
      ref={viewRef}
      options={{
        fileName: `${t('mortgageResult.result.title')}-${dayjs(
          new Date(),
        ).format('DD-MM-YYYY')}`,
        format: 'jpg',
        quality: 1,
      }}
      style={styles.flex}>
      <AppView appStyle={styles.overall}>
        <View style={styles.header}>
          <AppIconButton onPress={onGoBack}>
            <ICONS.button.chervon_left />
          </AppIconButton>
          <AppIconButton onPress={onNavSetting}>
            <ICONS.button.setting />
          </AppIconButton>
        </View>
        {mortgage && (
          <Suspense
            fallback={
              <View
                style={[
                  styles.flex,
                  styles.flexRow,
                  styles.gap8,
                  styles.center,
                ]}>
                <ActivityIndicator />
                <AppText
                  fontSize={14}
                  fontWeight={600}
                  color={COLORS.foundation.neutral.n900}
                  value={t('loading')}
                />
              </View>
            }>
            <Result mortgage={mortgage} label={route.params.label} />
          </Suspense>
        )}
        <View style={styles.gap14}>
          <View style={[styles.rows, styles.gap8]}>
            <Shadow
              distance={1} // equivalent to elevation
              startColor="rgba(0, 0, 0, 1)" // your rgba color
              offset={[4, 4]} // X, Y offset
            >
              <Pressable
                style={[styles.button, styles.halfWidthButton]}
                onPress={onNavMortgageLoanResultDetail}>
                {isPending && <ActivityIndicator />}
                {!isPending && <ICONS.mortage_actions.pie_chart />}
                {!isPending && (
                  <AppText
                    fontSize={14}
                    fontWeight={600}
                    value={t('mortgageResult.amortization')}
                    color={COLORS.foundation.neutral.n900}
                  />
                )}
              </Pressable>
            </Shadow>
            <Shadow
              distance={1} // equivalent to elevation
              startColor="rgba(0, 0, 0, 1)" // your rgba color
              offset={[4, 4]} // X, Y offset
            >
              <Pressable
                style={[styles.button, styles.halfWidthButton]}
                onPress={onOpenShare}>
                <ICONS.mortage_actions.share />
                <AppText
                  fontSize={14}
                  fontWeight={600}
                  value={t('mortgageResult.share')}
                  color={COLORS.foundation.neutral.n900}
                />
              </Pressable>
            </Shadow>
          </View>
          <View style={[styles.rows]}>
            <Shadow
              distance={1} // equivalent to elevation
              startColor="rgba(0, 0, 0, 1)" // your rgba color
              offset={[4, 4]} // X, Y offset
            >
              <Pressable
                style={[styles.button, styles.homeButton]}
                onPress={onGoHome}>
                <AppText
                  value={t('mortgageResult.home')}
                  color={COLORS.foundation.neutral.n900}
                  fontWeight={600}
                  fontSize={14}
                />
              </Pressable>
            </Shadow>
            <Shadow
              distance={1} // equivalent to elevation
              startColor="rgba(0, 0, 0, 1)" // your rgba color
              offset={[4, 4]} // X, Y offset
            >
              <Pressable
                style={[styles.button, styles.fullWidthButton]}
                onPress={() => {
                  if (isLoaded) {
                    setShouldSaveAfterAd(true);
                    show();
                  } else {
                    onSave();
                    load();
                  }
                }}>
                <ICONS.mortage_actions.video_play />
                <AppText
                  fontSize={14}
                  fontWeight={600}
                  value={t('mortgageResult.save')}
                  color={COLORS.foundation.neutral.n900}
                />
              </Pressable>
            </Shadow>
          </View>
        </View>
        <ConfettiCannon
          count={200}
          origin={{x: -10, y: 0}}
          autoStart={false}
          ref={confettiRef}
        />
      </AppView>
    </ViewShot>
  );
};

export default MortgageLoanResultScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
    width: '100%',
    justifyContent: 'space-between',
  },
  halfWidthButton: {
    width: (WIDTH - 32) / 2 - 7,
    gap: 4,
    height: 55,
  },
  fullWidthButton: {
    width: WIDTH - 32 - 81 - 14,

    gap: 4,
    height: 55,
  },
  homeButton: {
    width: 81,
    height: 55,
    backgroundColor: COLORS.foundation.blue.b200,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: COLORS.foundation.blue.b75,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n900,
  },
  gap8: {
    gap: 8,
  },
  gap14: {
    gap: 14,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingVertical: 4,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
});
