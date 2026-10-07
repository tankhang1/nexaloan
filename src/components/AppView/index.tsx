import {ImageBackground, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FINANCE_IMAGES} from '../../assets';

type TAppView = {
  children: React.ReactNode;
  appStyle: StyleProp<ViewStyle>;
};
const AppView = ({children, appStyle}: TAppView) => {
  return (
    <ImageBackground
      source={FINANCE_IMAGES.paperBackground}
      resizeMode="cover"
      style={styles.overall}>
      <View pointerEvents="none" style={styles.veil} />
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
    backgroundColor: '#E9EEF5',
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 246, 250, 0.35)',
  },
  areaview: {
    flex: 1,
  },
});
