import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ERP Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/finance/add-transaction"
          className="block p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Add Transaction</h2>
          <p>Record new financial transactions</p>
        </Link>
        
        <Link 
          href="/finance/transactions"
          className="block p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">View Transactions</h2>
          <p>Browse and filter transaction history</p>
        </Link>
      </div>
    </div>
  )
}