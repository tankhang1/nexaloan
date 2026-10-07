import {View, StyleSheet} from 'react-native';
import React, {useMemo} from 'react';
import {TMortgageLoan} from '../../../redux/slices/mortgage_loan_slices';
import {
  calculateFixedMonthlyPayment,
  calculateFlatRatePayment,
} from '../../../hooks/fixed_monthly_payment';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import Animated, {LinearTransition} from 'react-native-reanimated';
import {calculateFixedPrincipal} from '../../../hooks/fixed_principal';
import AppBanner from '../../../components/AppBanner';
import AppLoanSummary from '../../../components/AppLoanSummary';

type TResult = {
  mortgage?: TMortgageLoan;
  label: string;
};
const Result = ({mortgage, label}: TResult) => {
  const {currency} = useSelector((state: RootState) => state.app);
  const result = useMemo(
    () =>
      mortgage?.type === 1
        ? calculateFixedPrincipal(mortgage!)
        : mortgage?.type === 2
        ? calculateFlatRatePayment(mortgage!)
        : calculateFixedMonthlyPayment(mortgage!),
    [mortgage],
  );

  return (
    <Animated.View layout={LinearTransition}>
      <AppLoanSummary
        label={label}
        loanAmount={mortgage?.loan_amount || 0}
        duration={mortgage?.duration || 0}
        interestRate={mortgage?.int_rate || 0}
        averageMonthlyPayment={result.averageMonthlyPayment}
        totalInterest={result.totalInterest}
        totalPayment={result.totalPayment}
        locale={currency.locale}
        currencyCode={currency.code}
      />
      <View style={styles.banner}>
        <AppBanner />
      </View>
    </Animated.View>
  );
};

export default Result;

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    marginTop: 14,
  },
});
