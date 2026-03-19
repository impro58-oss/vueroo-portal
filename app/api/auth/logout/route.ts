import { SessionData, sessionOptions } from '@/lib/session'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  session.destroy()
  return NextResponse.json({ success: true })
}
