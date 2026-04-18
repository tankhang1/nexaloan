import {StyleSheet, StyleProp, View, ViewStyle} from 'react-native';
import React from 'react';
import {COLORS} from '../../constants/colors';
import {SafeAreaView} from 'react-native-safe-area-context';

type TAppView = {
  children: React.ReactNode;
  appStyle: StyleProp<ViewStyle>;
};
const AppView = ({children, appStyle}: TAppView) => {
  return (
    <View style={styles.overall}>
      <View pointerEvents="none" style={[styles.shape, styles.shapeTopRight]} />
      <View pointerEvents="none" style={[styles.shape, styles.shapeCenter]} />
      <View pointerEvents="none" style={[styles.shape, styles.shapeBottomLeft]} />
      <View pointerEvents="none" style={styles.gridWrap}>
        <View style={styles.gridColumn} />
        <View style={styles.gridColumn} />
        <View style={styles.gridColumn} />
      </View>
      <SafeAreaView style={[styles.areaview, appStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default AppView;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    backgroundColor: '#F6F1E7',
  },
  areaview: {
    flex: 1,
  },
  shape: {
    position: 'absolute',
    borderRadius: 40,
    transform: [{rotate: '-18deg'}],
  },
  shapeTopRight: {
    width: 260,
    height: 260,
    top: -90,
    right: -70,
    backgroundColor: 'rgba(205, 235, 226, 0.9)',
  },
  shapeCenter: {
    width: 180,
    height: 180,
    top: '34%',
    right: -110,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  shapeBottomLeft: {
    width: 240,
    height: 240,
    bottom: -120,
    left: -100,
    backgroundColor: 'rgba(227, 214, 190, 0.45)',
  },
  gridWrap: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    opacity: 0.32,
  },
  gridColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(39, 50, 47, 0.05)',
  },
});
