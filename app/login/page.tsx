import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('vueroo-session')
  
  if (sessionCookie?.value) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Login Section - LEFT */}
      <div className="w-[420px] bg-white flex flex-col justify-center px-12 shadow-[20px_0_60px_rgba(0,0,0,0.3)] order-1">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-[4px] text-gray-900">
            VUER<span className="font-semibold text-blue-600">OO</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 tracking-[2px] uppercase">
            Intelligence Platform
          </p>
          <p className="text-xs text-gray-400 mt-4 italic">
            "Intelligence for the Sovereign Investor"
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Private Access Only
          </p>
        </div>
      </div>

      {/* Image Section - RIGHT with Text on LEFT side - NO OVERLAY */}
      <div 
        className="flex-1 bg-cover bg-center relative order-2"
        style={{ backgroundImage: `url('/login-bg.png')` }}
      >
        {/* Text positioned on LEFT side of the image - BLUE TEXT */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          <div className="text-blue-600 pl-16 pr-8 max-w-md">
            <h2 className="text-4xl font-light tracking-wider mb-6">
              Market Intelligence
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Real-time insights across crypto, medtech, and emerging markets.
            </p>
            <div className="flex items-center gap-8 mt-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-light">50+</div>
                <div>Crypto Assets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light">24/7</div>
                <div>Live Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
