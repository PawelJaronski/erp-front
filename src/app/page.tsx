"use client";
import {
  SimpleExpenseForm,
  SimpleTransferForm,
  PaymentBrokerTransferForm,
  SimpleIncomeForm,
} from "@/features/transactions/components";
import React, { useState } from "react";
import { addTransaction } from '@/features/transactions/api';
import { buildTransactionPayload } from '@/shared/utils/payload';
import type { TransactionType } from '@/shared/contracts/transactions';
import { useToast } from '@/shared/components/ToastProvider';

export default function Home() {
  const [activeForm, setActiveForm] = useState<"expense" | "income" | "transfer" | "broker">("expense");
  const { showToast } = useToast();

  const handleSubmit = async (data: unknown) => {
    // Map local activeForm label to TransactionType
    const transactionMap: Record<typeof activeForm, TransactionType> = {
      expense: 'simple_expense',
      income: 'simple_income',
      transfer: 'simple_transfer',
      broker: 'payment_broker_transfer',
    } as const;

    const payload = buildTransactionPayload(
      data as any, // cast to union – validated at runtime by builder
      transactionMap[activeForm],
    );

    try {
      await addTransaction(payload);
      showToast('Transaction saved', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      showToast(msg, 'error');
    }
  };

  return (
    <main className="h-screen overflow-y-auto p-4">
      <div className="space-y-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveForm("expense")}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 ${
              activeForm === "expense"
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("income")}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 ${
              activeForm === "income"
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("transfer")}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 ${
              activeForm === "transfer"
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
            }`}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("broker")}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 ${
              activeForm === "broker"
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
            }`}
          >
            Broker
          </button>
        </div>

        {activeForm === "expense" && (
          <SimpleExpenseForm onSubmit={handleSubmit} onCancel={() => {}} />
        )}
        {activeForm === "income" && (
          <SimpleIncomeForm onSubmit={handleSubmit} onCancel={() => {}} />
        )}
        {activeForm === "transfer" && (
          <SimpleTransferForm onSubmit={handleSubmit} onCancel={() => {}} />
        )}
        {activeForm === "broker" && (
          <PaymentBrokerTransferForm onSubmit={handleSubmit} onCancel={() => {}} />
        )}
      </div>
    </main>
  );
}