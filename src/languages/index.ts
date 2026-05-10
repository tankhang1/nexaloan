import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import EN_LANGUGAE from './en/index.json';
import VI_LANGUGAE from './vi/index.json';
import DE_LANGUGAE from './de/index.json';
import DE_AT_LANGUGAE from './de-at/index.json';
import DE_CH_LANGUGAE from './de-ch/index.json';
import EN_PK_LANGUGAE from './en-pk/index.json';
import JA_LANGUGAE from './ja/index.json';
import KM_LANGUGAE from './km/index.json';
import KO_LANGUGAE from './ko/index.json';
import LO_LANGUGAE from './lo/index.json';
import PT_LANGUGAE from './pt/index.json';
import RO_LANGUGAE from './ro/index.json';
import TH_LANGUGAE from './th/index.json';
import TR_LANGUGAE from './tr/index.json';
import ZH_LANGUGAE from './zh/index.json';
import {store} from '../redux/store';
import {updateLanguage} from '../redux/slices/app_slices';
export type I18nLanguage = keyof typeof i18nLanguages;
export const i18nLanguages = {
  'en-US': 'English',
  'vi-VN': 'Vietnamese',
  'de-DE': 'German',
  'tr-TR': 'Turkish',
  'zh-HK': 'Chinese (Hong Kong)',
  'de-CH': 'German (Switzerland)',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'th-TH': 'Thai',
  'lo-LA': 'Lao',
  'km-KH': 'Khmer',
  'en-PK': 'English (Pakistan)',
  'ro-RO': 'Romanian',
  'pt-BR': 'Portuguese (Brazil)',
  'de-AT': 'German (Austria)',
};
export const i18nDefaultLang: any = 'en-US';
const getInitialLanguage = (): I18nLanguage => {
  const savedLanguage = store.getState().app.language as I18nLanguage;
  console.log(
    savedLanguage,
    savedLanguage && Object.keys(i18nLanguages)?.includes(savedLanguage),
  );
  if (savedLanguage && Object.keys(i18nLanguages)?.includes(savedLanguage)) {
    return savedLanguage;
  }

  store.dispatch(updateLanguage(i18nDefaultLang));

  return i18nDefaultLang;
};

//export const i18nDefaultLang: I18nLanguage = 'ko';
export const i18nResources = {
  'en-US': {
    common: EN_LANGUGAE,
  },
  'vi-VN': {
    common: VI_LANGUGAE,
  },
  'de-DE': {
    common: DE_LANGUGAE,
  },
  'tr-TR': {
    common: TR_LANGUGAE,
  },
  'zh-HK': {
    common: ZH_LANGUGAE,
  },
  'de-CH': {
    common: DE_CH_LANGUGAE,
  },
  'ja-JP': {
    common: JA_LANGUGAE,
  },
  'ko-KR': {
    common: KO_LANGUGAE,
  },
  'th-TH': {
    common: TH_LANGUGAE,
  },
  'lo-LA': {
    common: LO_LANGUGAE,
  },
  'km-KH': {
    common: KM_LANGUGAE,
  },
  'en-PK': {
    common: EN_PK_LANGUGAE,
  },
  'ro-RO': {
    common: RO_LANGUGAE,
  },
  'pt-BR': {
    common: PT_LANGUGAE,
  },
  'de-AT': {
    common: DE_AT_LANGUGAE,
  },
};

const i18nNamespaces = ['common'] as const;
export type I18nNamespace = (typeof i18nNamespaces)[number];
export const i18nDefaultNs: I18nNamespace = 'common';
export const initI18n = () => {
  const lng = getInitialLanguage(); // after Redux is ready

  i18next.use(initReactI18next).init({
    resources: i18nResources,
    lng,
    ns: i18nNamespaces,
    defaultNS: i18nDefaultNs,
    interpolation: {
      escapeValue: false,
    },
  });
};
export default i18next;
