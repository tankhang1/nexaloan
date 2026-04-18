import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type TMortgageLoan = {
  id: string; // Add an ID to track each item uniquely
  loan_amount: number;
  duration: number;
  int_rate: number;
  type: number; // 0: Fixed Monthly Payment, 1: Fixed Principal Payment
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  date: Date;
};

//@ts-ignore no check
const initialState: TMortgageLoan = {};

export const mortgageLoanSlice = createSlice({
  name: 'mortgage-loan',
  initialState,
  reducers: {
    // CREATE
    addLoan: (state, action: PayloadAction<TMortgageLoan>) => {
      return action.payload;
    },

    updateLoan: (state, action: PayloadAction<TMortgageLoan>) => {
      return action.payload;
    },
  },
});

// Export actions
export const {addLoan, updateLoan} = mortgageLoanSlice.actions;

// Export reducer
export default mortgageLoanSlice.reducer;
