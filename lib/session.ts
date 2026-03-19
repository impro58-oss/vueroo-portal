import type { SessionOptions } from 'iron-session'

export interface SessionData {
  isLoggedIn: boolean
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
}

const sessionSecret = process.env.SESSION_SECRET || 'default-secret-for-development-only-change-this-make-it-long'

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: 'vueroo-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
  },
}
