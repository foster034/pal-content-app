import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback', '/tech/login', '/tech-auth', '/tech/setup', '/job-report', '/api/job-submissions', '/api/test-db', '/api/tech-auth', '/api/login-settings', '/api/magic-links', '/api/consent', '/api/privacy-policy']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Allow public routes and root
  if (isPublicRoute || request.nextUrl.pathname === '/') {
    return response
  }

  // Special handling for tech routes - they use a different auth system
  if (request.nextUrl.pathname.startsWith('/tech')) {
    // For tech routes, check if there's a tech_session cookie or allow through
    // Tech authentication is handled client-side via localStorage
    const techSessionCookie = request.cookies.get('tech_session')

    // If there's a tech session cookie, allow access
    if (techSessionCookie) {
      return response
    }

    // If no tech session and no regular session, redirect to tech login
    if (!session) {
      return NextResponse.redirect(new URL('/tech-auth', request.url))
    }

    // If there's a regular session, check if it's a tech user
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, franchisee_id')
      .eq('id', session.user.id)
      .single()

    // If user has tech role in profiles, allow access
    if (profile && profile.role === 'tech') {
      return response
    }

    // If no tech role, redirect to tech auth for login code entry
    return NextResponse.redirect(new URL('/tech-auth', request.url))
  }

  // Redirect to login if no session for non-tech routes
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Get user profile for role-based access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, franchisee_id')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const pathname = request.nextUrl.pathname

  // Role-based route protection
  if (pathname.startsWith('/admin') && profile.role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/franchisee') && !['admin', 'franchisee'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/tech') && !['admin', 'tech'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Special handling for techs who haven't completed setup
  if (pathname.startsWith('/tech') && profile.role === 'tech' && !pathname.startsWith('/tech/setup')) {
    const userMetadata = session.user.user_metadata;
    // Only redirect to setup if explicitly marked as incomplete AND we have the required IDs
    if (userMetadata?.setup_completed === false) {
      const technicianId = userMetadata?.technician_id;
      const franchiseeId = userMetadata?.franchisee_id;
      if (technicianId && franchiseeId) {
        return NextResponse.redirect(new URL(`/tech/setup?technician_id=${technicianId}&franchise_id=${franchiseeId}`, request.url));
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}