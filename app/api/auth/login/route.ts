import { verifyPassword } from '@/lib/auth'
import { SessionData, sessionOptions } from '@/lib/session'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const isValid = await verifyPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const cookieStore = cookies()
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
