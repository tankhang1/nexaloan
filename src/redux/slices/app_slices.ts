import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type TApp = {
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  language: string;
  hasInitializedCurrency: boolean;
};

const initialState: TApp = {
  currency: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
  },
  language: '',
  hasInitializedCurrency: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // CREATE
    updateCurrency: (
      state,
      action: PayloadAction<{
        code: string;
        symbol: string;
        locale: string;
      }>,
    ) => {
      state.currency = action.payload;
    },
    updateLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    markCurrencyInitialized: (state) => {
      state.hasInitializedCurrency = true;
    },
  },
});

// Export actions
export const {updateCurrency, updateLanguage, markCurrencyInitialized} =
  appSlice.actions;

// Export reducer
export default appSlice.reducer;
