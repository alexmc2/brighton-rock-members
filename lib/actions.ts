'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return 'Email and password are required'
    }

    console.log('Attempting to sign in with email:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return error.message
    }

    if (!data?.session) {
      console.error('No session returned from Supabase')
      return 'Authentication failed'
    }

    console.log('Sign in successful, setting session cookie')

    // Store the session in an HTTP-only cookie
    cookies().set('session', JSON.stringify(data.session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Return success instead of redirecting
    return { success: true }

  } catch (error) {
    console.error('Unexpected error during authentication:', error)
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred during sign in'
  }
} 