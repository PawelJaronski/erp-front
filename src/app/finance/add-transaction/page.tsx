"use client";
import { TransactionFormContainer } from "@/features/transactions/components/forms/TransactionFormContainer";

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