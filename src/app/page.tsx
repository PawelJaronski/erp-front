"use client";
import {
  SimpleExpenseForm,
  SimpleTransferForm,
  PaymentBrokerTransferForm,
  SimpleIncomeForm,
} from "@/features/transactions/components";
import React, { useState } from "react";
import { addTransaction } from '@/features/transactions/api';
import { buildTransactionPayload, AnyFormData } from '@/shared/utils/payload';
import { useToast } from '@/shared/components/ToastProvider';

export default function Home() {
  const [activeForm, setActiveForm] = useState<"simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer">("simple_expense");
  const { showToast } = useToast();

  const handleSubmit = async (data: unknown) => {

    const payload = buildTransactionPayload(
      data as AnyFormData,
      activeForm,
    );

    try {
      await addTransaction(payload);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      showToast(msg, 'error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
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
          <SimpleExpenseForm onSubmit={handleSubmit} />
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
      </div>
    </main>
  );
}