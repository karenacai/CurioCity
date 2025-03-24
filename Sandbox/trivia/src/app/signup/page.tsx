import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'

export default function SignUpPage() {
  return (
    <>
      <PageTitle title="Sign Up | CurioCity" description="Create a new account on CurioCity" />
      
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
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <button
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                formAction={signup}
              >
                Sign up
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-gray-600">
              Already on CurioCity?{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 