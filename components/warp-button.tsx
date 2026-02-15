'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export function WarpButton() {
  const [isWarping, setIsWarping] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    setIsWarping(true)
    
    // Trigger warp animation, then navigate
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  return (
    <>
      {/* Warp effect overlay */}
      {isWarping && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Radial warp lines */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              style={{
                width: '2px',
                transformOrigin: 'left center',
                rotate: `${(i * 360) / 20}deg`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: [0, 100, 200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.02,
                ease: 'easeOut'
              }}
            />
          ))}
          
          {/* Center flash */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 3],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {/* The button */}
      <motion.button
        onClick={handleClick}
        disabled={isWarping}
        className="relative group px-12 py-5 text-xl font-bold text-white overflow-hidden rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ backgroundSize: '200% 200%' }}
        />

        {/* Glow effect - neon blue on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 blur-xl opacity-50 group-hover:from-blue-500 group-hover:via-cyan-400 group-hover:to-blue-500 group-hover:opacity-100 transition-all duration-300" />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 1
          }}
        />

        {/* Button content */}
        <span className="relative flex items-center gap-3 z-10">
          <Sparkles className="w-6 h-6" />
          INITIALIZE SYSTEM
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ✨
          </motion.span>
        </span>

        {/* Border glow */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" />
      </motion.button>
    </>
  )
}
