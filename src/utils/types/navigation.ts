export type TNavigation = {
  MainScreen: undefined;
  SettingScreen: undefined;
  LanguageScreen: undefined;
  CurrencyScreen: undefined;
  HistoryScreen: undefined;
  AboutUsScreen: undefined;
  CompareLoanScreen:
    | undefined
    | {
        prefill?: {
          loan_amount: number;
          duration: number;
          int_rate: number;
          type: number;
          currency: {
            code: string;
            symbol: string;
            locale: string;
          };
        };
      };
  TOUScreen: undefined;
  PrivacyPolicyScreen: undefined;
  MortgageLoanScreen: {
    label: string;
    recalculateLoanId?: string;
    recalculateSource?: {
      loan_amount: number;
      duration: number;
      int_rate: number;
      type: number;
    };
  };
  MortgageLoanResultScreen: {
    label: string;
    recalculateLoanId?: string;
    isRecalculate?: boolean;
  };
  MortgageLoanResultDetailScreen: {
    isHistory?: boolean;
    id?: string;
    label: string;
  };
};
