'use client'

import { motion } from 'framer-motion'

const steps = [
  { 
    title: 'Connect Wallet', 
    description: 'Connect your Web3 wallet to start participating in SME lending'
  },
  { 
    title: 'Deposit USDT', 
    description: 'Invest between 3,000 to 10,000 USDT in the lending pool' 
  },
  { 
    title: '90-Day Lock Period', 
    description: 'Funds are locked for 90 days while being used for SME loans' 
  },
  { 
    title: 'Earn 19% APY', 
    description: 'Earn stable returns through tokenized SME loan interest' 
  },
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

