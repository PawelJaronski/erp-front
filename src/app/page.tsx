"use client";
import SimpleTransactionForm from "@/components/SimpleTransactionForm";
import {
  SimpleExpenseForm,
  SimpleTransferForm,
} from "@/features/transactions/components";
import React, { useState } from "react";
import PaymentBrokerTransferForm from "@/components/PaymentBrokerTransferForm";

const dummySubmit = async () => {
  // TODO: connect backend
};

export default function Home() {
  const useNew = process.env.NEXT_PUBLIC_NEW_FORMS === "1";

  const [activeForm, setActiveForm] = useState<"expense" | "transfer" | "broker">("expense");

  return (
    <main className="h-screen overflow-y-auto p-4">
      {useNew ? (
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
            <SimpleExpenseForm onSubmit={dummySubmit} onCancel={() => {}} />
          )}
          {activeForm === "transfer" && (
            <SimpleTransferForm onSubmit={dummySubmit} onCancel={() => {}} />
          )}
          {activeForm === "broker" && (
            <PaymentBrokerTransferForm onSubmit={dummySubmit} onCancel={() => {}} />
          )}
        </div>
      ) : (
        <SimpleTransactionForm />
      )}
    </main>
  );
}