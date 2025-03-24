'use client';

import { login } from '@/app/auth/actions'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function LoginPage() {
  const { trackEvent } = useAnalytics();

  return (
    <>
      <PageTitle title="Login | CurioCity" description="Sign in to your CurioCity account" />
      
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <div className="w-full max-w-md">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email"
              />
            </div>

            {/* <div>
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div> */}
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                name="password"
                type="password"
                required
                placeholder="******************"
              />
              <Link 
                href="/forgot-password"
                className="text-sm text-blue-500 hover:text-blue-700"
                onClick={() => trackEvent('forgot_password_click', 'engagement', 'Login Page')}
              >
                Forgot password?
              </Link>
            </div>

            {/* <div>
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div> */}
            
            <div className="flex items-center justify-between gap-4">
              <button
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                formAction={async (formData) => {
                  trackEvent('login_attempt', 'engagement', 'Login Form');
                  await login(formData);
                }}
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-gray-600">
              New to CurioCity?{' '}
              <Link 
                href="/signup" 
                className="text-blue-500 hover:text-blue-700 font-semibold"
                onClick={() => trackEvent('signup_click', 'engagement', 'From Login Page')}
              >
                Join Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}