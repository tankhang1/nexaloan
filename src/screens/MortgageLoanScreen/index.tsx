import {View, StyleSheet, ActivityIndicator} from 'react-native';
import React, {useState, useTransition} from 'react';
import AppView from '../../components/AppView';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import AppIconButton from '../../components/AppIconButton';
import {ICONS} from '../../constants/icon';
import AppSlider from '../../components/AppSlider';
import AppIndicator from '../../components/AppIndicator';
import {WIDTH} from '../../constants/dimension';
import {navigationRef} from '../../navigation';
import {useDispatch, useSelector} from 'react-redux';
import {addLoan} from '../../redux/slices/mortgage_loan_slices';
import {uuid} from '../../hooks/uuid';
import {RootState} from '../../redux/store';
import AppInput from '../../components/AppInput';
import {useTranslation} from 'react-i18next';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TNavigation} from '../../utils/types/navigation';
type Props = NativeStackScreenProps<TNavigation, 'MortgageLoanScreen'>;
const MortgageLoanScreen = ({route}: Props) => {
  const {t} = useTranslation();
  const [isPending, startTransition] = useTransition();

  const {currency} = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();

  const [loanAmount, setLoanAmount] = useState<string | number>(4000);
  const [month, setMonth] = useState(1);
  const [type, setType] = useState(0);
  const [rate, setRate] = useState<string | number>(1);
  const onNavSetting = () => {
    navigationRef.navigate('SettingScreen');
  };
  const onNavMortgageLoanResult = () => {
    startTransition(() => {
      const id = uuid();
      dispatch(
        addLoan({
          id: id,
          duration: month,
          int_rate: +rate,
          loan_amount: +loanAmount,
          date: new Date(),
          currency,
          type,
        }),
      );
      navigationRef.navigate('MortgageLoanResultScreen', {
        label: route.params.label,
      });
    });
  };
  const onGoBack = () => {
    navigationRef.goBack();
  };
  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <ICONS.button.chervon_left />
        </AppIconButton>
        <AppText
          value={route.params.label || t('mortgage.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
        <AppIconButton onPress={onNavSetting}>
          <ICONS.button.setting />
        </AppIconButton>
      </View>
      <View style={styles.body_container}>
        <View style={styles.gap40}>
          <View style={[styles.center, styles.gap8]}>
            <View style={[styles.rows, styles.gap8]}>
              <AppText
                fontSize={14}
                fontWeight={500}
                value={t('mortgage.loanAmount')}
                color={COLORS.foundation.neutral.n200}
              />
              {/* <ICONS.info /> */}
            </View>
            <AppInput
              onChangeText={value => {
                const numericValue = value.replace(/[^0-9]/g, ''); // Keep only digits
                if (!isNaN(+numericValue)) {
                  setLoanAmount(numericValue);
                }
              }}
              keyboardType="numbers-and-punctuation"
              fontSize={40}
              fontWeight={500}
              value={new Intl.NumberFormat(currency.locale).format(+loanAmount)}
              color={COLORS.foundation.neutral.n700}
              textStyle={{width: '100%', textAlign: 'center'}}
            />
            <AppSlider
              prefix={true}
              minValue={4000}
              maxValue={2000000000}
              curValue={+loanAmount}
              setCurValue={setLoanAmount}
            />
          </View>
          <View style={styles.gap8}>
            <View style={styles.rows_between}>
              <View style={[styles.rows_left, styles.gap8]}>
                <AppText
                  fontSize={14}
                  fontWeight={500}
                  value={t('mortgage.duration')}
                  color={COLORS.foundation.neutral.n200}
                />
                {/* <ICONS.info /> */}
              </View>
              <AppInput
                keyboardType="numbers-and-punctuation"
                onChangeText={value => {
                  const numericValue = value.replace(/[^0-9]/g, ''); // Keep only digits
                  if (!isNaN(+numericValue)) {
                    setMonth(+numericValue);
                  }
                }}
                value={month.toString()}
                fontSize={16}
                fontWeight={600}
                color={COLORS.foundation.neutral.n700}
                textStyle={styles.inputBox}
              />
            </View>
            <AppSlider
              minValue={1}
              maxValue={200}
              curValue={month}
              setCurValue={setMonth}
              prefix={false}
            />
          </View>
          <View style={styles.gap8}>
            <View style={styles.rows_between}>
              <View style={[styles.rows_left, styles.gap8]}>
                <AppText
                  fontSize={14}
                  fontWeight={500}
                  value={t('mortgage.interestRate')}
                  color={COLORS.foundation.neutral.n200}
                />
                {/* <ICONS.info /> */}
              </View>
              <AppInput
                fontSize={16}
                fontWeight={600}
                value={rate.toString()}
                keyboardType="numbers-and-punctuation"
                onChangeText={value => {
                  const numericValue = value.replace(/[^0-9.]/g, '');
                  if (!isNaN(+numericValue)) {
                    setRate(numericValue);
                  }
                }}
                textStyle={styles.rateInputBox}
                color={COLORS.foundation.neutral.n700}
              />
            </View>
            <AppSlider
              minValue={1}
              maxValue={20}
              curValue={+rate}
              isFloat={true}
              setCurValue={setRate}
              prefix={false}
            />
          </View>
        </View>
        <View style={styles.gap14}>
          <AppIndicator
            tabs={[
              {
                id: 0,
                children: t('mortgage.fixedPayment'),
                isLeftBorder: true,
                tabWidth: (WIDTH - 36) * 0.45,
              },

              {
                id: 1,
                children: t('mortgage.fixedPrincipal'),
                isRightBorder: true,
                tabWidth: (WIDTH - 36) * 0.55,
              },
            ]}
            activeKey={type}
            onPress={setType}
            isEqual={false}
          />
          <AppIconButton
            style={{width: WIDTH - 36}}
            onPress={onNavMortgageLoanResult}>
            <View style={[styles.rows, styles.gap8]}>
              {isPending && <ActivityIndicator />}
              {!isPending && <ICONS.calculator />}
              {!isPending && (
                <AppText
                  color="#090A0B"
                  fontWeight={600}
                  fontSize={14}
                  value={t('mortgage.calculate')}
                />
              )}
            </View>
          </AppIconButton>
        </View>
      </View>
    </AppView>
  );
};

export default MortgageLoanScreen;
const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 15,
    gap: 16,
    width: '100%',
  },
  header: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rows: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  rows_between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rows_left: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  gap8: {gap: 8},
  gap14: {gap: 14},
  gap40: {gap: 40},
  textCenter: {
    textAlign: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  body_container: {justifyContent: 'space-between', flex: 1},
  inputBox: {
    width: 70,
    textAlign: 'center',
  },
  rateInputBox: {
    width: 92,
    textAlign: 'center',
  },
});
