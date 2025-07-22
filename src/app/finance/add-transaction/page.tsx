"use client";
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
import { TransactionFormContainer } from "@/features/transactions/components/TransactionFormContainer";

export default function AddTransactionPage() {
    return (
        <main className="min-h-screen py-12">
          <TransactionFormContainer 
            className="bg-white rounded-lg p-8 w-full max-w-2xl mx-auto" 
            columns={2}
          />
        </main>
    );
}