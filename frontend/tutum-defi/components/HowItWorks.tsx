'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const steps = [
  { title: 'Connect Wallet', description: 'Link your Web3 wallet to get started' },
  { title: 'Deposit Assets', description: 'Transfer your crypto assets to the platform' },
  { title: 'Choose Lending Options', description: 'Select from various lending opportunities' },
  { title: 'Earn Interest', description: 'Watch your assets grow over time' },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            How It Works
          </h2>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700" />
          </div>
          <ul className="relative flex justify-between">
            {steps.map((step, index) => (
              <motion.li 
                key={step.title} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {index + 1}
                  </motion.div>
                  <h3 className="mt-6 text-lg font-medium text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 max-w-[200px]">{step.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

