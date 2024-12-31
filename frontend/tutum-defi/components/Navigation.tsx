'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full bg-gray-900 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-2xl font-bold">
              tutum
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="#how-it-works" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">How It Works</Link>
              <Link href="#calculator" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Calculator</Link>
              <Link href="#security" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Security</Link>
              <Link href="#faq" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">FAQ</Link>
              <button className="btn-primary">Connect Wallet</button>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="#how-it-works" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">How It Works</Link>
            <Link href="#calculator" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Calculator</Link>
            <Link href="#security" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Security</Link>
            <Link href="#faq" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">FAQ</Link>
            <button className="btn-primary w-full text-center mt-4">Connect Wallet</button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation

