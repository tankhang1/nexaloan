import React from 'react';
import {Platform, View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import {useFonts} from 'expo-font';
import MobileAds from 'react-native-google-mobile-ads';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import {
  NotoSans_100Thin,
  NotoSans_200ExtraLight,
  NotoSans_300Light,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
  NotoSans_800ExtraBold,
  NotoSans_900Black,
} from '@expo-google-fonts/noto-sans';
import {useEffect} from 'react';

import AppNavigation from './src/navigation';
import {persistor, store} from './src/redux/store';

const App = () => {
  const [fontsLoaded] = useFonts({
    NotoSans_100Thin,
    NotoSans_200ExtraLight,
    NotoSans_300Light,
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    NotoSans_800ExtraBold,
    NotoSans_900Black,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      void onInitializeAds();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const onInitializeAds = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

        if (result === RESULTS.DENIED) {
          await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
        }
      }

      const adapterStatuses = await MobileAds().initialize();
      console.log('adapterStatuses', adapterStatuses);
    } catch (error) {
      console.warn('Failed to initialize mobile ads', error);
    }
  };

  if (!fontsLoaded) {
    return <View style={{flex: 1}} />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigation />
        <Toast />
      </PersistGate>
    </Provider>
  );
};

export default App;
