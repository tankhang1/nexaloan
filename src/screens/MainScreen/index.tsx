import {ScrollView, StyleSheet, View, TouchableOpacity} from 'react-native';
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
import {updateLoan, TLoan} from '../../redux/slices/history';
import AppInput from '../../components/AppInput';
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome6,
} from '@expo/vector-icons';

const MainScreen = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.history);

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedLoan, setSelectedLoan] = React.useState<TLoan | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState('');

  const totalDebt = history.reduce((acc, curr) => acc + curr.loan_amount, 0);
  const totalPaid = history.reduce((acc, curr) => acc + (curr.paid_amount || 0), 0);

  const onNavSettingScreen = () => {
    navigationRef.navigate('SettingScreen');
  };
  const onNavHistoryScreen = () => {
    navigationRef.navigate('HistoryScreen');
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
    setIsModalVisible(true);
  };

  const confirmPayment = () => {
    if (selectedLoan && paymentAmount) {
      const numericAmount = parseFloat(paymentAmount);
      if (!isNaN(numericAmount)) {
        dispatch(updateLoan({
          ...selectedLoan,
          paid_amount: (selectedLoan.paid_amount || 0) + numericAmount,
          payments: [
            ...(selectedLoan.payments || []),
            {
              id: Math.random().toString(),
              date: new Date().toISOString(),
              amount: numericAmount,
            }
          ]
        } as TLoan));
        setIsModalVisible(false);
        setPaymentAmount('');
        setSelectedLoan(null);
      }
    }
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
            fontSize={34}
            fontWeight={700}
            color={COLORS.foundation.neutral.n700}
          />
        </View>
        <View style={styles.headerRightSection}>
          <AppIconButton onPress={onNavSettingScreen}>
            <Feather
              name="settings"
              size={24}
              color={COLORS.foundation.neutral.n900}
            />
          </AppIconButton>
          <AppIconButton onPress={onNavHistoryScreen}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={COLORS.foundation.neutral.n900}
            />
          </AppIconButton>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Report Section */}
        <View style={styles.reportCard}>
          <AppText
            value={t('main.report')}
            fontSize={18}
            fontWeight={700}
            color={COLORS.foundation.neutral.n0}
          />
          <View style={styles.reportRow}>
            <View>
              <AppText
                value={t('main.totalDebt')}
                fontSize={12}
                color="rgba(255,255,255,0.7)"
                fontWeight={400}
              />
              <AppText
                value={formatNumber(totalDebt, 'en-US', true, 'USD')}
                fontSize={20}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
              />
            </View>
            <View>
              <AppText
                value={t('main.totalPaid')}
                fontSize={12}
                color="rgba(255,255,255,0.7)"
                fontWeight={400}
              />
              <AppText
                value={formatNumber(totalPaid, 'en-US', true, 'USD')}
                fontSize={20}
                fontWeight={700}
                color={COLORS.foundation.neutral.n0}
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
                  label: loan.label,
                })}
              >
                <View style={styles.activeLoanHeader}>
                  <View style={[styles.loanIcon, {backgroundColor: COLORS.foundation.blue.b300}]}>
                    <Ionicons name="cash" size={20} color={COLORS.foundation.neutral.n0} />
                  </View>
                  <AppText value={loan.label} fontSize={16} fontWeight={600} color={COLORS.foundation.neutral.n700} />
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${Math.min(((loan.paid_amount || 0) / loan.loan_amount) * 100, 100)}%`}]} />
                  </View>
                  <View style={[styles.rows, {marginTop: 4}]}>
                    <AppText
                      value={`${formatNumber(loan.paid_amount || 0, 'en-US', true, 'USD')} / ${formatNumber(loan.loan_amount, 'en-US', true, 'USD')}`}
                      fontSize={11}
                      color={COLORS.foundation.neutral.n500}
                      fontWeight={400}
                    />
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
            title={t('main.mortgage.title')}
            desc={t('main.mortgage.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#0F8A6A"
            iconBackgroundColor="#0F8A6A"
            icon={<Ionicons name="home" size={24} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('mortgage')}
          />
          <Card
            title={t('main.car.title')}
            desc={t('main.car.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#5D7CF4"
            iconBackgroundColor="#5D7CF4"
            icon={<Ionicons name="car-sport" size={24} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('car')}
          />
          <Card
            title={t('main.personal.title')}
            desc={t('main.personal.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#E07A5F"
            iconBackgroundColor="#E07A5F"
            icon={<Ionicons name="person" size={24} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('personal')}
          />
          <Card
            title={t('main.business.title')}
            desc={t('main.business.desc')}
            badgeLabel={t('main.badge')}
            accentColor="#B45CE0"
            iconBackgroundColor="#B45CE0"
            icon={<FontAwesome6 name="briefcase" size={20} color={COLORS.foundation.neutral.n0} />}
            onPress={() => onNavMortgageLoanScreen('business')}
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
              value={selectedLoan?.label || ''}
              fontSize={14}
              color={COLORS.foundation.neutral.n500}
              textStyle={{marginBottom: 20}}
              fontWeight={400}
            />
            <AppInput
              placeholder={t('main.paidThisMonth')}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              color={COLORS.foundation.neutral.n700}
              fontSize={16}
              fontWeight={400}
              placeholderTextColor={COLORS.foundation.neutral.n200}
            />
            <View style={[styles.rows, {marginTop: 24, gap: 12}]}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: COLORS.foundation.neutral.n100}]}
                onPress={() => setIsModalVisible(false)}
              >
                <AppText value={t('main.cancel')} fontWeight={600} fontSize={15} color={COLORS.foundation.neutral.n700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: COLORS.foundation.blue.b300}]}
                onPress={confirmPayment}
              >
                <AppText value={t('main.confirm')} color={COLORS.foundation.neutral.n0} fontWeight={600} fontSize={15} />
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
    gap: 14,
    paddingVertical: 4,
  },
  headerLeftSection: {
    gap: 4,
    maxWidth: '68%',
  },
  headerRightSection: {
    gap: 14,
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
    borderRadius: 24,
    padding: 24,
    gap: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: 16,
  },
});
