import {View, StyleSheet, ScrollView, Pressable, Alert} from 'react-native';
import React, {useMemo, useState} from 'react';
import {COLORS} from '../../constants/colors';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {navigationRef} from '../../navigation';
import AppText from '../../components/AppText';
import {WIDTH} from '../../constants/dimension';
import Card from './components/Card';
import AppIndicator from '../../components/AppIndicator';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/store';
import dayjs from 'dayjs';
import {ELoan, TLoan, deleteLoan, resetLoans} from '../../redux/slices/history';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import {formatNumber} from '../../hooks/format_number';
import {formatMonth} from '../../hooks/format_month';
import AppBanner from '../../components/AppBanner';
import {BannerAdSize} from 'react-native-google-mobile-ads';
import {Feather, Ionicons, FontAwesome6} from '@expo/vector-icons';
import AppInput from '../../components/AppInput';

type THistoryFilterState = {
  loanType: number;
  amountMin: string;
  amountMax: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: number;
};

const HistoryScreen = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState<THistoryFilterState>({
    loanType: 0,
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
    sortOrder: 0,
  });

  const history = useSelector((state: RootState) => state.history);

  const listHistory = useMemo(() => {
    const minAmount = Number(filters.amountMin || 0);
    const maxAmount = Number(filters.amountMax || Number.MAX_SAFE_INTEGER);
    const fromDate = filters.dateFrom ? dayjs(filters.dateFrom) : null;
    const toDate = filters.dateTo ? dayjs(filters.dateTo).endOf('day') : null;

    let next = [...history];

    if (filters.loanType !== 0) {
      const mapType: Record<number, ELoan> = {
        1: ELoan.MORTGAGE_LOAN,
        2: ELoan.PERSONAL_LOAN,
        3: ELoan.BUSINESS_LOAN,
        4: ELoan.CAR_LOAN,
      };
      next = next.filter(item => item.type === mapType[filters.loanType]);
    }

    next = next.filter(item => item.loan_amount >= minAmount && item.loan_amount <= maxAmount);

    if (fromDate?.isValid()) {
      next = next.filter(item => dayjs(item.date).isAfter(fromDate.subtract(1, 'day')));
    }

    if (toDate?.isValid()) {
      next = next.filter(item => dayjs(item.date).isBefore(toDate.add(1, 'millisecond')));
    }

    return filters.sortOrder === 1 ? next : next.reverse();
  }, [filters, history]);

  const onGoBack = () => {
    navigationRef.goBack();
  };

  const onNavMortgageDetailScreen = (mortgage: TLoan) => {
    navigationRef.navigate('MortgageLoanResultDetailScreen', {
      id: mortgage.id,
      isHistory: true,
      label: mortgage.label,
    });
  };

  const onRecalculate = (mortgage: TLoan) => {
    navigationRef.navigate('MortgageLoanScreen', {
      label: mortgage.label,
      recalculateLoanId: mortgage.id,
      recalculateSource: {
        loan_amount: mortgage.loan_amount,
        duration: mortgage.duration,
        int_rate: mortgage.int_rate,
        type: mortgage.type,
      },
    });
  };

  const onDeleteHistoryItem = (id: string, closeSwipe: () => void) => {
    Alert.alert(
      t('history.tabs.deleteConfirmTitle'),
      t('history.tabs.deleteConfirmDesc'),
      [
        {
          text: t('main.cancel'),
          style: 'cancel',
          onPress: closeSwipe,
        },
        {
          text: t('history.tabs.deleteAction'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteLoan(id));
            Toast.show({type: 'success', text1: t('history.tabs.deleteSuccess')});
          },
        },
      ],
    );
  };

  const onClearAllHistory = () => {
    Alert.alert(
      t('history.tabs.clearAllConfirmTitle'),
      t('history.tabs.clearAllConfirmDesc'),
      [
        {text: t('main.cancel'), style: 'cancel'},
        {
          text: t('history.tabs.clearAllAction'),
          style: 'destructive',
          onPress: () => {
            dispatch(resetLoans());
            Toast.show({type: 'success', text1: t('history.tabs.clearAllSuccess')});
          },
        },
      ],
    );
  };

  const sanitizeInteger = (value: string) => value.replace(/[^0-9]/g, '');

  const resetFilters = () => {
    setFilters(current => ({
      ...current,
      amountMin: '',
      amountMax: '',
      dateFrom: '',
      dateTo: '',
    }));
  };

  return (
    <AppView appStyle={styles.overall}>
      <View style={styles.header}>
        <AppIconButton onPress={onGoBack}>
          <Feather
            name="chevron-left"
            size={24}
            color={COLORS.foundation.neutral.n900}
          />
        </AppIconButton>
        <AppText
          value={t('history.title')}
          fontSize={20}
          fontWeight={600}
          color={COLORS.foundation.neutral.n700}
        />
        <AppIconButton onPress={onClearAllHistory}>
          <Feather
            name="trash-2"
            size={24}
            color={COLORS.foundation.neutral.n900}
          />
        </AppIconButton>
      </View>

      <View style={styles.rows}>
        <AppIndicator
          tabs={[
            {
              id: 0,
              children: t('history.tabs.all'),
              isLeftBorder: true,
            },
            {
              id: 1,
              children: (
                <Ionicons
                  name="home"
                  size={18}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
            },
            {
              id: 2,
              children: (
                <Ionicons
                  name="person"
                  size={18}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
            },
            {
              id: 3,
              children: (
                <FontAwesome6
                  name="briefcase"
                  size={15}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
            },
            {
              id: 4,
              children: (
                <Ionicons
                  name="car-sport"
                  size={18}
                  color={COLORS.foundation.neutral.n700}
                />
              ),
              isRightBorder: true,
            },
          ]}
          activeKey={filters.loanType}
          onPress={value => setFilters(current => ({...current, loanType: value}))}
          tabWidth={(WIDTH - 34) / 8}
        />
        <AppIndicator
          tabs={[
            {
              id: 0,
              children: t('history.tabs.newest'),
              isLeftBorder: true,
            },
            {
              id: 1,
              children: t('history.tabs.oldest'),
              isRightBorder: true,
            },
          ]}
          activeKey={filters.sortOrder}
          onPress={value => setFilters(current => ({...current, sortOrder: value}))}
          tabWidth={(WIDTH - 34) / 6}
        />
      </View>

      <View style={styles.filterCard}>
        <AppText
          value="Bộ lọc nâng cao"
          fontSize={14}
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <AppText
              value="Số tiền từ"
              fontSize={12}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <AppInput
              value={filters.amountMin ? new Intl.NumberFormat().format(Number(filters.amountMin)) : ''}
              onChangeText={value =>
                setFilters(current => ({...current, amountMin: sanitizeInteger(value)}))
              }
              keyboardType="number-pad"
              color={COLORS.foundation.neutral.n700}
              fontSize={14}
              fontWeight={500}
              placeholder="0"
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
          </View>
          <View style={styles.filterCol}>
            <AppText
              value="Đến"
              fontSize={12}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <AppInput
              value={filters.amountMax ? new Intl.NumberFormat().format(Number(filters.amountMax)) : ''}
              onChangeText={value =>
                setFilters(current => ({...current, amountMax: sanitizeInteger(value)}))
              }
              keyboardType="number-pad"
              color={COLORS.foundation.neutral.n700}
              fontSize={14}
              fontWeight={500}
              placeholder="Không giới hạn"
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <AppText
              value="Từ ngày"
              fontSize={12}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <AppInput
              value={filters.dateFrom}
              onChangeText={value =>
                setFilters(current => ({...current, dateFrom: value}))
              }
              keyboardType="numbers-and-punctuation"
              color={COLORS.foundation.neutral.n700}
              fontSize={14}
              fontWeight={500}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
          </View>
          <View style={styles.filterCol}>
            <AppText
              value="Đến ngày"
              fontSize={12}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <AppInput
              value={filters.dateTo}
              onChangeText={value =>
                setFilters(current => ({...current, dateTo: value}))
              }
              keyboardType="numbers-and-punctuation"
              color={COLORS.foundation.neutral.n700}
              fontSize={14}
              fontWeight={500}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.center, styles.gap16]}>
        {listHistory.length === 0 && (
          <View style={styles.emptyState}>
            <AppText
              value="Không có khoản vay nào khớp bộ lọc"
              fontSize={14}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <Pressable onPress={resetFilters} style={styles.resetFilterBtn}>
              <AppText
                value="Xóa bộ lọc"
                fontSize={13}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
              />
            </Pressable>
          </View>
        )}
        {listHistory.map((mortgage, index) => (
          <Card
            id={mortgage.id}
            onPress={() => onNavMortgageDetailScreen(mortgage)}
            onLongPress={() => onRecalculate(mortgage)}
            onDelete={onDeleteHistoryItem}
            index={index}
            key={mortgage.id}
            icon={
              mortgage.type === ELoan.MORTGAGE_LOAN ? (
                <Ionicons
                  name="home"
                  size={22}
                  color={COLORS.foundation.neutral.n0}
                />
              ) : mortgage.type === ELoan.PERSONAL_LOAN ? (
                <Ionicons
                  name="person"
                  size={22}
                  color={COLORS.foundation.neutral.n0}
                />
              ) : mortgage.type === ELoan.BUSINESS_LOAN ? (
                <FontAwesome6
                  name="briefcase"
                  size={18}
                  color={COLORS.foundation.neutral.n0}
                />
              ) : (
                <Ionicons
                  name="car-sport"
                  size={22}
                  color={COLORS.foundation.neutral.n0}
                />
              )
            }
            title={
              mortgage.type === ELoan.BUSINESS_LOAN
                ? t('main.business.title')
                : mortgage.type === ELoan.CAR_LOAN
                  ? t('main.car.title')
                  : mortgage.type === ELoan.MORTGAGE_LOAN
                    ? t('main.mortgage.title')
                    : t('main.personal.title')
            }
            value={formatNumber(
              mortgage.loan_amount,
              mortgage.currency.locale,
              true,
              mortgage.currency.code,
            )}
            year={formatMonth(mortgage.duration || 0, t)}
            time={`${dayjs(mortgage.date).format('DD/MM/YYYY')}`}
          />
        ))}
        <View style={{height: 100}} />
      </ScrollView>

      <AppBanner size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </AppView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    gap: 14,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  rows: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  filterCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 12,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterCol: {
    flex: 1,
    gap: 6,
  },
  gap16: {
    gap: 16,
  },
  center: {
    alignItems: 'center',
  },
  emptyState: {
    width: WIDTH - 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  resetFilterBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.blue.b50,
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
