export type TNavigation = {
  MainScreen: undefined;
  SettingScreen: undefined;
  LanguageScreen: undefined;
  CurrencyScreen: undefined;
  HistoryScreen: undefined;
  AboutUsScreen: undefined;
  TOUScreen: undefined;
  PrivacyPolicyScreen: undefined;
  MortgageLoanScreen: {label: string};
  MortgageLoanResultScreen: {label: string};
  MortgageLoanResultDetailScreen: {
    isHistory?: boolean;
    id?: string;
    label: string;
  };
};
