import {ScrollView, StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import React from 'react';
import AppView from '../../components/AppView';
import AppText from '../../components/AppText';
import {COLORS} from '../../constants/colors';
import AppIconButton from '../../components/AppIconButton';
import Card from './components/Card';
import {navigationRef} from '../../navigation';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/store';
import {formatNumber} from '../../hooks/format_number';
import {ELoan, updateLoan, deleteLoan, TLoan} from '../../redux/slices/history';
import {
  calculateFixedMonthlyPayment,
  calculateFlatRatePayment,
} from '../../hooks/fixed_monthly_payment';
import {calculateFixedPrincipal} from '../../hooks/fixed_principal';
import AppInput from '../../components/AppInput';
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome6,
  MaterialIcons,
} from '@expo/vector-icons';
import AppBanner from '../../components/AppBanner';
import {uuid} from '../../hooks/uuid';

const MainScreen = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.history);
  const {currency} = useSelector((state: RootState) => state.app);

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedLoan, setSelectedLoan] = React.useState<TLoan | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentError, setPaymentError] = React.useState('');
  const getLoanTotalPayable = React.useCallback((loan: TLoan) => {
    if (loan.type === 1) {
      return calculateFixedPrincipal(loan).totalPayment;
    }
    if (loan.type === 2) {
      return calculateFlatRatePayment(loan).totalPayment;
    }
    return calculateFixedMonthlyPayment(loan).totalPayment;
  }, []);
  const getLoanPaidAmount = React.useCallback((loan: TLoan) => {
    const paidFromPayments = (loan.payments || []).reduce(
      (total, payment) => total + payment.amount,
      0,
    );
    return Math.max(paidFromPayments, loan.paid_amount || 0);
  }, []);

  const totalDebt = React.useMemo(
    () => history.reduce((acc, loan) => acc + getLoanTotalPayable(loan), 0),
    [getLoanTotalPayable, history],
  );
  const totalPaid = React.useMemo(
    () => history.reduce((acc, loan) => acc + getLoanPaidAmount(loan), 0),
    [getLoanPaidAmount, history],
  );
  const remainingDebt = React.useMemo(
    () => Math.max(totalDebt - totalPaid, 0),
    [totalDebt, totalPaid],
  );
  const paidProgress = React.useMemo(
    () => (totalDebt > 0 ? Math.min((totalPaid / totalDebt) * 100, 100) : 0),
    [totalDebt, totalPaid],
  );
  const activeSelectedLoan = React.useMemo(() => {
    if (!selectedLoan) {
      return null;
    }

    return history.find(loan => loan.id === selectedLoan.id) || null;
  }, [history, selectedLoan]);
  const selectedPaidAmount = React.useMemo(() => {
    if (!activeSelectedLoan) {
      return 0;
    }

    return getLoanPaidAmount(activeSelectedLoan);
  }, [activeSelectedLoan, getLoanPaidAmount]);
  const selectedRemainingAmount = React.useMemo(() => {
    if (!activeSelectedLoan) {
      return 0;
    }

    return Math.max(getLoanTotalPayable(activeSelectedLoan) - selectedPaidAmount, 0);
  }, [activeSelectedLoan, getLoanTotalPayable, selectedPaidAmount]);
  const formattedPaymentAmount = React.useMemo(() => {
    if (!paymentAmount) {
      return '';
    }

    return new Intl.NumberFormat(
      activeSelectedLoan?.currency.locale || currency.locale,
    ).format(Number(paymentAmount));
  }, [activeSelectedLoan?.currency.locale, currency.locale, paymentAmount]);
  const normalizedPaymentAmount = Number(paymentAmount);
  const canSubmitPayment =
    !!activeSelectedLoan &&
    normalizedPaymentAmount > 0 &&
    selectedRemainingAmount > 0 &&
    normalizedPaymentAmount <= selectedRemainingAmount;

  const getLoanTitle = React.useCallback(
    (loan?: TLoan | null) => {
      if (!loan) {
        return '';
      }

      if (loan.type === ELoan.BUSINESS_LOAN) {
        return t('main.business.title');
      }

      if (loan.type === ELoan.CAR_LOAN) {
        return t('main.car.title');
      }

      if (loan.type === ELoan.PERSONAL_LOAN) {
        return t('main.personal.title');
      }

      return t('main.mortgage.title');
    },
    [t],
  );
  const onNavSettingScreen = () => {
    navigationRef.navigate('SettingScreen');
  };
  const onNavHistoryScreen = () => {
    navigationRef.navigate('HistoryScreen');
  };
  const onNavCompareLoanScreen = () => {
    navigationRef.navigate('CompareLoanScreen');
  };
  const onNavMortgageLoanScreen = (
    type: 'mortgage' | 'car' | 'personal' | 'business',
  ) => {
    navigationRef.navigate('MortgageLoanScreen', {
      label: t(`main.${type}.title`),
    });
  };

  const onUpdatePayment = (loan: TLoan) => {
    setSelectedLoan(loan);
    setPaymentAmount('');
    setPaymentError('');
    setIsModalVisible(true);
  };
  const onDeleteHistoryItem = (id: string) => {
    Alert.alert(
      t('history.tabs.deleteConfirmTitle'),
      t('history.tabs.deleteConfirmDesc'),
      [
        {text: t('main.cancel'), style: 'cancel'},
        {
          text: t('history.tabs.deleteAction'),
          style: 'destructive',
          onPress: () => dispatch(deleteLoan(id)),
        },
      ],
    );
  };
  const onChangePaymentAmount = (value: string) => {
    const normalizedValue = value.replace(/[^0-9]/g, '');
    const nextAmount = Number(normalizedValue);

    setPaymentAmount(normalizedValue);
    setPaymentError(
      selectedRemainingAmount > 0 && nextAmount > selectedRemainingAmount
        ? t('main.paymentAmountExceeded')
        : '',
    );
  };
  const onClosePaymentModal = () => {
    setIsModalVisible(false);
    setPaymentAmount('');
    setPaymentError('');
    setSelectedLoan(null);
  };
  const onPayAll = () => {
    const nextAmount = Number(selectedRemainingAmount.toFixed(2));
    setPaymentAmount(nextAmount.toString());
    setPaymentError('');
  };

  const confirmPayment = () => {
    if (!activeSelectedLoan || normalizedPaymentAmount <= 0) {
      setPaymentError(t('main.invalidPaymentAmount'));
      return;
    }

    if (selectedRemainingAmount <= 0) {
      setPaymentError(t('main.fullyPaid'));
      return;
    }

    if (normalizedPaymentAmount > selectedRemainingAmount) {
      setPaymentError(t('main.paymentAmountExceeded'));
      return;
    }

    const payments = [
      ...(activeSelectedLoan.payments || []),
      {
        id: uuid(),
        date: new Date().toISOString(),
        amount: normalizedPaymentAmount,
      },
    ];

    dispatch(updateLoan({
      ...activeSelectedLoan,
      label: activeSelectedLoan.label || getLoanTitle(activeSelectedLoan),
      paid_amount: selectedPaidAmount + normalizedPaymentAmount,
      payments,
    } as TLoan));
    onClosePaymentModal();
  };

  return (
    <AppView appStyle={styles.overall}>
      <View style={[styles.header, styles.rows]}>
        <View style={styles.headerLeftSection}>
          <AppText
            value={t('main.greeting')}
            fontSize={14}
            fontWeight={500}
            color={COLORS.foundation.neutral.n500}
          />
          <AppText
            value={t('main.title')}
            fontSize={28}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
            numberOfLines={2}
            textStyle={styles.headerTitle}
          />
        </View>
        <View style={styles.headerRightSection}>
          <AppIconButton style={styles.headerIconButton} onPress={onNavSettingScreen}>
            <Feather
              name="settings"
              size={22}
              color={COLORS.foundation.neutral.n900}
            />
          </AppIconButton>
          <AppIconButton style={styles.headerIconButton} onPress={onNavHistoryScreen}>
            <MaterialCommunityIcons
              name="history"
              size={22}
              color={COLORS.foundation.neutral.n900}
            />
          </AppIconButton>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Report Section */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View>
              <AppText
                value={t('main.report')}
                fontSize={18}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
              />
              <AppText
                value={`${history.length} ${t('main.activeLoans')}`}
                fontSize={12}
                color="rgba(255,255,255,0.7)"
                fontWeight={400}
              />
            </View>
            <View style={styles.reportIcon}>
              <MaterialIcons
                name="insights"
                size={24}
                color={COLORS.foundation.blue.b300}
              />
            </View>
          </View>
          <View style={styles.reportPrimary}>
            <AppText
              value={t('main.totalDebt')}
              fontSize={12}
              color="rgba(255,255,255,0.7)"
              fontWeight={500}
            />
            <AppText
              value={formatNumber(
                totalDebt,
                currency.locale,
                true,
                currency.code,
              )}
              fontSize={30}
              fontWeight={700}
              color={COLORS.foundation.neutral.n0}
            />
          </View>
          <View style={styles.reportMetricGrid}>
            <View style={styles.reportMetricCard}>
              <AppText
                value={t('main.totalPaid')}
                fontSize={11}
                color="rgba(255,255,255,0.72)"
                fontWeight={500}
              />
              <AppText
                value={formatNumber(
                  totalPaid,
                  currency.locale,
                  true,
                  currency.code,
                )}
                fontSize={16}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
                numberOfLines={1}
              />
            </View>
            <View style={styles.reportMetricCard}>
              <AppText
                value={t('main.remainingBalance')}
                fontSize={11}
                color="rgba(255,255,255,0.72)"
                fontWeight={500}
              />
              <AppText
                value={formatNumber(
                  remainingDebt,
                  currency.locale,
                  true,
                  currency.code,
                )}
                fontSize={16}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
                numberOfLines={1}
              />
            </View>
          </View>
          <View style={styles.reportProgressSection}>
            <View style={styles.reportProgressHeader}>
              <AppText
                value={t('main.repaymentProgress')}
                fontSize={12}
                color="rgba(255,255,255,0.75)"
                fontWeight={500}
              />
              <AppText
                value={`${paidProgress.toFixed(0)}%`}
                fontSize={12}
                color={COLORS.foundation.neutral.n0}
                fontWeight={700}
              />
            </View>
            <View style={styles.reportProgressTrack}>
              <View
                style={[
                  styles.reportProgressFill,
                  {width: `${paidProgress}%`},
                ]}
              />
            </View>
          </View>
        </View>

        {/* My Loans Section */}
        <View style={styles.sectionHeader}>
          <AppText
            value={t('main.activeLoans')}
            fontSize={20}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
          <TouchableOpacity onPress={onNavHistoryScreen}>
            <AppText
              value={t('history.tabs.all')}
              fontSize={14}
              color={COLORS.foundation.blue.b300}
              fontWeight={500}
            />
          </TouchableOpacity>
        </View>

        {history.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {history.slice(0, 5).map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.activeLoanCard}
                onPress={() => navigationRef.navigate('MortgageLoanResultDetailScreen', {
                  id: loan.id,
                  isHistory: true,
                  label: getLoanTitle(loan),
                })}
              >
                <View style={styles.activeLoanHeader}>
                  <View style={[styles.loanIcon, {backgroundColor: COLORS.foundation.blue.b300}]}>
                    <Ionicons name="cash" size={20} color={COLORS.foundation.neutral.n0} />
                  </View>
                  <AppText value={getLoanTitle(loan)} fontSize={16} fontWeight={600} color={COLORS.foundation.neutral.n700} />
                  <TouchableOpacity
                    style={styles.deleteLoanBtn}
                    onPress={event => {
                      event.stopPropagation();
                      onDeleteHistoryItem(loan.id);
                    }}
                  >
                    <Feather name="trash-2" size={14} color="#D92D20" />
                  </TouchableOpacity>
                </View>
                <View style={styles.progressContainer}>
                  {(() => {
                    const totalPayable = getLoanTotalPayable(loan);
                    const paidAmount = getLoanPaidAmount(loan);
                    const progressPercent =
                      totalPayable > 0
                        ? Math.min((paidAmount / totalPayable) * 100, 100)
                        : 0;
                    return (
                      <View style={styles.progressPercentRow}>
                        <AppText
                          value={`${progressPercent.toFixed(0)}%`}
                          fontSize={10}
                          color={COLORS.foundation.neutral.n700}
                          fontWeight={700}
                        />
                      </View>
                    );
                  })()}
                  <View style={styles.progressBar}>
                    {(() => {
                      const totalPayable = getLoanTotalPayable(loan);
                      const paidAmount = getLoanPaidAmount(loan);
                      const progressPercent =
                        totalPayable > 0
                          ? Math.min((paidAmount / totalPayable) * 100, 100)
                          : 0;
                      return (
                        <View
                          style={[
                            styles.progressFill,
                            {width: `${progressPercent}%`},
                          ]}
                        />
                      );
                    })()}
                  </View>
                  <View style={[styles.rows, {marginTop: 4}]}>
                    {(() => {
                      const totalPayable = getLoanTotalPayable(loan);
                      const paidAmount = getLoanPaidAmount(loan);
                      return (
                        <AppText
                          value={`${formatNumber(
                            paidAmount,
                            loan.currency.locale,
                            true,
                            loan.currency.code,
                          )} / ${formatNumber(
                            totalPayable,
                            loan.currency.locale,
                            true,
                            loan.currency.code,
                          )}`}
                          fontSize={11}
                          color={COLORS.foundation.neutral.n500}
                          fontWeight={400}
                        />
                      );
                    })()}
                    <TouchableOpacity
                      style={styles.updateBtn}
                      onPress={() => onUpdatePayment(loan)}
                    >
                      <AppText value={t('main.updatePayment')} fontSize={12} color={COLORS.foundation.blue.b300} fontWeight={600} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyLoans}>
            <AppText value={t('main.noLoans')} color={COLORS.foundation.neutral.n500} fontWeight={400} fontSize={14} />
          </View>
        )}
        
        <View style={{alignItems: 'center', marginVertical: 10}}>
           <AppBanner />
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <AppText
            value={t('main.heroTitle')}
            fontSize={20}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
        </View>

        <View style={styles.cardContainer}>
          <Card
            title={t('compareLoan.title')}
            desc={t('compareLoan.desc')}
            badgeLabel={t('compareLoan.badge')}
            accentColor="#2E8B70"
            iconBackgroundColor="#2E8B70"
            icon={<MaterialIcons name="compare-arrows" size={26} color={COLORS.foundation.neutral.n0} />}
            onPress={onNavCompareLoanScreen}
            variant="grid"
          />
          <Card
            title={t('main.mortgage.title')}
            desc={t('main.mortgage.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#0F8A6A"
            iconBackgroundColor="#0F8A6A"
            icon={<Ionicons name="home" size={24} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('mortgage')}
            variant="grid"
          />
          <Card
            title={t('main.car.title')}
            desc={t('main.car.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#5D7CF4"
            iconBackgroundColor="#5D7CF4"
            icon={<Ionicons name="car-sport" size={24} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('car')}
            variant="grid"
          />
          <Card
            title={t('main.personal.title')}
            desc={t('main.personal.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#E07A5F"
            iconBackgroundColor="#E07A5F"
            icon={<Ionicons name="person" size={24} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('personal')}
            variant="grid"
          />
          <Card
            title={t('main.business.title')}
            desc={t('main.business.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#B45CE0"
            iconBackgroundColor="#B45CE0"
            icon={<FontAwesome6 name="briefcase" size={20} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('business')}
            variant="grid"
          />
        </View>
        <View style={{height: 100}} />
      </ScrollView>

      {/* Update Payment Modal */}
      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText
              value={t('main.updatePayment')}
              fontSize={20}
              fontWeight={700}
              textStyle={{marginBottom: 8}}
              color={COLORS.foundation.neutral.n700}
            />
            <AppText
              value={getLoanTitle(activeSelectedLoan)}
              fontSize={14}
              color={COLORS.foundation.neutral.n500}
              textStyle={{marginBottom: 20}}
              fontWeight={400}
            />
            <AppInput
              placeholder={t('main.paidThisMonth')}
              value={formattedPaymentAmount}
              onChangeText={onChangePaymentAmount}
              keyboardType="number-pad"
              color={COLORS.foundation.neutral.n700}
              fontSize={16}
              fontWeight={400}
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
            <View style={styles.modalHint}>
              <AppText
                value={`${t('main.remainingBalance')}: ${formatNumber(
                  selectedRemainingAmount,
                  activeSelectedLoan?.currency.locale || currency.locale,
                  true,
                  activeSelectedLoan?.currency.code || currency.code,
                )}`}
                color={COLORS.foundation.neutral.n500}
                fontWeight={400}
                fontSize={12}
              />
              <TouchableOpacity
                style={styles.payAllBtn}
                onPress={onPayAll}
                disabled={selectedRemainingAmount <= 0}>
                <AppText
                  value={t('main.payAll', {defaultValue: 'Pay all'})}
                  color={COLORS.foundation.blue.b300}
                  fontWeight={700}
                  fontSize={12}
                />
              </TouchableOpacity>
              {!!paymentError && (
                <AppText
                  value={paymentError}
                  color="#D92D20"
                  fontWeight={500}
                  fontSize={12}
                />
              )}
            </View>
            <View style={[styles.rows, {marginTop: 24, gap: 12}]}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: COLORS.foundation.neutral.n100}]}
                onPress={onClosePaymentModal}
              >
                <AppText value={t('main.cancel')} fontWeight={600} fontSize={15} color={COLORS.foundation.neutral.n700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: canSubmitPayment
                      ? COLORS.foundation.blue.b300
                      : COLORS.foundation.neutral.n100,
                  },
                ]}
                disabled={!canSubmitPayment}
                onPress={confirmPayment}
              >
                <AppText
                  value={t('main.confirm')}
                  color={
                    canSubmitPayment
                      ? COLORS.foundation.neutral.n0
                      : COLORS.foundation.neutral.n500
                  }
                  fontWeight={600}
                  fontSize={15}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </AppView>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 18,
    width: '100%',
  },
  header: {
    gap: 12,
    paddingVertical: 4,
  },
  headerLeftSection: {
    gap: 4,
    flex: 1,
    paddingRight: 14,
  },
  headerTitle: {
    lineHeight: 34,
  },
  headerRightSection: {
    gap: 10,
  },
  headerIconButton: {
    width: 48,
    height: 44,
    borderRadius: 16,
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 20,
  },
  reportCard: {
    backgroundColor: COLORS.foundation.blue.b300,
    borderRadius: 28,
    padding: 20,
    gap: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.foundation.neutral.n0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportPrimary: {
    gap: 4,
  },
  reportMetricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  reportMetricCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 12,
    justifyContent: 'space-between',
  },
  reportProgressSection: {
    gap: 8,
  },
  reportProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportProgressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  reportProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.foundation.neutral.n0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  horizontalList: {
    gap: 16,
    paddingRight: 16,
  },
  activeLoanCard: {
    width: 260,
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    gap: 12,
  },
  activeLoanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteLoanBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  loanIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    gap: 4,
  },
  progressPercentRow: {
    alignItems: 'flex-end',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.foundation.neutral.n50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.foundation.blue.b300,
  },
  updateBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.foundation.blue.b50,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.foundation.neutral.n0,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHint: {
    gap: 6,
  },
  payAllBtn: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: COLORS.foundation.neutral.n0,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLoans: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.foundation.neutral.n25,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
