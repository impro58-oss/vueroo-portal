'use client'

import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, TrendingUp, Activity } from 'lucide-react'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-light tracking-[3px]">
            VUER<span className="font-semibold text-blue-500">OO</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wider">INTELLIGENCE</p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
              <LayoutDashboard size={18} />
              Overview
            </a>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Intelligence</p>
            </div>

            <a href="/dashboard/cryptovue" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
              <TrendingUp size={18} />
              CryptoVue
            </a>

            <a href="/dashboard/neurovue" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
              <Activity size={18} />
              NeuroVue
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
