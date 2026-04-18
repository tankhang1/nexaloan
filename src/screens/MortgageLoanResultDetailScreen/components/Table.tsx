import {
  View,
  StyleSheet,
  ScrollView,
  ListRenderItemInfo,
  FlatList,
} from 'react-native';
import React, {useMemo} from 'react';
import {HEIGHT, WIDTH} from '../../../constants/dimension';
import {COLORS} from '../../../constants/colors';
import AppText from '../../../components/AppText';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {
  FixedPrincipalResult,
  MonthlyBreakdown,
} from '../../../hooks/fixed_monthly_payment';
import {useTranslation} from 'react-i18next';
import {TMortgageLoan} from '../../../redux/slices/mortgage_loan_slices';
import {formatNumber} from '../../../hooks/format_number';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type TTable = {
  result?: FixedPrincipalResult;
  mortgage?: TMortgageLoan;
  onScrollEnd?: () => void;
};
const Table = ({result, mortgage, onScrollEnd}: TTable) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {currency} = useSelector((state: RootState) => state.app);
  const TABLE = useMemo(
    () => [
      {
        id: 'month',
        label: t('mortgageDetail.table.month'),
        width: 60,
      },
      {
        id: 'principalPayment',
        label: t('mortgageDetail.table.principal'),
        width: (WIDTH - 36 - 60 - 4) / 2,
        format: (value: number) =>
          formatNumber(
            value,
            mortgage?.currency?.locale || currency.locale,
            true,
            mortgage?.currency?.code || currency.code,
          ),
      },
      {
        id: 'remainingPrincipal',
        label: t('mortgageDetail.table.endingBalance'),
        width: (WIDTH - 36 - 60 - 4) / 2,
        format: (value: number) =>
          formatNumber(
            value,
            mortgage?.currency?.locale || currency.locale,
            true,
            mortgage?.currency?.code || currency.code,
          ),
      },
    ],
    [currency, mortgage, t],
  );
  const renderItem = ({item, index}: ListRenderItemInfo<MonthlyBreakdown>) => {
    return (
      <View
        style={[styles.rows]}
        key={`${item.remainingPrincipal}-${item.interestPayment}-${item.month}-${item.principalPayment}-${index}`}>
        <View
          key={`month-${index}`}
          style={[
            styles.dataItem,
            styles.rightBorder,
            index % 2 === 0 && {backgroundColor: COLORS.foundation.blue.b50},
            {
              width: 60,
            },
          ]}>
          <AppText
            allowFontScaling={false}
            fontSize={16}
            fontWeight={700}
            color={COLORS.foundation.blue.b500}
            value={item['month'].toString()}
          />
        </View>
        <View>
          <View style={styles.rows}>
            <View
              key={`principalPayment-${index}`}
              style={[
                styles.dataItem,
                styles.rightBorder,
                styles.itemHeight,
                index % 2 === 0 && {
                  backgroundColor: COLORS.foundation.blue.b50,
                },
                {
                  width: (WIDTH - 36 - 60 - 4) / 2,
                },
              ]}>
              <AppText
                allowFontScaling={false}
                fontSize={12}
                fontWeight={500}
                color={COLORS.foundation.neutral.n700}
                value={formatNumber(
                  item['principalPayment'],
                  mortgage?.currency?.locale || currency.locale,
                  true,
                  mortgage?.currency?.code || currency.code,
                )}
              />
            </View>
            <View
              key={`remainingPrincipal-${index}`}
              style={[
                styles.dataItem,
                styles.itemHeight,
                index % 2 === 0 && {
                  backgroundColor: COLORS.foundation.blue.b50,
                },
                {
                  width: (WIDTH - 36 - 60 - 4) / 2,
                },
              ]}>
              <AppText
                allowFontScaling={false}
                fontSize={12}
                fontWeight={500}
                color={COLORS.foundation.neutral.n700}
                value={formatNumber(
                  item['remainingPrincipal'],
                  mortgage?.currency?.locale || currency.locale,
                  true,
                  mortgage?.currency?.code || currency.code,
                )}
              />
            </View>
          </View>
          <View style={styles.rows}>
            <View
              key={`interest-${index}`}
              style={[
                styles.dataItem,
                styles.itemHeight,
                index % 2 === 0 && {
                  backgroundColor: COLORS.foundation.blue.b50,
                },
                {
                  width: (WIDTH - 36 - 60 - 4) / 2,
                },
              ]}>
              <View style={[styles.center]}>
                <AppText
                  allowFontScaling={false}
                  fontSize={10}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  value={`${t('mortgageDetail.table.interest')}`}
                />
                <AppText
                  allowFontScaling={false}
                  fontSize={12}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n700}
                  value={formatNumber(
                    item['interestPayment'],
                    mortgage?.currency?.locale || currency.locale,
                    true,
                    mortgage?.currency?.code || currency.code,
                  )}
                />
              </View>
            </View>
            <View
              key={`monthlyPayment-${index}`}
              style={[
                styles.dataItem,
                styles.itemHeight,
                index % 2 === 0 && {
                  backgroundColor: COLORS.foundation.blue.b50,
                },
                {
                  width: (WIDTH - 36 - 60 - 4) / 2,
                },
              ]}>
              <View style={[styles.wrap, styles.center]}>
                <AppText
                  allowFontScaling={false}
                  fontSize={10}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n700}
                  value={`${t('mortgageDetail.table.monthlyPayment')}`}
                  textStyle={{textAlign: 'center'}}
                />
                <AppText
                  allowFontScaling={false}
                  fontSize={12}
                  fontWeight={500}
                  color={COLORS.foundation.neutral.n700}
                  value={formatNumber(
                    item['totalPayment'],
                    mortgage?.currency?.locale || currency.locale,
                    true,
                    mortgage?.currency?.code || currency.code,
                  )}
                  textStyle={{textAlign: 'center'}}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.overall}>
      <ScrollView
        nestedScrollEnabled
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.rows}>
            {TABLE.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.headerItem,
                  {width: item.width},
                  index === 0 && styles.leftRadius,
                  index === TABLE.length - 1 && styles.rightRadius,
                ]}>
                <AppText
                  value={item.label}
                  fontSize={12}
                  textStyle={{textAlign: 'center'}}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n0}
                />
              </View>
            ))}
          </View>
          <View
            style={{
              height: HEIGHT - insets.top - insets.bottom - 60 - 4 - 200,
            }}>
            <FlatList
              nestedScrollEnabled
              data={result?.monthlyBreakdown}
              renderItem={renderItem}
              keyExtractor={item => item.month.toString()}
              onScrollEndDrag={onScrollEnd}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Table;

const styles = StyleSheet.create({
  overall: {
    width: WIDTH - 36,
    borderRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    backgroundColor: COLORS.foundation.neutral.n900,
    overflow: 'hidden',
  },
  leftRadius: {
    borderTopLeftRadius: 20,
  },
  rightRadius: {
    borderTopRightRadius: 20,
  },
  rows: {
    flexDirection: 'row',
    gap: 0,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  headerItem: {
    backgroundColor: COLORS.foundation.blue.b300,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  dataItem: {
    backgroundColor: COLORS.foundation.neutral.n0,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.foundation.neutral.n100,
  },
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.foundation.neutral.n100,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.foundation.neutral.n100,
  },
  itemHeight: {
    height: 'auto',
    minHeight: 40,
    paddingVertical: 10,
  },
  center: {
    alignItems: 'center',
  },
});
