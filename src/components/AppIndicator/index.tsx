import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import {COLORS} from '../../constants/colors';
import AppText from '../../components/AppText';
import {WIDTH} from '../../constants/dimension';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

type TTab = {
  id: number;
  children?: string | React.ReactNode;
  isLeftBorder?: boolean;
  isRightBorder?: boolean;
  tabWidth?: number;
  isDisable?: boolean;
};
type TIndicator = {
  tabs: TTab[];
  isEqual?: boolean;
  tabWidth?: number;
  activeKey: number;
  onPress?: (value: number) => void;
};
const AppIndicator = ({
  tabs,
  activeKey,
  onPress,
  tabWidth = 0,
  isEqual = true,
}: TIndicator) => {
  const {t} = useTranslation();
  const transX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: transX.value}],
    };
  });
  const onNotiFeatureReleaseSoon = () => {
    Toast.show({
      text1: t('noti.title'),
      text2: t('noti.desc'),
      position: 'top',
      type: 'info',
    });
  };
  useEffect(() => {
    if (isEqual) {
      transX.value = withTiming(activeKey * tabWidth);
    } else {
      if (activeKey === 0) {
        transX.value = withTiming(0);
      } else {
        let sum = 0;
        tabs.forEach((tab, index) => {
          if (index < activeKey) {
            sum += tab.tabWidth || 0;
          }
        });
        transX.value = withTiming(sum);
      }
    }
  }, [activeKey, tabWidth, transX, isEqual, tabs]);
  return (
    <View
      style={[
        styles.overall,
        {
          width: isEqual
            ? (tabWidth || 0) * tabs.length
            : tabs.reduce((pre, cur) => pre + (cur?.tabWidth || 0), 0),
        },
      ]}>
      <Animated.View
        style={[
          styles.item,
          {width: isEqual ? tabWidth : tabs?.[activeKey]?.tabWidth},
          styles.active,
          animatedStyle,
          activeKey === 0 ? styles.borderLeft : null,
          activeKey === tabs.length ? styles.borderRight : null,
        ]}
      />
      {tabs.map((item, index) => (
        <TouchableOpacity
          onPress={() => {
            if (item.isDisable) {
              onNotiFeatureReleaseSoon();
            } else {
              onPress?.(index);
            }
          }}
          key={index}
          style={[styles.item, {width: isEqual ? tabWidth : item.tabWidth}]}>
          {typeof item.children === 'string' ? (
            <AppText
              value={item.children}
              color={COLORS.foundation.neutral.n900}
              fontSize={11}
              fontWeight={600}
              textStyle={styles.center}
            />
          ) : (
            item.children
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AppIndicator;

const styles = StyleSheet.create({
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    width: WIDTH - 34,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderRadius: 18,
    borderColor: COLORS.foundation.neutral.n100,
    overflow: 'hidden',
    position: 'relative',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  borderLeft: {
    borderLeftWidth: 0,
  },
  borderRight: {
    borderRightWidth: 0,
  },
  active: {
    backgroundColor: COLORS.foundation.blue.b75,
    borderWidth: 0,
    borderRadius: 16,
    position: 'absolute',
  },
  center: {
    textAlign: 'center',
  },
  opacity: {
    opacity: 0.5,
  },
});
