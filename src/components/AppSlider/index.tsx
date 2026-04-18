import React, {useEffect} from 'react';
import {useSharedValue, withTiming} from 'react-native-reanimated';
import {Slider} from 'react-native-awesome-slider';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet, View} from 'react-native';
import {COLORS} from '../../constants/colors';
import {ICONS} from '../../constants/icon';
import AppText from '../AppText';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {formatNumber} from '../../hooks/format_number';

type TAppSlider = {
  minValue: number;
  maxValue: number;
  curValue: number;
  isFloat?: boolean;
  setCurValue: (value: number) => void;
  prefix?: boolean;
};
const AppSlider = ({
  minValue,
  maxValue,
  prefix,
  curValue,
  isFloat,
  setCurValue,
}: TAppSlider) => {
  const {currency} = useSelector((state: RootState) => state.app);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      isFloat
        ? Math.max(curValue * 10, minValue * 10)
        : Math.max(curValue, minValue),
    );
    min.value = withTiming(isFloat ? minValue * 10 : minValue);
    max.value = withTiming(isFloat ? maxValue * 10 : maxValue);
  }, [curValue, progress, isFloat, minValue, maxValue, min, max]);
  return (
    <GestureHandlerRootView style={styles.overall}>
      <Slider
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        sliderHeight={1}
        steps={1}
        theme={{
          minimumTrackTintColor: COLORS.foundation.blue.b300,
          maximumTrackTintColor: COLORS.foundation.neutral.n200,
          bubbleBackgroundColor: 'transparent',
          bubbleTextColor: COLORS.foundation.blue.b500,
        }}
        renderThumb={() => (
          <View style={styles.mark}>
            <ICONS.button.chervon_bold_left width={10} />
            <ICONS.button.chervon_bold_right width={10} />
          </View>
        )}
        bubble={value =>
          isFloat
            ? new Intl.NumberFormat(currency.locale).format(
                +(value / 10).toFixed(2),
              )
            : new Intl.NumberFormat(currency.locale).format(Math.floor(value))
        }
        onSlidingComplete={value => {
          isFloat
            ? setCurValue(+(value / 10).toFixed(2))
            : setCurValue(Math.floor(value));
        }}
      />
      <View style={styles.rows}>
        <AppText
          fontSize={11}
          fontWeight={500}
          color={COLORS.foundation.neutral.n500}
          value={`${formatNumber(
            minValue,
            currency.locale,
            prefix ? true : false,
            prefix ? currency.code : undefined,
          )}`}
        />
        <AppText
          fontSize={11}
          fontWeight={500}
          color={COLORS.foundation.neutral.n500}
          value={formatNumber(
            maxValue,
            currency.locale,
            true,
            prefix ? currency.code : undefined,
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default AppSlider;

const styles = StyleSheet.create({
  overall: {
    height: 50,
    width: '100%',
  },
  mark: {
    width: 44,
    height: 24,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 24,
    backgroundColor: COLORS.foundation.blue.b300,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    transform: [{translateX: -12.5}],
  },
  rows: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
