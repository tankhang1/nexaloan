import {TFunction} from 'i18next';

export const getFormulaSummary = (method: number, t: TFunction) => {
  if (method === 1) {
    return t('trust.formula.fixedPrincipal.summary');
  }

  if (method === 2) {
    return t('trust.formula.flatRate.summary');
  }

  return t('trust.formula.fixedPayment.summary');
};

export const getFormulaDetails = (method: number, t: TFunction) => {
  if (method === 1) {
    return t('trust.formula.fixedPrincipal.details');
  }

  if (method === 2) {
    return t('trust.formula.flatRate.details');
  }

  return t('trust.formula.fixedPayment.details');
};

