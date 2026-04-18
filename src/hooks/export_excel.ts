import XLSX from 'xlsx';
import {Alert} from 'react-native';
import dayjs from 'dayjs';
import i18n from '../languages';
import ReactNativeFilesystem, {
  ReactNativeFilesystemCommonMimeTypes,
} from 'react-native-simple-fs';
import {formatNumber} from './format_number';

function buildRows(
  data: any[],
  headers: Record<string, string>,
  currency: {
    locale: string;
    code: string;
  },
) {
  const keys = Object.keys(headers);
  return [
    keys.map(k => headers[k]),
    ...data.map((row: any) =>
      keys.map(k => {
        const val = row[k];
        if (typeof val === 'number' && k !== 'month') {
          return formatNumber(val, currency.locale, true, currency.code);
        }

        return val ?? '';
      }),
    ),
  ];
}

export async function exportLoanCsvToDownloadsRNFA(
  data: any[],
  baseName = 'Loan_Report',
  currency: {
    locale: string;
    code: string;
  },
) {
  try {
    const headers: Record<string, string> = {
      month: i18n.t('mortgageDetail.table.month'),
      principalPayment: i18n.t('mortgageDetail.table.principal'),
      interestPayment: i18n.t('mortgageDetail.table.interest'),
      totalPayment: i18n.t('mortgageDetail.table.monthlyPayment'),
      remainingPrincipal: i18n.t('mortgageDetail.table.endingBalance'),
    };

    const ws = XLSX.utils.aoa_to_sheet(buildRows(data, headers, currency));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');

    const csv = XLSX.write(wb, {type: 'string', bookType: 'csv'});
    const body = '\uFEFF' + csv;
    const filename = `${baseName}-${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    const savedPath = await ReactNativeFilesystem.writeFileToDownloads(
      filename,
      body,
      ReactNativeFilesystemCommonMimeTypes.Csv,
    );

    Alert.alert(
      i18n.t('mortgageResult.notificationTitle'),
      i18n.t('mortgageResult.downloadFileMessage'),
    );

    return savedPath;
  } catch (err: any) {
    console.log('EXPORT CSV ERROR →', err);
    Alert.alert('Error', String(err?.message ?? 'Failed to export CSV'));
  }
}
