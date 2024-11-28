import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // If user is signed in and tries to access login page, redirect them to home
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is not signed in and tries to access protected routes, redirect to login
  if (!session && request.nextUrl.pathname !== '/login') {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Only run middleware on specific routes
export const config = {
  matcher: [
    /*
     * Match only the specific routes we want to protect:
     * - dashboard and its nested routes
     * - login page
     */
    '/dashboard/:path*',
    '/rents/:path*',
    '/members/:path*',
    '/maintenance/:path*',
    '/documents/:path*',
    '/settings/:path*',
    '/login',
    '/'
  ]
} 