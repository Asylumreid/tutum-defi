'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useAnimation } from 'framer-motion'

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [apyRate, setApyRate] = useState(0)
  const [tvl, setTvl] = useState(0)
  const controls = useAnimation()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    })

    const apyInterval = setInterval(() => {
      setApyRate(prev => {
        const next = prev + 0.5
        return next > 19 ? 19 : next
      })
    }, 50)

    const tvlInterval = setInterval(() => {
      setTvl(prev => {
        const next = prev + 1000000
        return next > 100000000 ? 100000000 : next
      })
    }, 30)

    return () => {
      clearInterval(apyInterval)
      clearInterval(tvlInterval)
    }
  }, [controls])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"
          style={{
            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
          }}
        ></div>
      </div>
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
        >
          Hybrid Lending Fintech
        </motion.h1>
        <motion.p 
          className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.2 }}
        >
          Tutum is a pioneering Web 2.5 company bridging the divide between blockchain technology and traditional finance
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-12 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-400 mb-1">
              {apyRate.toFixed(1)}%
            </p>
            <p className="text-lg md:text-xl text-gray-400">APY Rate</p>
          </div>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-400 mb-1">
              ${(tvl / 1000000).toFixed(1)}M
            </p>
            <p className="text-lg md:text-xl text-gray-400">Total Value Locked</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.6 }}
        >
          <Link href="#get-started" className="btn-primary text-lg">
            Start Earning Today
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero

