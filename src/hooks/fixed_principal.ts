import {TMortgageLoan} from '../redux/slices/mortgage_loan_slices';

type MonthlyBreakdown = {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingPrincipal: number;
};

export type FixedPrincipalResult = {
  monthlyBreakdown: MonthlyBreakdown[];
  totalPayment: number;
  totalInterest: number;
  averageMonthlyPayment: number;
};

export const calculateFixedPrincipal = (
  mortgage: TMortgageLoan,
): FixedPrincipalResult => {
  const months = mortgage.duration;
  const monthlyPrincipal = mortgage.loan_amount / months;
  const monthlyInterestRate = mortgage.int_rate / 12 / 100;

  const monthlyBreakdown: MonthlyBreakdown[] = [];
  let totalInterest = 0;

  for (let i = 1; i <= months; i++) {
    const remainingPrincipal =
      mortgage.loan_amount - monthlyPrincipal * (i - 1);
    const interestPayment = remainingPrincipal * monthlyInterestRate;
    const totalPayment = monthlyPrincipal + interestPayment;

    totalInterest += interestPayment;

    monthlyBreakdown.push({
      month: i,
      principalPayment: parseFloat(monthlyPrincipal.toFixed(2)),
      interestPayment: parseFloat(interestPayment.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      remainingPrincipal: parseFloat(
        Math.max(remainingPrincipal - monthlyPrincipal, 0).toFixed(2),
      ),
    });
  }

  const totalPayment = monthlyBreakdown.reduce(
    (sum, item) => sum + item.totalPayment,
    0,
  );

  const averageMonthlyPayment = totalPayment / months;

  return {
    monthlyBreakdown,
    totalPayment: parseFloat(totalPayment.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    averageMonthlyPayment: parseFloat(averageMonthlyPayment.toFixed(2)),
  };
};
