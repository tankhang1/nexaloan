const getScale = (v: number) => {
  if (v >= 1_000_000_000) return {scaled: v / 1_000_000_000, suffix: 'B'};
  if (v >= 1_000_000) return {scaled: v / 1_000_000, suffix: 'M'};
  if (v >= 1_000) return {scaled: v / 1_000, suffix: 'K'};
  return {scaled: v, suffix: ''};
};

export const formatNumber = (
  value: number,
  locale: string,
  isFormat?: boolean,
  currency?: string, // e.g. "USD", "VND", "EUR"
) => {
  const {scaled, suffix} = isFormat
    ? {scaled: value, suffix: ''}
    : getScale(value);

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  const formatted = formatter.format(scaled);

  if (!currency) return `${formatted}${suffix}`;

  // Detect if this locale places currency before or after the number.
  const sample = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(1);

  // If sample starts with currency symbol → prefix locale
  const prefixCurrency = /^[^\d\s]/.test(sample);

  const currencySymbol = sample.replace(/[\d\s.,]/g, '').trim() || currency;

  return prefixCurrency
    ? `${currencySymbol} ${formatted}${suffix}`
    : `${formatted}${suffix} ${currencySymbol}`;
};
