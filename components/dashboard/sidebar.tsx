'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Boxes, 
  FolderOpen, 
  Sparkles,
  Settings,
  CreditCard,
  Plus
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Block Library', href: '/dashboard/library', icon: Boxes },
  { name: 'AI Generator', href: '/dashboard/generate', icon: Sparkles },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-64 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-purple-900/20 to-black/40 backdrop-blur-xl border-r border-white/10" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col p-6">
        {/* Logo */}
        <Link href="/dashboard" className="mb-12">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                SVARNEX
              </h1>
              <p className="text-xs text-gray-400">Factory</p>
            </div>
          </motion.div>
        </Link>

        {/* New Project Button */}
        <Link href="/create">
          <motion.button
            className="mb-8 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={`
                      relative flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                    whileHover={{ x: 5 }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                        layoutId="activeTab"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className={`
                      relative z-10 p-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                        : 'bg-white/5 group-hover:bg-white/10'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Label */}
                    <span className="relative z-10 font-medium">
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Credits Display */}
        <motion.div
          className="mt-auto p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Credits</span>
            <span className="text-xs text-purple-400">Pro Plan</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">247</span>
            <span className="text-gray-400 mb-1">/500</span>
          </div>
          <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: '49.4%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </motion.aside>
  )
}
