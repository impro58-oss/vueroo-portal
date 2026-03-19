import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('vueroo-session')
  
  if (!sessionCookie?.value) {
    redirect('/login')
  }

  return <DashboardShell>{children}</DashboardShell>
}
