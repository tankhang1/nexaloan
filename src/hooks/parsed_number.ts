export const parseNumber = (formattedValue: string, locale: string): number => {
  if (!formattedValue) return 0;

  const localeDecimalMap: Record<string, {group: string; decimal: string}> = {
    'en-US': {group: ',', decimal: '.'},
    'vi-VN': {group: '.', decimal: ','},
    'de-DE': {group: '.', decimal: ','},
    'tr-TR': {group: '.', decimal: ','},
    'zh-HK': {group: ',', decimal: '.'},
    'de-CH': {group: "'", decimal: '.'},
    'ja-JP': {group: ',', decimal: '.'},
    'ro-RO': {group: '.', decimal: ','},
    'pt-BR': {group: '.', decimal: ','},
    'de-AT': {group: '.', decimal: ','},
  };

  const separators = localeDecimalMap[locale] || {group: ',', decimal: '.'};

  const suffix = formattedValue.trim().slice(-1).toUpperCase(); // 'M' or 'B'
  const hasSuffix = suffix === 'M' || suffix === 'B';

  const numericPart = hasSuffix
    ? formattedValue.slice(0, -1).trim()
    : formattedValue.trim();

  const raw = numericPart
    .replace(new RegExp(`\\${separators.group}`, 'g'), '') // remove thousand separators
    .replace(separators.decimal, '.'); // convert decimal separator

  let parsed = parseFloat(raw);
  if (isNaN(parsed)) return 0;

  if (suffix === 'M') parsed *= 1000000;
  if (suffix === 'B') parsed *= 1000000000;

  return parsed;
};
