'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const Calculator = () => {
  const [amount, setAmount] = useState('')
  const [estimatedReturns, setEstimatedReturns] = useState(0)

  const calculateReturns = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      // This is a simplified calculation. Replace with your actual calculation logic.
      const returns = numValue * 0.05 // Assuming 5% APY
      setEstimatedReturns(returns)
    } else {
      setEstimatedReturns(0)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    calculateReturns(value)
  }

  return (
    <section id="calculator" className="py-20 bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Quick Calculator
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Estimate your potential returns with Tutum
          </p>
        </motion.div>
        <motion.div 
          className="bg-gray-800 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Enter amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-4 py-2 rounded-full bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="0.00"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Estimated Returns (Yearly)</h3>
            <motion.p 
              className="text-2xl font-bold text-indigo-400"
              key={estimatedReturns}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {estimatedReturns.toFixed(2)}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Calculator

