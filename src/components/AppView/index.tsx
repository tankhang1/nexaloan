import {StyleSheet, ImageBackground, StyleProp, ViewStyle} from 'react-native';
import React from 'react';
import {COLORS} from '../../constants/colors';
import {SafeAreaView} from 'react-native-safe-area-context';

type TAppView = {
  children: React.ReactNode;
  appStyle: StyleProp<ViewStyle>;
};
const AppView = ({children, appStyle}: TAppView) => {
  return (
    <ImageBackground
      style={styles.overall}
      source={require('../../assets/background.png')}>
      <SafeAreaView style={[styles.areaview, appStyle]}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default AppView;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    backgroundColor: COLORS.foundation.neutral.n0,
  },
  areaview: {
    flex: 1,
  },
});
