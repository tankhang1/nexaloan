import {COLORS} from './colors';
import {ICONS} from './icon';

export const CURRENCIES = [
  {
    label: 'USD',
    symbol: '$',
    locale: 'en-US',
    icon: <ICONS.currency.usd color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'VND',
    symbol: 'đ',
    locale: 'vi-VN',
    icon: <ICONS.currency.vnd color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    icon: <ICONS.currency.eur color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    icon: <ICONS.currency.gbp color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'JPY',
    symbol: '¥',
    locale: 'ja-JP',
    icon: <ICONS.currency.jpy color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'KRW',
    symbol: '₩',
    locale: 'ko-KR',
    icon: <ICONS.currency.krw color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'PHP',
    symbol: '₱',
    locale: 'en-PH',
    icon: <ICONS.currency.php color={COLORS.foundation.neutral.n0} />,
  },
  {
    label: 'CHF',
    symbol: 'CHF',
    locale: 'de-CH',
    icon: <ICONS.currency.chf color={COLORS.foundation.neutral.n0} />,
  },
];
