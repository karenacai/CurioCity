import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="mb-4 text-gray-600">
          We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
        </p>
        <Link 
          href="/login"
          className="text-blue-500 hover:text-blue-700"
        >
          Back to Sign in
        </Link>
      </div>
    </div>
  )
} 