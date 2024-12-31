'use client'

import { Shield, Lock, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

const securityFeatures = [
  {
    title: 'Audited Smart Contracts',
    description: 'Our smart contracts are regularly audited by top security firms',
    icon: Shield,
  },
  {
    title: 'Multi-Sig Wallets',
    description: 'We use multi-signature wallets for enhanced fund security',
    icon: Lock,
  },
  {
    title: 'Transparent Operations',
    description: 'All platform activities are visible on the blockchain for full transparency',
    icon: Eye,
  },
]

const SecurityFeatures = () => {
  return (
    <section id="security" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Security Features
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Your assets are protected by industry-leading security measures
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((feature, index) => (
            <motion.div 
              key={feature.title} 
              className="bg-gray-800 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-600 text-white mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SecurityFeatures

