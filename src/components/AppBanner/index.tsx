import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  useForeground,
} from 'react-native-google-mobile-ads';

import {ADS} from '../../constants/ads';

type TAppBanner = {
  size?: BannerAdSize;
};

const AppBanner = ({size = BannerAdSize.BANNER}: TAppBanner) => {
  const bannerRef = useRef<BannerAd>(null);

  useForeground(() => {
    if (Platform.OS === 'ios') {
      bannerRef.current?.load();
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      bannerRef.current?.load();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return <BannerAd ref={bannerRef} unitId={ADS.banner} size={size} />;
};

export default AppBanner;
