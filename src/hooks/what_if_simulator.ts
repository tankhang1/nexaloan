import {TMortgageLoan} from '../redux/slices/mortgage_loan_slices';

type TWhatIfResult = {
  newDurationMonths: number;
  newTotalPayment: number;
  newTotalInterest: number;
  interestSaved: number;
  monthsSaved: number;
};

const round = (value: number) => Number(value.toFixed(2));

export const simulateWithExtraPayment = (
  mortgage: TMortgageLoan,
  extraMonthlyPayment: number,
  baselineTotalInterest: number,
): TWhatIfResult | null => {
  if (!mortgage || mortgage.type !== 0) {
    return null;
  }

  const principal = mortgage.loan_amount;
  const totalMonths = mortgage.duration;
  const monthlyRate = mortgage.int_rate / 12 / 100;
  if (principal <= 0 || totalMonths <= 0 || extraMonthlyPayment < 0) {
    return null;
  }

  const baseMonthlyPayment =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const monthlyPayment = baseMonthlyPayment + extraMonthlyPayment;
  let remainingPrincipal = principal;
  let months = 0;
  let totalInterest = 0;
  let totalPayment = 0;

  while (remainingPrincipal > 0.01 && months < totalMonths * 2) {
    const interestPayment =
      monthlyRate === 0 ? 0 : remainingPrincipal * monthlyRate;
    const principalPayment = Math.max(monthlyPayment - interestPayment, 0);
    const cappedPrincipalPayment = Math.min(principalPayment, remainingPrincipal);
    const paidThisMonth = cappedPrincipalPayment + interestPayment;

    remainingPrincipal -= cappedPrincipalPayment;
    totalInterest += interestPayment;
    totalPayment += paidThisMonth;
    months += 1;

    if (principalPayment <= 0) {
      return null;
    }
  }

  const interestSaved = Math.max(baselineTotalInterest - totalInterest, 0);
  const monthsSaved = Math.max(totalMonths - months, 0);

  return {
    newDurationMonths: months,
    newTotalPayment: round(totalPayment),
    newTotalInterest: round(totalInterest),
    interestSaved: round(interestSaved),
    monthsSaved,
  };
};

