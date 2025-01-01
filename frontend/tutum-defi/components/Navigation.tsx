'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-white text-2xl font-bold">
            tutum
          </Link>
          
          <div className="flex items-center space-x-4">
            {!isDashboard && (
              <>
                <Link href="#how-it-works" className="text-gray-300 hover:text-white">
                  How It Works
                </Link>
                <Link href="#calculator" className="text-gray-300 hover:text-white">
                  Calculator
                </Link>
                <Link 
                  href="/dashboard" 
                  className="btn-primary"
                >
                  Launch App
                </Link>
              </>
            )}
            {isDashboard && (
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white"
              >
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation