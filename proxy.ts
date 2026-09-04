import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const cabinetCookie = 'blesk_cabinet'

export function proxy(request: NextRequest) {
  const authenticated = Boolean(request.cookies.get(cabinetCookie)?.value)

  if (request.nextUrl.pathname === '/vhod' && authenticated) {
    return NextResponse.redirect(new URL('/lk', request.url))
  }

  if (request.nextUrl.pathname === '/lk' && !authenticated) {
    return NextResponse.redirect(new URL('/vhod', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/vhod', '/lk'],
}
