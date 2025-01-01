'use client'

import { 
  Building2, 
  LineChart, 
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Traditional Finance Integration',
    description: 'Bridge between blockchain technology and SME lending',
    icon: Building2,
  },
  {
    title: 'High Margin Returns',
    description: '33% annual returns through pro-rated interest',
    icon: LineChart,
  },
  {
    title: 'Quick Repayment Cycles',
    description: 'Loan tenure capped at 3 months for faster returns',
    icon: Clock,
  },
]


const KeyFeatures = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Key Features
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title} 
              className="pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flow-root bg-gray-800 rounded-2xl px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-white tracking-tight">{feature.title}</h3>
                  <p className="mt-5 text-base text-gray-400">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KeyFeatures

