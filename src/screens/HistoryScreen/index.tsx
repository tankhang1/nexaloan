import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Image,
} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import React, {useMemo, useState} from 'react';
import {COLORS} from '../../constants/colors';
import AppView from '../../components/AppView';
import AppIconButton from '../../components/AppIconButton';
import {navigationRef} from '../../navigation';
import AppText from '../../components/AppText';
import {WIDTH} from '../../constants/dimension';
import Card from './components/Card';
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
import {Feather} from '@expo/vector-icons';
import {FINANCE_IMAGES} from '../../assets';
import AppInput from '../../components/AppInput';

type THistoryFilterState = {
  loanType: number;
  amountMin: string;
  amountMax: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: number;
};

const TYPE_FILTERS = [
  {id: 0, label: 'history.tabs.all', image: null},
  {id: 1, label: 'main.mortgage.title', image: FINANCE_IMAGES.home},
  {id: 2, label: 'main.personal.title', image: FINANCE_IMAGES.wallet},
  {id: 3, label: 'main.business.title', image: FINANCE_IMAGES.bank},
  {id: 4, label: 'main.car.title', image: FINANCE_IMAGES.auto},
];

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
  const [datePickerField, setDatePickerField] = useState<
    'dateFrom' | 'dateTo' | null
  >(null);
  const [pickerMonth, setPickerMonth] = useState(() =>
    dayjs().startOf('month'),
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const history = useSelector((state: RootState) => state.history);
  const hasAdvancedFilter =
    !!filters.amountMin ||
    !!filters.amountMax ||
    !!filters.dateFrom ||
    !!filters.dateTo;

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

  const formattedDate = (value: string) => {
    if (!value) {
      return '';
    }

    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : value;
  };

  const openDatePicker = (field: 'dateFrom' | 'dateTo') => {
    const currentDate = filters[field] ? dayjs(filters[field]) : dayjs();

    setPickerMonth(currentDate.startOf('month'));
    setDatePickerField(field);
  };

  const closeDatePicker = () => {
    setDatePickerField(null);
  };

  const selectPickerDate = (date: dayjs.Dayjs) => {
    if (!datePickerField) {
      return;
    }

    setFilters(current => ({
      ...current,
      [datePickerField]: date.format('YYYY-MM-DD'),
    }));
    setDatePickerField(null);
  };

  const calendarCells = useMemo(() => {
    const startOfMonth = pickerMonth.startOf('month');
    const leadingEmptyCells = startOfMonth.day();
    const daysInMonth = pickerMonth.daysInMonth();

    return [
      ...Array.from({length: leadingEmptyCells}, () => null),
      ...Array.from({length: daysInMonth}, (_, index) => index + 1),
    ];
  }, [pickerMonth]);

  const resetFilters = () => {
    setFilters(current => ({
      ...current,
      amountMin: '',
      amountMax: '',
      dateFrom: '',
      dateTo: '',
    }));
  };

  const resetAllFilters = () => {
    resetFilters();
    setFilters(current => ({...current, loanType: 0}));
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
          fontWeight={700}
          color={COLORS.foundation.neutral.n700}
        />
        <AppIconButton onPress={onClearAllHistory}>
          <Feather name="trash-2" size={20} color="#D92D20" />
        </AppIconButton>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}>
        {TYPE_FILTERS.map(item => {
          const isActive = filters.loanType === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() =>
                setFilters(current => ({...current, loanType: item.id}))
              }
              style={[styles.typeChip, isActive && styles.typeChipActive]}>
              {item.image && (
                <Image
                  source={item.image}
                  resizeMode="contain"
                  style={styles.typeChipImage}
                />
              )}
              <AppText
                value={t(item.label)}
                fontSize={13}
                fontWeight={600}
                color={
                  isActive
                    ? COLORS.foundation.neutral.n0
                    : COLORS.foundation.neutral.n700
                }
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.toolbar}>
        <AppText
          value={`${listHistory.length} / ${history.length}`}
          fontSize={13}
          fontWeight={600}
          color={COLORS.foundation.neutral.n500}
        />
        <View style={styles.toolbarActions}>
          <Pressable
            style={styles.toolButton}
            onPress={() =>
              setFilters(current => ({
                ...current,
                sortOrder: current.sortOrder === 0 ? 1 : 0,
              }))
            }>
            <Feather
              name={filters.sortOrder === 0 ? 'arrow-down' : 'arrow-up'}
              size={14}
              color={COLORS.foundation.blue.b400}
            />
            <AppText
              value={
                filters.sortOrder === 0
                  ? t('history.tabs.newest')
                  : t('history.tabs.oldest')
              }
              fontSize={13}
              fontWeight={600}
              color={COLORS.foundation.blue.b400}
            />
          </Pressable>
          <Pressable
            style={[styles.toolButton, isFilterOpen && styles.toolButtonActive]}
            onPress={() => setIsFilterOpen(current => !current)}>
            <Feather
              name="sliders"
              size={14}
              color={
                isFilterOpen
                  ? COLORS.foundation.neutral.n0
                  : COLORS.foundation.blue.b400
              }
            />
            {hasAdvancedFilter && <View style={styles.activeDot} />}
          </Pressable>
        </View>
      </View>

      {isFilterOpen && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <AppText
              value={t('history.filters.advancedTitle')}
              fontSize={15}
              fontWeight={700}
              color={COLORS.foundation.neutral.n700}
            />
            {hasAdvancedFilter && (
              <Pressable onPress={resetFilters}>
                <AppText
                  value={t('history.filters.clearFilter')}
                  fontSize={12}
                  fontWeight={700}
                  color={COLORS.foundation.blue.b400}
                />
              </Pressable>
            )}
          </View>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <AppText
              value={t('history.filters.amountFrom')}
              fontSize={11}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <AppInput
              textStyle={styles.inputField}
              value={filters.amountMin ? new Intl.NumberFormat().format(Number(filters.amountMin)) : ''}
              onChangeText={value =>
                setFilters(current => ({...current, amountMin: sanitizeInteger(value)}))
              }
              keyboardType="number-pad"
              color={COLORS.foundation.neutral.n700}
              fontSize={15}
              fontWeight={600}
              placeholder="0"
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
          </View>
          <View style={styles.filterCol}>
            <AppText
              value={t('history.filters.amountTo')}
              fontSize={11}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <AppInput
              textStyle={styles.inputField}
              value={filters.amountMax ? new Intl.NumberFormat().format(Number(filters.amountMax)) : ''}
              onChangeText={value =>
                setFilters(current => ({...current, amountMax: sanitizeInteger(value)}))
              }
              keyboardType="number-pad"
              color={COLORS.foundation.neutral.n700}
              fontSize={15}
              fontWeight={600}
              placeholder={t('history.filters.noLimit')}
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <AppText
              value={t('history.filters.dateFrom')}
              fontSize={11}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <Pressable
              onPress={() => openDatePicker("dateFrom")}
              style={({pressed}) => [
                styles.dateField,
                pressed && styles.dateFieldPressed,
              ]}>
              <AppText
                value={
                  formattedDate(filters.dateFrom) ||
                  t('history.filters.selectDate')
                }
                fontSize={15}
                fontWeight={600}
                color={
                  filters.dateFrom
                    ? COLORS.foundation.neutral.n700
                    : COLORS.foundation.neutral.n200
                }
                numberOfLines={1}
              />
            </Pressable>
          </View>
          <View style={styles.filterCol}>
            <AppText
              value={t('history.filters.dateTo')}
              fontSize={11}
              fontWeight={500}
              color={COLORS.foundation.neutral.n500}
            />
            <Pressable
              onPress={() => openDatePicker("dateTo")}
              style={({pressed}) => [
                styles.dateField,
                pressed && styles.dateFieldPressed,
              ]}>
              <AppText
                value={
                  formattedDate(filters.dateTo) ||
                  t('history.filters.selectDate')
                }
                fontSize={15}
                fontWeight={600}
                color={
                  filters.dateTo
                    ? COLORS.foundation.neutral.n700
                    : COLORS.foundation.neutral.n200
                }
                numberOfLines={1}
              />
            </Pressable>
          </View>
        </View>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Image
              source={FINANCE_IMAGES.emptyHistory}
              resizeMode="contain"
              style={styles.emptyImage}
            />
            <AppText
              value={t('main.noLoans')}
              fontSize={14}
              fontWeight={600}
              color={COLORS.foundation.neutral.n500}
              textStyle={styles.emptyText}
            />
          </View>
        ) : (
          listHistory.length === 0 && (
            <View style={styles.emptyState}>
              <AppText
                value={t('history.filters.noMatch')}
                fontSize={13}
                fontWeight={500}
                color={COLORS.foundation.neutral.n500}
                textStyle={styles.emptyText}
              />
              <Pressable onPress={resetAllFilters} style={styles.resetFilterBtn}>
                <AppText
                  value={t('history.filters.clearFilter')}
                  fontSize={13}
                  fontWeight={700}
                  color={COLORS.foundation.blue.b400}
                />
              </Pressable>
            </View>
          )
        )}
        {listHistory.map((mortgage, index) => (
          <Card
            id={mortgage.id}
            onPress={() => onNavMortgageDetailScreen(mortgage)}
            onLongPress={() => onRecalculate(mortgage)}
            onDelete={onDeleteHistoryItem}
            index={index}
            key={mortgage.id}
            image={
              mortgage.type === ELoan.MORTGAGE_LOAN
                ? FINANCE_IMAGES.home
                : mortgage.type === ELoan.PERSONAL_LOAN
                  ? FINANCE_IMAGES.wallet
                  : mortgage.type === ELoan.BUSINESS_LOAN
                    ? FINANCE_IMAGES.bank
                    : FINANCE_IMAGES.auto
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
      </ScrollView>

      <Modal
        visible={!!datePickerField}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}>
        <Pressable style={styles.modalOverlay} onPress={closeDatePicker}>
          <Pressable
            style={styles.datePickerSheet}
            onPress={event => event.stopPropagation()}>
            <View style={styles.datePickerHeader}>
              <AppText
                value={pickerMonth.format("MM/YYYY")}
                fontSize={16}
                fontWeight={700}
                color={COLORS.foundation.neutral.n700}
              />
              <View style={styles.datePickerActions}>
                <AppIconButton
                  onPress={() =>
                    setPickerMonth(current => current.subtract(1, "month"))
                  }>
                  <Feather
                    name="chevron-left"
                    size={20}
                    color={COLORS.foundation.neutral.n700}
                  />
                </AppIconButton>
                <AppIconButton
                  onPress={() =>
                    setPickerMonth(current => current.add(1, "month"))
                  }>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={COLORS.foundation.neutral.n700}
                  />
                </AppIconButton>
              </View>
            </View>

            <View style={styles.weekdayRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <AppText
                  key={`${day}-${index}`}
                  value={day}
                  fontSize={11}
                  fontWeight={700}
                  color={COLORS.foundation.neutral.n500}
                  textStyle={styles.weekdayCell}
                />
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const currentDate = pickerMonth.date(day);
                const selectedValue =
                  datePickerField === "dateFrom"
                    ? filters.dateFrom
                    : filters.dateTo;
                const isSelected =
                  !!selectedValue &&
                  dayjs(selectedValue).isValid() &&
                  dayjs(selectedValue).isSame(currentDate, "day");

                return (
                  <Pressable
                    key={currentDate.format("YYYY-MM-DD")}
                    onPress={() => selectPickerDate(currentDate)}
                    style={({pressed}) => [
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      pressed && styles.dayCellPressed,
                    ]}>
                    <AppText
                      value={`${day}`}
                      fontSize={13}
                      fontWeight={600}
                      color={
                        isSelected
                          ? COLORS.foundation.neutral.n0
                          : COLORS.foundation.neutral.n700
                      }
                    />
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    gap: 8,
    paddingHorizontal: 16,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n50,
  },
  typeChipActive: {
    backgroundColor: COLORS.foundation.blue.b400,
    borderColor: COLORS.foundation.blue.b400,
  },
  typeChipImage: {
    width: 24,
    height: 24,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    minWidth: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.foundation.blue.b50,
  },
  toolButtonActive: {
    backgroundColor: COLORS.foundation.blue.b400,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.foundation.gold.g300,
  },
  filterCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.foundation.neutral.n0,
    padding: 16,
    gap: 12,
    shadowColor: COLORS.foundation.blue.b500,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterCol: {
    flex: 1,
    gap: 6,
  },
  inputField: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 0,
    paddingHorizontal: 14,
    backgroundColor: COLORS.foundation.neutral.n25,
  },
  dateField: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.foundation.neutral.n25,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  dateFieldPressed: {
    backgroundColor: COLORS.foundation.blue.b50,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 24,
    gap: 12,
  },
  emptyState: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 20,
    gap: 10,
    alignItems: 'center',
  },
  emptyImage: {
    width: 140,
    height: 140,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  resetFilterBtn: {
    borderRadius: 12,
    backgroundColor: COLORS.foundation.blue.b50,
    minHeight: 38,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  datePickerSheet: {
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayCell: {
    width: (WIDTH - 64) / 7,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (WIDTH - 64) / 7,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellPressed: {
    backgroundColor: COLORS.foundation.blue.b50,
  },
  dayCellSelected: {
    backgroundColor: COLORS.foundation.blue.b400,
  },
});
