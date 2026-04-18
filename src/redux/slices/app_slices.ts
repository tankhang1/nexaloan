import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type TApp = {
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  language: string;
};

const initialState: TApp = {
  currency: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
  },
  language: 'en-US',
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
  },
});

// Export actions
export const {updateCurrency, updateLanguage} = appSlice.actions;

// Export reducer
export default appSlice.reducer;
