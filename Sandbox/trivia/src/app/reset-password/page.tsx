import { resetPassword } from '../auth/actions'

// Define the types for the props
type SearchParams = Promise<{ code?: string; error?: string }>

export default async function ResetPasswordPage(props: {
  searchParams: SearchParams
}) {
  // Await the searchParams Promise
  const searchParams = await props.searchParams
  // Check for error message
  const error = searchParams.error
  const code = searchParams.code

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
              {error.replace(/\+/g, ' ')}
            </div>
          )}
          <input 
            type="hidden" 
            name="code" 
            value={code} 
          />
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              New Password
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
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="******************"
            />
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              formAction={resetPassword}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 