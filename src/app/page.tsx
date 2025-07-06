import SimpleTransactionForm from "@/components/SimpleTransactionForm";
import { SimpleExpenseForm } from "@/features/transactions/components";

const dummySubmit = async () => {
  // TODO: connect backend
};

export default function Home() {
  const useNew = process.env.NEXT_PUBLIC_NEW_FORMS === "1";

  return (
    <main className="h-screen overflow-y-auto p-4">
      {useNew ? (
        <SimpleExpenseForm onSubmit={dummySubmit} onCancel={() => {}} />
      ) : (
        <SimpleTransactionForm />
      )}
    </main>
  );
}