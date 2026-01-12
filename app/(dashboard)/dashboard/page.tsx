import { requireAuth } from "@/app/lib/dal";

export default async function DashboardPage() {
  const session = await requireAuth();

  // Dummy account data
  const accounts = [
    {
      name: "Chequing Account",
      number: "****1234",
      balance: 12458.92,
      type: "chequing",
    },
    {
      name: "Savings Account",
      number: "****5678",
      balance: 45230.15,
      type: "savings",
    },
    {
      name: "TFSA",
      number: "****9012",
      balance: 28750.0,
      type: "tfsa",
    },
    {
      name: "RRSP",
      number: "****3456",
      balance: 89125.5,
      type: "rrsp",
    },
  ];

  // Dummy recent transactions
  const transactions = [
    {
      id: 1,
      description: "Amazon.ca",
      amount: -156.99,
      date: "2026-01-09",
      category: "Shopping",
    },
    {
      id: 2,
      description: "Payroll Deposit",
      amount: 3250.0,
      date: "2026-01-08",
      category: "Income",
    },
    {
      id: 3,
      description: "Hydro One",
      amount: -145.23,
      date: "2026-01-07",
      category: "Utilities",
    },
    {
      id: 4,
      description: "Loblaws",
      amount: -89.45,
      date: "2026-01-06",
      category: "Groceries",
    },
    {
      id: 5,
      description: "E-Transfer from John",
      amount: 200.0,
      date: "2026-01-05",
      category: "Transfer",
    },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s an overview of your accounts
        </p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-indigo-100 text-sm font-medium">Total Balance</p>
        <p className="text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
        <p className="text-indigo-200 text-sm mt-2">Across all accounts</p>
      </div>

      {/* Account Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <div
              key={account.number}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{account.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{account.number}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    account.type === "chequing"
                      ? "bg-blue-100 text-blue-700"
                      : account.type === "savings"
                      ? "bg-green-100 text-green-700"
                      : account.type === "tfsa"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {account.type.toUpperCase()}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">
                {formatCurrency(account.balance)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v12m6-6H6"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {tx.category} • {tx.date}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    tx.amount > 0 ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
