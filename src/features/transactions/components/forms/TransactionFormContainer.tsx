import {
  SimpleExpenseForm,
  SimpleTransferForm,
  PaymentBrokerTransferForm,
  SimpleIncomeForm,
} from "@/features/transactions/components";
import React, { useState } from "react";
import { addTransaction } from '@/features/transactions/api';
import { buildTransactionPayload, AnyFormData } from '@/features/transactions/utils';
import { useToast } from '@/shared/components/ToastProvider';
import { simpleExpenseLayout2Col, simpleExpenseLayout3Col } from "@/features/transactions/components/layouts";

type Props = {
  onSuccess?: () => void;
  collapsible?: boolean;
  className?: string;
  columns?: number;
};

export const TransactionFormContainer: React.FC<Props> = ({ onSuccess, collapsible = false, className = "", columns = 2 }) => {
  const [activeForm, setActiveForm] = useState<"simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer">("simple_expense");
  const { showToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleSubmit = async (data: unknown) => {
    const payload = buildTransactionPayload(
      data as AnyFormData,
      activeForm,
    );

    try {
      await addTransaction(payload);
      showToast("Transaction added!", "success");
      onSuccess?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      showToast(msg, 'error');
    }
  };

  // wybierz layout na podstawie columns
  const expenseLayout = columns === 3 ? simpleExpenseLayout3Col : simpleExpenseLayout2Col;

  return (
    <div className={className}>
      {collapsible && (
        <button
          className="mb-4 text-sm text-blue-600 underline"
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? "Show form" : "Hide form"}
        </button>
      )}
      {!collapsed && (
        <>
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveForm("simple_expense")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-semibold border transition-colors cursor-pointer duration-150 text-sm sm:text-base ${
                activeForm === "simple_expense"
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setActiveForm("simple_income")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-semibold border transition-colors cursor-pointer duration-150 text-sm sm:text-base ${
                activeForm === "simple_income"
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setActiveForm("simple_transfer")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-semibold border transition-colors cursor-pointer duration-150 text-sm sm:text-base ${
                activeForm === "simple_transfer"
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
            >
              Transfer
            </button>
            <button
              type="button"
              onClick={() => setActiveForm("payment_broker_transfer")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-semibold border transition-colors cursor-pointer duration-150 text-sm sm:text-base ${
                activeForm === "payment_broker_transfer"
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
            >
              Paynow
            </button>
          </div>

          {activeForm === "simple_expense" && (
            <SimpleExpenseForm onSubmit={handleSubmit} columns={columns} layout={expenseLayout} />
          )}
          {activeForm === "simple_income" && (
            <SimpleIncomeForm onSubmit={handleSubmit} />
          )}
          {activeForm === "simple_transfer" && (
            <SimpleTransferForm onSubmit={handleSubmit} />
          )}
          {activeForm === "payment_broker_transfer" && (
            <PaymentBrokerTransferForm onSubmit={handleSubmit} />
          )}
        </>
      )}
    </div>
  );
};
        