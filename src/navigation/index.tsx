import React from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TNavigation} from '../utils/types/navigation';
import MainScreen from '../screens/MainScreen';
import SettingScreen from '../screens/SettingScreen';
import LanguageScreen from '../screens/LanguageScreen';
import CurrencyScreen from '../screens/CurrencyScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MortgageLoanScreen from '../screens/MortgageLoanScreen';
import MortgageLoanResultScreen from '../screens/MortgageLoanResultScreen';
import MortgageLoanResultDetailScreen from '../screens/MortgageLoanResultDetailScreen';
import {initI18n} from '../languages';
import AboutUsScreen from '../screens/AboutUsScreen';
import TOUScreen from '../screens/TOUScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
const Stack = createNativeStackNavigator<TNavigation>();
export const navigationRef = createNavigationContainerRef<TNavigation>();
const AppNavigation = () => {
  initI18n();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
        <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
        <Stack.Screen name="CurrencyScreen" component={CurrencyScreen} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
        <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
        <Stack.Screen
          name="MortgageLoanScreen"
          component={MortgageLoanScreen}
        />
        <Stack.Screen
          name="MortgageLoanResultScreen"
          component={MortgageLoanResultScreen}
        />
        <Stack.Screen
          name="MortgageLoanResultDetailScreen"
          component={MortgageLoanResultDetailScreen}
        />
        <Stack.Screen name="TOUScreen" component={TOUScreen} />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
