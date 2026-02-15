'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Crown,
  Zap
} from 'lucide-react'

const menuItems = [
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
  { icon: LogOut, label: 'Sign Out', href: '/logout', danger: true },
]

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="fixed top-6 right-96 z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="relative">
        {/* 3D Avatar Button */}
        <motion.div
          className="relative cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            rotateY: isOpen ? 180 : 0,
          }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20 
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            perspective: 1000
          }}
        >
          {/* Avatar container with glassmorphism */}
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20" />
            
            {/* Animated gradient ring */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100"
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

            {/* Avatar image/icon */}
            <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <span className="text-2xl font-bold text-white">J</span>
            </div>

            {/* Premium badge */}
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-black"
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Crown className="w-3 h-3 text-white" />
            </motion.div>

            {/* Active indicator */}
            <div className="absolute -bottom-1 -right-1">
              <div className="relative">
                <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-black" />
                <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Expanded Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full right-0 mt-4 w-72"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glassmorphism card */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/50 to-black/90 backdrop-blur-2xl border border-white/20" />
                
                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-50"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                />

                {/* Content */}
                <div className="relative z-10 p-6">
                  {/* User info */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Large avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl font-bold text-white">
                        J
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          John Doe
                        </h3>
                        <p className="text-sm text-gray-400">
                          john@example.com
                        </p>
                      </div>
                    </div>

                    {/* Plan badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-white">Pro Plan</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-bold">247</span>
                        <span className="text-xs text-gray-400">credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <nav className="space-y-1 mb-4">
                    {menuItems.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <motion.a
                          key={item.label}
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl
                            transition-all duration-200
                            ${item.danger 
                              ? 'text-red-400 hover:bg-red-500/10 hover:border-red-500/20' 
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                            }
                            border border-transparent hover:border-white/10
                          `}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className={`
                            p-2 rounded-lg
                            ${item.danger 
                              ? 'bg-red-500/10' 
                              : 'bg-white/5'
                            }
                          `}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </motion.a>
                      )
                    })}
                  </nav>

                  {/* Upgrade CTA (for non-premium users) */}
                  {/* <motion.button
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                  </motion.button> */}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
