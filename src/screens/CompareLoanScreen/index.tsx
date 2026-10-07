import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Feather} from '@expo/vector-icons';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import AppTrustNotice from '../../components/AppTrustNotice';
import {TNavigation} from '../../utils/types/navigation';
import {FINANCE_IMAGES} from '../../assets';

type Props = NativeStackScreenProps<TNavigation, 'CompareLoanScreen'>;

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

const CompareLoanScreen = ({route}: Props) => {
  const {t} = useTranslation();
  const {currency} = useSelector((state: RootState) => state.app);
  const [method, setMethod] = useState(0);
  const [optionA, setOptionA] = useState<TLoanOption>(defaultOptionA);
  const [optionB, setOptionB] = useState<TLoanOption>(defaultOptionB);

  useEffect(() => {
    const prefill = route.params?.prefill;
    if (!prefill) {
      return;
    }

    const nextMethod = Number.isFinite(prefill.type) ? prefill.type : 0;
    const nextDuration = Math.max(1, Math.floor(prefill.duration || 1));
    const nextRate = Math.max(0, prefill.int_rate || 0);
    const suggestedDuration = Math.min(nextDuration + 12, MAX_DURATION_MONTHS);
    const suggestedRate = Math.max(
      0,
      nextMethod === 2 ? nextRate - 0.2 : nextRate - 0.5,
    );

    setMethod(nextMethod);
    setOptionA({
      loanAmount: `${Math.max(1, Math.floor(prefill.loan_amount || 1))}`,
      duration: `${nextDuration}`,
      interestRate: `${nextRate}`,
    });
    setOptionB({
      loanAmount: `${Math.max(1, Math.floor(prefill.loan_amount || 1))}`,
      duration: `${suggestedDuration}`,
      interestRate: `${suggestedRate}`,
    });
  }, [route.params?.prefill]);

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

  const renderInputRow = (
    label: string,
    field: keyof TLoanOption,
    keyboardType: 'number-pad' | 'decimal-pad',
  ) => (
    <View style={styles.inputRow}>
      <AppText
        value={label}
        fontSize={12}
        fontWeight={600}
        color={COLORS.foundation.neutral.n500}
        numberOfLines={1}
      />
      <View style={styles.inputPair}>
        {(['a', 'b'] as const).map(optionKey => {
          const option = optionKey === 'a' ? optionA : optionB;
          return (
            <AppInput
              key={optionKey}
              value={
                field === 'loanAmount'
                  ? formatInputAmount(option.loanAmount)
                  : option[field]
              }
              onChangeText={value => updateOption(optionKey, field, value)}
              keyboardType={keyboardType}
              color={COLORS.foundation.neutral.n700}
              fontSize={15}
              fontWeight={700}
              placeholder="0"
              placeholderTextColor={COLORS.foundation.neutral.n200}
              textStyle={[
                styles.input,
                optionKey === 'a' ? styles.inputA : styles.inputB,
              ]}
            />
          );
        })}
      </View>
    </View>
  );

  const [resultA, resultB] = results;
  const metricRows: {label: string; key: keyof FixedPrincipalResult}[] = [
    {
      label:
        method === 1
          ? t('compareLoan.averageMonthlyPayment')
          : t('compareLoan.monthlyPayment'),
      key: 'averageMonthlyPayment',
    },
    {label: t('compareLoan.totalInterest'), key: 'totalInterest'},
    {label: t('compareLoan.totalPayment'), key: 'totalPayment'},
  ];

  const renderMetricValue = (
    value: number | undefined,
    other: number | undefined,
  ) => {
    // Lower is better for every metric shown here.
    const isBetter =
      value !== undefined && other !== undefined && value < other;
    return (
      <View style={[styles.metricCell, isBetter && styles.metricCellBest]}>
        <AppText
          value={value !== undefined ? formatCurrency(value) : '--'}
          fontSize={13}
          fontWeight={700}
          color={
            isBetter
              ? COLORS.foundation.gold.g300
              : COLORS.foundation.neutral.n0
          }
          numberOfLines={1}
          adjustsFontSizeToFit
        />
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
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        {/* Verdict: updates live while typing */}
        <ImageBackground
          source={FINANCE_IMAGES.cityBackground}
          resizeMode="cover"
          style={styles.verdictCard}
          imageStyle={styles.verdictImage}>
          <View pointerEvents="none" style={styles.verdictOverlay} />
          <View style={styles.verdictTop}>
            <View style={styles.flex}>
              <AppText
                value={t('compareLoan.results')}
                fontSize={12}
                fontWeight={600}
                color={COLORS.foundation.gold.g300}
              />
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
                fontSize={18}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
                lineHeight={24}
              />
            </View>
            <Image
              source={FINANCE_IMAGES.chart}
              resizeMode="contain"
              style={styles.verdictArt}
            />
          </View>

          <View style={styles.metricTable}>
            <View style={styles.metricHeaderRow}>
              <View style={styles.metricLabelCol} />
              {[resultA, resultB].map((item, index) => (
                <View key={item.label} style={styles.metricCell}>
                  <View
                    style={[
                      styles.optionTag,
                      index === 0 ? styles.optionTagA : styles.optionTagB,
                    ]}>
                    <AppText
                      value={index === 0 ? 'A' : 'B'}
                      fontSize={12}
                      fontWeight={700}
                      color={
                        index === 0
                          ? COLORS.foundation.neutral.n0
                          : COLORS.foundation.blue.b500
                      }
                    />
                  </View>
                  {comparison.bestLabel === item.label && (
                    <Feather
                      name="award"
                      size={14}
                      color={COLORS.foundation.gold.g300}
                    />
                  )}
                </View>
              ))}
            </View>
            {metricRows.map(row => (
              <View key={row.key} style={styles.metricRow}>
                <AppText
                  value={row.label}
                  fontSize={11}
                  fontWeight={500}
                  color="rgba(255,255,255,0.75)"
                  numberOfLines={2}
                  textStyle={styles.metricLabelCol}
                />
                {renderMetricValue(
                  resultA.result?.[row.key] as number | undefined,
                  resultB.result?.[row.key] as number | undefined,
                )}
                {renderMetricValue(
                  resultB.result?.[row.key] as number | undefined,
                  resultA.result?.[row.key] as number | undefined,
                )}
              </View>
            ))}
          </View>
        </ImageBackground>

        <AppIndicator
          tabs={[
            {
              id: 0,
              children: t('mortgage.fixedPayment'),
              tabWidth: (WIDTH - 32) * 0.33,
              isLeftBorder: true,
            },
            {
              id: 1,
              children: t('mortgage.fixedPrincipal'),
              tabWidth: (WIDTH - 32) * 0.34,
            },
            {
              id: 2,
              children: t('mortgage.flatRate'),
              tabWidth: (WIDTH - 32) * 0.33,
              isRightBorder: true,
            },
          ]}
          activeKey={method}
          onPress={setMethod}
          isEqual={false}
        />

        {/* Inputs: A and B side by side */}
        <View style={styles.inputCard}>
          <View style={styles.inputPair}>
            <View style={[styles.columnHeader, styles.columnHeaderA]}>
              <AppText
                value={t('compareLoan.optionA')}
                fontSize={13}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
                numberOfLines={1}
              />
            </View>
            <View style={[styles.columnHeader, styles.columnHeaderB]}>
              <AppText
                value={t('compareLoan.optionB')}
                fontSize={13}
                fontWeight={700}
                color={COLORS.foundation.blue.b500}
                numberOfLines={1}
              />
            </View>
          </View>
          {renderInputRow(t('compareLoan.loanAmount'), 'loanAmount', 'number-pad')}
          {renderInputRow(t('compareLoan.duration'), 'duration', 'number-pad')}
          {renderInputRow(
            method === 2
              ? t('compareLoan.monthlyInterestRate')
              : t('compareLoan.yearlyInterestRate'),
            'interestRate',
            'decimal-pad',
          )}
        </View>

        <AppTrustNotice
          summary={t('trust.compare.context')}
          details={t('trust.disclaimer.short')}
          expandLabel={t('trust.actions.readDisclaimer')}
          collapseLabel={t('trust.actions.hideDisclaimer')}
        />
      </ScrollView>
    </AppView>
  );
};

export default CompareLoanScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
    width: '100%',
  },
  header: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 44,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 32,
  },
  verdictCard: {
    borderRadius: 26,
    padding: 18,
    gap: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.foundation.blue.b500,
  },
  verdictImage: {
    borderRadius: 26,
  },
  verdictOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 30, 60, 0.4)',
  },
  verdictTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verdictArt: {
    width: 72,
    height: 64,
  },
  metricTable: {
    borderRadius: 16,
    padding: 10,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(226,194,117,0.3)',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
  },
  metricLabelCol: {
    width: 84,
  },
  metricCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  metricCellBest: {
    backgroundColor: 'rgba(226,194,117,0.14)',
  },
  optionTag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTagA: {
    backgroundColor: COLORS.foundation.blue.b300,
  },
  optionTagB: {
    backgroundColor: COLORS.foundation.gold.g300,
  },
  inputCard: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 14,
    gap: 14,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  columnHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  columnHeaderA: {
    backgroundColor: COLORS.foundation.blue.b300,
  },
  columnHeaderB: {
    backgroundColor: COLORS.foundation.gold.g300,
  },
  inputRow: {
    gap: 6,
  },
  inputPair: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  inputA: {
    borderColor: COLORS.foundation.blue.b100,
    backgroundColor: COLORS.foundation.blue.b50,
  },
  inputB: {
    borderColor: COLORS.foundation.gold.g300,
    backgroundColor: COLORS.foundation.gold.g100,
  },
});
