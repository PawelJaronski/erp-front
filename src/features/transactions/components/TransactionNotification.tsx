import React from 'react';
import {
  SimpleExpenseFormData,
  SimpleIncomeFormData,
  SimpleTransferFormData,
  PaymentBrokerTransferFormData,
} from '../types';

export type NotificationData =
  | (SimpleExpenseFormData & { transaction_type: 'simple_expense' })
  | (SimpleIncomeFormData & { transaction_type: 'simple_income' })
  | (SimpleTransferFormData & { transaction_type: 'simple_transfer' })
  | (PaymentBrokerTransferFormData & { transaction_type: 'payment_broker_transfer' });

interface Props {
  data: NotificationData;
}

export const TransactionNotification: React.FC<Props> = ({ data }) => {
  switch (data.transaction_type) {
    case 'simple_expense':
    case 'simple_income':
      return (
        <>
          Kwota: <strong>{data.gross_amount} zł</strong> <br />
          Kategoria: <strong>{'category' in data ? data.category : ''}</strong>
          {'category_group' in data && data.category_group ? ` (${data.category_group})` : ''} <br />
          Konto: <strong>{data.account}</strong>
        </>
      );
    case 'simple_transfer':
      return (
        <>
          Kwota: <strong>{data.gross_amount} zł</strong> <br />
          Z: <strong>{data.account}</strong> → <strong>{data.to_account}</strong>
        </>
      );
    case 'payment_broker_transfer':
      return (
        <>
          Paynow: <strong>{data.paynow_transfer} zł</strong> <br />
          Autopay: <strong>{data.autopay_transfer} zł</strong> <br />
          Data przelewu: <strong>{data.transfer_date}</strong> <br />
          Data sprzedaży: <strong>{data.sales_date}</strong>
        </>
      );
    default:
      return null;
  }
}; 