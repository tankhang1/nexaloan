import {combineReducers} from '@reduxjs/toolkit';
import MortgageLoanReducer from '../slices/mortgage_loan_slices';
import HistoryReducer from '../slices/history';
import AppReducer from '../slices/app_slices';
import {persistReducer} from 'redux-persist';
import {reduxPersistStorage} from '../../hooks/storage';
export const rootReducers = combineReducers({
  mortgage_loan: MortgageLoanReducer,
  history: HistoryReducer,
  app: AppReducer,
});

const persistConfig = {
  key: 'root',
  storage: reduxPersistStorage,
  blacklist: ['mortgage_loan'],
  whitelist: ['history', 'app'],
};

export const persistedReducer = persistReducer(persistConfig, rootReducers);
