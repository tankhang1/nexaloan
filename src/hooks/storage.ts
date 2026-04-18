import AsyncStorage from 'expo-sqlite/kv-store';
import type {Storage} from 'redux-persist';

export const reduxPersistStorage: Storage = {
  setItem: (key, value) => AsyncStorage.setItem(key, value).then(() => true),
  getItem: key => AsyncStorage.getItem(key),
  removeItem: key => AsyncStorage.removeItem(key),
};
