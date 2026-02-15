'use client'

import { motion } from 'framer-motion'
import { Clock, Sparkles, TrendingUp } from 'lucide-react'

// Mock data for recently generated blocks
const recentBlocks = [
  {
    id: 1,
    name: 'Cyberpunk Hero',
    type: 'hero',
    timeAgo: '5m ago',
    thumbnail: '🌃',
    tags: ['dark', 'neon', 'futuristic'],
    isPremium: true,
  },
  {
    id: 2,
    name: 'Minimal Pricing Table',
    type: 'pricing',
    timeAgo: '12m ago',
    thumbnail: '💎',
    tags: ['clean', 'modern', 'saas'],
    isPremium: false,
  },
  {
    id: 3,
    name: 'Glassmorphism Card',
    type: 'features',
    timeAgo: '18m ago',
    thumbnail: '🔮',
    tags: ['glass', 'elegant', 'blur'],
    isPremium: true,
  },
  {
    id: 4,
    name: 'Animated Footer',
    type: 'footer',
    timeAgo: '25m ago',
    thumbnail: '⚡',
    tags: ['animated', 'social', 'links'],
    isPremium: false,
  },
  {
    id: 5,
    name: 'Hero Section Pro',
    type: 'hero',
    timeAgo: '32m ago',
    thumbnail: '🚀',
    tags: ['startup', 'bold', 'cta'],
    isPremium: true,
  },
  {
    id: 6,
    name: '3D Card Gallery',
    type: 'gallery',
    timeAgo: '45m ago',
    thumbnail: '🎨',
    tags: ['3d', 'portfolio', 'hover'],
    isPremium: true,
  },
]

export function FactoryFeed() {
  return (
    <motion.aside
      className="fixed right-0 top-0 h-screen w-80 z-40"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-black/40 via-pink-900/20 to-black/40 backdrop-blur-xl border-l border-white/10" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Factory Feed</h2>
          </div>
          <p className="text-sm text-gray-400">
            Fresh blocks from the AI factory
          </p>
        </div>

        {/* Live indicator */}
        <motion.div
          className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs text-green-400 font-medium">
            Live · Generating new blocks
          </span>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Today</span>
            </div>
            <p className="text-2xl font-bold text-white">47</p>
          </motion.div>
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400">This Week</span>
            </div>
            <p className="text-2xl font-bold text-white">312</p>
          </motion.div>
        </div>

        {/* Blocks feed */}
        <div className="flex-1 overflow-auto space-y-3 hide-scrollbar">
          {recentBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/30 cursor-pointer transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: -5 }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 group-hover:from-purple-500/10 to-transparent rounded-xl transition-all duration-300" />

              <div className="relative flex items-start gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl border border-white/10">
                  {block.thumbnail}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {block.name}
                    </h3>
                    {block.isPremium && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded border border-purple-500/30">
                        Pro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 capitalize">{block.type}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">{block.timeAgo}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {block.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* New badge animation */}
              {index === 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 px-2 py-0.5 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                >
                  NEW
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.button
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white font-medium hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All Blocks →
        </motion.button>
      </div>
    </motion.aside>
  )
}
