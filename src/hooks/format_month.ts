export const formatMonth = (value: number, t: any) => {
  const year = Math.floor(value / 12);
  const month = value % 12;
  if (month === 0) {
    return `${year} ${
      year <= 1 ? t('mortgageDetail.year') : t('mortgageDetail.years')
    }`;
  } else if (year === 0) {
    return `${month} ${
      month <= 1 ? t('mortgageDetail.month') : t('mortgageDetail.months')
    }`;
  } else {
    return `${year} ${
      year <= 1 ? t('mortgageDetail.year') : t('mortgageDetail.years')
    } ${month} ${
      month <= 1 ? t('mortgageDetail.month') : t('mortgageDetail.months')
    }`;
  }
};
