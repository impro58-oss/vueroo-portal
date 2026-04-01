export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your intelligence hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. CycleVue Pro - Advanced Economic Cycles */}
        <a href="/cyclevue-pro/" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border-2 border-purple-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">PRO</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">CycleVue Pro</h3>
          <p className="text-sm text-gray-500">Advanced macro cycle intelligence + Crucix feed.</p>
        </a>

        {/* 2. CycleVue - Economic Cycles */}
        <a href="/dashboard/cyclevue" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">PATTERN</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">CycleVue</h3>
          <p className="text-sm text-gray-500">Economic cycle intelligence (1924-2124).</p>
        </a>

        {/* 2. CryptoVue - Crypto Markets */}
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

        {/* AgentVue Swarm - Multi-Agent Trading */}
        <a href="/agentvue" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border-2 border-pink-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">AGENTS</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AgentVue Swarm</h3>
          <p className="text-sm text-gray-500">5-agent consensus trading on 50 cryptos.</p>
        </a>

        {/* 3. StockVue - US Stocks */}
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

        {/* 4. Research Intelligence — NEW */}
        <a href="/research/" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">NEW</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Research Intelligence</h3>
          <p className="text-sm text-gray-500">Consulting, Smart Money & Idea Pipeline.</p>
        </a>

        {/* 5. NeuroVue - MedTech */}
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

        {/* 6. Crucix - External Intelligence Feed */}
        <a href="https://www.crucix.live/" target="_blank" rel="noopener noreferrer" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">EXTERNAL</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Crucix</h3>
          <p className="text-sm text-gray-500">27-source global intelligence feed.</p>
        </a>
      </div>
    </div>
  )
}
