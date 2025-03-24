'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  // console.log("======Login Attempted!!!!=========")
  // console.log("error", error)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?error=Signup failed')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function requestPasswordReset(formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  const email = formData.get('email') as string

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=${encodeURIComponent('/reset-password')}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  })
  
  console.log("Sending reset email with redirectTo:", `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm?next=/reset-password`)

  if (error) {
    console.error('Reset email error:', error)
    redirect('/forgot-password?error=Failed to send reset email')
  }

  redirect('/forgot-password/confirmation')
}

export async function resetPassword(formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/reset-password?error=Passwords do not match')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error('Password update error:', error)
    redirect('/reset-password?error=Failed to reset password')
  }

  redirect('/login?message=Password successfully reset')
} 