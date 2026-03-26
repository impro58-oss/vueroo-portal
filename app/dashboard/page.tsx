export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your intelligence hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/dashboard/cryptovue" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">LIVE</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">CryptoVue</h3>
          <p className="text-sm text-gray-500">Cryptocurrency market intelligence.</p>
        </a>

        <a href="/dashboard/neurovue" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">LIVE</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">NeuroVue</h3>
          <p className="text-sm text-gray-500">Neurovascular medtech intelligence.</p>
        </a>

        <a href="/stock/" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">LIVE</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">StockVue</h3>
          <p className="text-sm text-gray-500">US stock market intelligence.</p>
        </a>
      </div>
    </div>
  )
}
