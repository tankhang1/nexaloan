import {createSlice, PayloadAction} from '@reduxjs/toolkit';
export enum ELoan {
  MORTGAGE_LOAN,
  CAR_LOAN,
  PERSONAL_LOAN,
  BUSINESS_LOAN,
}
export type TPayment = {
  id: string;
  date: string;
  amount: number;
};

export type TLoan = {
  id: string; // Add an ID to track each item uniquely
  loan_amount: number;
  duration: number;
  int_rate: number;
  label: string;
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  type: ELoan;
  date: Date;
  paid_amount?: number;
  payments?: TPayment[];
};

const initialState: TLoan[] = [];

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // CREATE
    addLoan: (state, action: PayloadAction<TLoan>) => {
      state.push(action.payload);
    },

    // READ (typically done via selector, so not needed in slice)

    // UPDATE
    updateLoan: (state, action: PayloadAction<TLoan>) => {
      const index = state.findIndex(loan => loan.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    // DELETE
    deleteLoan: (state, action: PayloadAction<string>) => {
      return state.filter(loan => loan.id !== action.payload);
    },

    // Optional: RESET
    resetLoans: () => {
      return [];
    },
  },
});

// Export actions
export const {addLoan, updateLoan, deleteLoan, resetLoans} =
  historySlice.actions;

// Export reducer
export default historySlice.reducer;
