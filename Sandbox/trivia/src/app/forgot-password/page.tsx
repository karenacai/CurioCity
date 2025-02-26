import { requestPasswordReset } from '../auth/actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
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
              placeholder="Enter your email"
            />
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              formAction={requestPasswordReset}
            >
              Send Reset Link
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-500 hover:text-blue-700">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 