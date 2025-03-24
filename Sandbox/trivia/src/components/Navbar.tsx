import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Add or update the type definition to include the segment prop
interface NavbarProps {
  segment?: string;
}

export default async function Navbar({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  segment: _segment 
}: NavbarProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('Current user state:', !!user)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div>
            <Link href="/" className="text-xl font-bold text-blue-700">
              CurioCity
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            {user ? (
              <>
                {/* History Link */}
                <Link
                  href="/history"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>History</span>
                </Link>

                {/* Favorites Link */}
                <Link
                  href="/favorites"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Favorites</span>
                </Link>

                {/* Sign Out Button */}
                <form action={signOut}>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 