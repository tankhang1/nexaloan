import {TMortgageLoan} from '../redux/slices/mortgage_loan_slices';

export type MonthlyBreakdown = {
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

const round = (value: number, decimals = 2): number =>
  parseFloat(value.toFixed(decimals));

export const calculateFixedMonthlyPayment = (
  mortgage: TMortgageLoan,
): FixedPrincipalResult => {
  const totalMonths = mortgage.duration;
  const monthlyRate = mortgage.int_rate / 12 / 100;
  const principal = mortgage.loan_amount;

  // Annuity formula
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  let remainingPrincipal = principal;
  let totalInterest = 0;

  const monthlyBreakdown: MonthlyBreakdown[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingPrincipal -= principalPayment;

    monthlyBreakdown.push({
      month,
      principalPayment: round(principalPayment),
      interestPayment: round(interestPayment),
      totalPayment: round(monthlyPayment),
      remainingPrincipal: round(Math.max(remainingPrincipal, 0)),
    });

    totalInterest += interestPayment;
  }

  const totalPayment = monthlyPayment * totalMonths;
  const averageMonthlyPayment = monthlyPayment;

  return {
    monthlyBreakdown,
    totalPayment: round(totalPayment),
    totalInterest: round(totalInterest),
    averageMonthlyPayment: round(averageMonthlyPayment),
  };
};
export const calculateFixedPrincipalPayment = (
  mortgage: TMortgageLoan,
): FixedPrincipalResult => {
  const totalMonths = mortgage.duration;
  const monthlyRate = mortgage.int_rate / 12 / 100;
  const principal = mortgage.loan_amount;

  const fixedPrincipal = principal / totalMonths;
  let remainingPrincipal = principal;
  let totalInterest = 0;

  const monthlyBreakdown: MonthlyBreakdown[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const totalPayment = fixedPrincipal + interestPayment;
    remainingPrincipal -= fixedPrincipal;

    monthlyBreakdown.push({
      month,
      principalPayment: round(fixedPrincipal),
      interestPayment: round(interestPayment),
      totalPayment: round(totalPayment),
      remainingPrincipal: round(Math.max(remainingPrincipal, 0)),
    });

    totalInterest += interestPayment;
  }

  const totalPayment = principal + totalInterest;
  const averageMonthlyPayment = totalPayment / totalMonths;

  return {
    monthlyBreakdown,
    totalPayment: round(totalPayment),
    totalInterest: round(totalInterest),
    averageMonthlyPayment: round(averageMonthlyPayment),
  };
};
