import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import AppIconButton from '../../components/AppIconButton';
import AppIndicator from '../../components/AppIndicator';
import AppInput from '../../components/AppInput';
import AppText from '../../components/AppText';
import AppView from '../../components/AppView';
import {COLORS} from '../../constants/colors';
import {WIDTH} from '../../constants/dimension';
import {ICONS} from '../../constants/icon';
import {formatNumber} from '../../hooks/format_number';
import {
  calculateFixedMonthlyPayment,
  calculateFixedPrincipalPayment,
  calculateFlatRatePayment,
  FixedPrincipalResult,
} from '../../hooks/fixed_monthly_payment';
import {navigationRef} from '../../navigation';
import {RootState} from '../../redux/store';
import {useTranslation} from 'react-i18next';

type TLoanOption = {
  loanAmount: string;
  duration: string;
  interestRate: string;
};

type TCompareResult = {
  label: string;
  result: FixedPrincipalResult | null;
};

const defaultOptionA: TLoanOption = {
  loanAmount: '100000',
  duration: '60',
  interestRate: '5',
};

const defaultOptionB: TLoanOption = {
  loanAmount: '100000',
  duration: '48',
  interestRate: '6',
};

const MAX_LOAN_AMOUNT = 1_000_000_000_000;
const MAX_DURATION_MONTHS = 600;
const MAX_YEARLY_RATE = 100;
const MAX_MONTHLY_RATE = 20;

const sanitizeInteger = (value: string) => value.replace(/[^0-9]/g, '');

const sanitizeDecimal = (value: string) => {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  const [firstPart, ...restParts] = cleanValue.split('.');

  if (restParts.length === 0) {
    return firstPart;
  }

  return `${firstPart}.${restParts.join('')}`;
};

const isValidNumberInRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

const CompareLoanScreen = () => {
  const {t} = useTranslation();
  const {currency} = useSelector((state: RootState) => state.app);
  const [method, setMethod] = useState(0);
  const [optionA, setOptionA] = useState<TLoanOption>(defaultOptionA);
  const [optionB, setOptionB] = useState<TLoanOption>(defaultOptionB);

  const formatCurrency = (value: number) =>
    formatNumber(value, currency.locale, true, currency.code);

  const formatInputAmount = (value: string) => {
    if (!value) {
      return '';
    }

    return new Intl.NumberFormat(currency.locale).format(Number(value));
  };

  const calculateOption = useCallback(
    (option: TLoanOption): FixedPrincipalResult | null => {
      const loanAmount = Number(option.loanAmount);
      const duration = Number(option.duration);
      const interestRate = Number(option.interestRate);
      const maxInterestRate =
        method === 2 ? MAX_MONTHLY_RATE : MAX_YEARLY_RATE;

      if (
        !isValidNumberInRange(loanAmount, 1, MAX_LOAN_AMOUNT) ||
        !isValidNumberInRange(duration, 1, MAX_DURATION_MONTHS) ||
        !isValidNumberInRange(interestRate, 0, maxInterestRate)
      ) {
        return null;
      }

      const loan = {
        id: '',
        loan_amount: loanAmount,
        duration: Math.floor(duration),
        int_rate: interestRate,
        type: method,
        currency,
        date: new Date(),
      };

      if (method === 1) {
        return calculateFixedPrincipalPayment(loan);
      }

      if (method === 2) {
        return calculateFlatRatePayment(loan);
      }

      return calculateFixedMonthlyPayment(loan);
    },
    [currency, method],
  );

  const results = useMemo<TCompareResult[]>(
    () => [
      {
        label: t('compareLoan.optionA'),
        result: calculateOption(optionA),
      },
      {
        label: t('compareLoan.optionB'),
        result: calculateOption(optionB),
      },
    ],
    [calculateOption, optionA, optionB, t],
  );

  const comparison = useMemo(() => {
    const [firstResult, secondResult] = results;

    if (!firstResult.result || !secondResult.result) {
      return {
        bestLabel: '',
        diff: 0,
        isTie: false,
      };
    }

    const diff =
      firstResult.result.totalPayment - secondResult.result.totalPayment;

    if (diff === 0) {
      return {
        bestLabel: '',
        diff: 0,
        isTie: true,
      };
    }

    return {
      bestLabel: diff < 0 ? firstResult.label : secondResult.label,
      diff: Math.abs(diff),
      isTie: false,
    };
  }, [results]);

  const updateOption = (
    optionKey: 'a' | 'b',
    field: keyof TLoanOption,
    value: string,
  ) => {
    const sanitizedValue =
      field === 'interestRate' ? sanitizeDecimal(value) : sanitizeInteger(value);
    const setOption = optionKey === 'a' ? setOptionA : setOptionB;

    setOption(currentOption => ({
      ...currentOption,
      [field]: sanitizedValue,
    }));
  };

  const renderOptionForm = (
    optionKey: 'a' | 'b',
    label: string,
    option: TLoanOption,
  ) => (
    <View style={styles.optionCard}>
      <AppText
        value={label}
        fontSize={18}
        fontWeight={700}
        color={COLORS.foundation.neutral.n700}
      />
      <View style={styles.inputGroup}>
        <AppText
          value={t('compareLoan.loanAmount')}
          fontSize={13}
          fontWeight={500}
          color={COLORS.foundation.neutral.n500}
        />
        <AppInput
          value={formatInputAmount(option.loanAmount)}
          onChangeText={value => updateOption(optionKey, 'loanAmount', value)}
          keyboardType="number-pad"
          color={COLORS.foundation.neutral.n700}
          fontSize={16}
          fontWeight={600}
          placeholder="0"
          placeholderTextColor={COLORS.foundation.neutral.n200}
        />
      </View>
      <View style={styles.inlineInputs}>
        <View style={styles.inlineInput}>
          <AppText
            value={t('compareLoan.duration')}
            fontSize={13}
            fontWeight={500}
            color={COLORS.foundation.neutral.n500}
          />
          <AppInput
            value={option.duration}
            onChangeText={value => updateOption(optionKey, 'duration', value)}
            keyboardType="number-pad"
            color={COLORS.foundation.neutral.n700}
            fontSize={16}
            fontWeight={600}
            placeholder="0"
            placeholderTextColor={COLORS.foundation.neutral.n200}
          />
        </View>
        <View style={styles.inlineInput}>
          <AppText
            value={
              method === 2
                ? t('compareLoan.monthlyInterestRate')
                : t('compareLoan.yearlyInterestRate')
            }
            fontSize={13}
            fontWeight={500}
            color={COLORS.foundation.neutral.n500}
          />
          <AppInput
            value={option.interestRate}
            onChangeText={value =>
              updateOption(optionKey, 'interestRate', value)
            }
            keyboardType="numbers-and-punctuation"
            color={COLORS.foundation.neutral.n700}
            fontSize={16}
            fontWeight={600}
            placeholder="0"
            placeholderTextColor={COLORS.foundation.neutral.n200}
          />
        </View>
      </View>
    </View>
  );

  const renderResultCard = ({label, result}: TCompareResult) => {
    const isBest =
      !!result && !!comparison.bestLabel && comparison.bestLabel === label;

    return (
      <View style={[styles.resultCard, isBest && styles.bestResultCard]}>
        <View style={styles.resultHeader}>
          <AppText
            value={label}
            fontSize={17}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
          {isBest && (
            <View style={styles.bestBadge}>
              <AppText
                value={t('compareLoan.betterChoice')}
                fontSize={11}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
              />
            </View>
          )}
        </View>
        {!result ? (
          <AppText
            value={t('compareLoan.enterValidValues')}
            fontSize={13}
            fontWeight={400}
            color={COLORS.foundation.neutral.n500}
          />
        ) : (
          <>
            <View style={styles.resultRow}>
              <AppText
                value={
                  method === 1
                    ? t('compareLoan.averageMonthlyPayment')
                    : t('compareLoan.monthlyPayment')
                }
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
              />
              <AppText
                value={formatCurrency(result.averageMonthlyPayment)}
                fontSize={15}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
              />
            </View>
            <View style={styles.resultRow}>
              <AppText
                value={t('compareLoan.totalPayment')}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
              />
              <AppText
                value={formatCurrency(result.totalPayment)}
                fontSize={15}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
              />
            </View>
            <View style={styles.resultRow}>
              <AppText
                value={t('compareLoan.totalInterest')}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
              />
              <AppText
                value={formatCurrency(result.totalInterest)}
                fontSize={15}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
              />
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={() => navigationRef.goBack()}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={t('compareLoan.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <AppText
            value={t('compareLoan.title')}
            fontSize={28}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
          <AppText
            value={t('compareLoan.desc')}
            fontSize={14}
            fontWeight={400}
            color={COLORS.foundation.neutral.n500}
            textStyle={styles.heroDesc}
          />
        </View>

        <AppIndicator
          tabs={[
            {
              id: 0,
              children: t('mortgage.fixedPayment'),
              tabWidth: (WIDTH - 36) * 0.33,
              isLeftBorder: true,
            },
            {
              id: 1,
              children: t('mortgage.fixedPrincipal'),
              tabWidth: (WIDTH - 36) * 0.34,
            },
            {
              id: 2,
              children: t('mortgage.flatRate'),
              tabWidth: (WIDTH - 36) * 0.33,
              isRightBorder: true,
            },
          ]}
          activeKey={method}
          onPress={setMethod}
          isEqual={false}
        />

        {renderOptionForm('a', t('compareLoan.optionA'), optionA)}
        {renderOptionForm('b', t('compareLoan.optionB'), optionB)}

        <View style={styles.resultsSection}>
          <AppText
            value={t('compareLoan.results')}
            fontSize={20}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
          {results.map(renderResultCard)}
          <View style={styles.summaryCard}>
            <AppText
              value={
                comparison.isTie
                  ? t('compareLoan.sameCost')
                  : comparison.bestLabel
                  ? t('compareLoan.bestOption', {
                      option: comparison.bestLabel,
                      amount: formatCurrency(comparison.diff),
                    })
                  : t('compareLoan.enterValidValues')
              }
              fontSize={14}
              fontWeight={600}
              color={COLORS.foundation.neutral.n700}
              textStyle={styles.summaryText}
            />
          </View>
        </View>
      </ScrollView>
    </AppView>
  );
};

export default CompareLoanScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
    width: '100%',
  },
  header: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 55,
    height: 48,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: COLORS.foundation.blue.b50,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.foundation.blue.b75,
    gap: 8,
  },
  heroDesc: {
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  inputGroup: {
    gap: 8,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineInput: {
    flex: 1,
    gap: 8,
  },
  resultsSection: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  bestResultCard: {
    backgroundColor: COLORS.foundation.blue.b50,
    borderColor: COLORS.foundation.blue.b200,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bestBadge: {
    backgroundColor: COLORS.foundation.blue.b300,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    borderRadius: 18,
    padding: 16,
  },
  summaryText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
