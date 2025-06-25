import SimpleExpenseForm from "@/components/SimpleExpenseForm";

export default function Home() {
  return (
    <main>
      <h1 className="bg-red-500 text-white p-4">ERP App</h1>
      <SimpleExpenseForm />
    </main>
    
  );
}