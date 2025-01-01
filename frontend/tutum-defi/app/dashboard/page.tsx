'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import LendingDashboard from '@/components/LendingDashboard'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts'

export default function DashboardPage() {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [error, setError] = useState<string>('')
  const { address, isConnected } = useAccount()

  useEffect(() => {
    const initContract = async () => {
      if (isConnected && address && typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const signer = provider.getSigner()
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          )
          setContract(contract)
          setError('')
        } catch (err) {
          console.error("Error initializing contract:", err)
          setError('Failed to initialize contract')
        }
      }
    }

    if (isConnected && address) {
      initContract()
    }
  }, [isConnected, address])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-900 pt-16">
        <div className="container mx-auto px-4 py-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-8 text-red-500"
            >
              {error}
            </motion.div>
          )}

          {!isConnected ? (
            <motion.div 
              className="flex flex-col items-center justify-center min-h-[60vh]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-white mb-8 text-gradient">
                Connect Your Wallet
              </h1>
              <w3m-button />
            </motion.div>
          ) : (
            contract && address && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <LendingDashboard 
                  contract={contract}
                  address={address}
                />
              </motion.div>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}