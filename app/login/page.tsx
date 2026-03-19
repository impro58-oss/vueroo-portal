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

      {/* Image Section - RIGHT */}
      <div 
        className="flex-1 bg-cover bg-center relative order-2"
        style={{ backgroundImage: `url('/login-bg.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
      </div>
    </div>
  )
}
