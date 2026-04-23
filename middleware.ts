import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('vueroo-session')
  const isLoggedIn = !!sessionCookie?.value
  const { pathname } = request.nextUrl

  // Static pages that don't require auth
  const publicPaths = ['/trading', '/crypto', '/stock', '/research', '/quantvue', '/neuro', '/medtech', '/cyclevue', '/cyclevue-pro']
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  if (isPublicPath) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/trading/:path*', '/crypto/:path*', '/stock/:path*', '/research/:path*', '/quantvue/:path*', '/neuro/:path*', '/medtech/:path*', '/cyclevue/:path*', '/cyclevue-pro/:path*'],
}