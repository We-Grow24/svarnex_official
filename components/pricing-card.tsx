'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Crown, Rocket } from 'lucide-react'
import { useState } from 'react'

interface PricingCardProps {
  name: string
  price: string
  tier: 'free' | 'pro_199' | 'empire_799'
  features: string[]
  recommended?: boolean
  icon: 'zap' | 'crown' | 'rocket'
}

const iconMap = {
  zap: Zap,
  crown: Crown,
  rocket: Rocket
}

export function PricingCard({ name, price, features, recommended = false, icon }: PricingCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const Icon = iconMap[icon]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = (y - centerY) / 10
    const rotateYValue = (centerX - x) / 10

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      className={`relative group ${recommended ? 'md:scale-110 z-10' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Recommended badge */}
      {recommended && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          MOST POPULAR
        </motion.div>
      )}

      {/* The card */}
      <motion.div
        className="relative h-full p-8 rounded-3xl overflow-hidden cursor-pointer"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX,
          rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20" />

        {/* Holographic gradient overlay */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            recommended
              ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20'
              : 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10'
          }`}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ backgroundSize: '200% 200%' }}
        />

        {/* Glow effect on hover */}
        <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${
          recommended 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        }`} />

        {/* Content */}
        <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
          {/* Icon */}
          <motion.div
            className={`inline-flex p-3 rounded-2xl mb-4 ${
              recommended
                ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30'
                : 'bg-white/10'
            }`}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: 'spring' }}
          >
            <Icon className={`w-8 h-8 ${
              recommended ? 'text-purple-300' : 'text-blue-300'
            }`} />
          </motion.div>

          {/* Plan name */}
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>

          {/* Price */}
          <div className="mb-6">
            <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              {price}
            </span>
            {price !== 'Free' && (
              <span className="text-gray-400 ml-2">/month</span>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3 text-gray-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          <motion.button
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              recommended
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {price === 'Free' ? 'Start Free' : 'Get Started'}
          </motion.button>
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-200%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'linear'
          }}
        />
      </motion.div>
    </motion.div>
  )
}
