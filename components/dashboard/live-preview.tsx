'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Smartphone, Tablet, RefreshCw, Edit2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useBlockEditor, type Block } from '@/lib/store/block-editor'

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

export function LivePreview() {
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { blocks, selectBlock } = useBlockEditor()

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Live Preview</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Published</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport toggles */}
          {Object.entries(viewportSizes).map(([key, { icon: Icon }]) => (
            <motion.button
              key={key}
              onClick={() => setViewport(key as ViewportSize)}
              className={`
                p-2 rounded-lg transition-all
                ${viewport === key 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
            </motion.button>
          ))}

          {/* Refresh button */}
          <motion.button
            onClick={handleRefresh}
            className="ml-2 p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-900 to-black hide-scrollbar">
        <motion.div
          className="mx-auto h-full"
          style={{
            maxWidth: viewportSizes[viewport].width,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={viewport}
          transition={{ duration: 0.3 }}
        >
          {/* Mock browser chrome */}
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-t-xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 ml-4 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              <span className="text-xs text-gray-400">https://yoursite.svarnex.app</span>
            </div>
          </div>

          {/* Website Preview with Blocks */}
          <div className="bg-white rounded-b-xl overflow-hidden shadow-2xl min-h-[600px]">
            {blocks.length > 0 ? (
              <div className="space-y-0">
                {blocks.map((block) => (
                  <BlockPreview
                    key={block.id}
                    block={block}
                    onClick={() => selectBlock(block)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================
// Block Preview Component
// ============================================

interface BlockPreviewProps {
  block: Block;
  onClick: () => void;
}

function BlockPreview({ block, onClick }: BlockPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Render block based on type with live config data
  const renderBlockContent = () => {
    switch (block.type) {
      case 'navbar':
        return <NavbarBlock config={block.config} />;
      case 'hero':
        return <HeroBlock config={block.config} />;
      case 'features':
        return <FeaturesBlock config={block.config} />;
      case 'pricing':
        return <PricingBlock config={block.config} />;
      case 'footer':
        return <FooterBlock config={block.config} />;
      default:
        return <GenericBlock block={block} />;
    }
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Edit overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-purple-500/10 border-2 border-purple-500 z-10 flex items-center justify-center backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              Edit {block.name}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block content */}
      <div className="relative">
        {renderBlockContent()}
      </div>

      {/* Block label (only visible on hover) */}
      {isHovered && (
        <div className="absolute top-2 left-2 z-20 px-3 py-1 rounded-full bg-black/80 text-white text-xs font-medium">
          {block.type} • {block.name}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Block Type Components (Mock Renders)
// ============================================

function NavbarBlock({ config }: { config: any }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-bold" style={{ color: config.brandColor || '#000' }}>
          {config.brandName || 'Brand'}
        </div>
        <div className="flex gap-6">
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <span key={item} className="text-gray-600 hover:text-gray-900 cursor-pointer">
              {item}
            </span>
          ))}
        </div>
        <button
          className="px-4 py-2 rounded-lg font-medium"
          style={{
            backgroundColor: config.buttonColor || '#8B5CF6',
            color: 'white',
          }}
        >
          {config.ctaText || 'Get Started'}
        </button>
      </div>
    </div>
  );
}

function HeroBlock({ config }: { config: any }) {
  return (
    <div
      className="py-20 px-4"
      style={{
        backgroundColor: config.backgroundColor || '#F9FAFB',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1
          className="text-5xl font-bold mb-6"
          style={{ color: config.titleColor || '#111827' }}
        >
          {config.title || 'Welcome to Your Website'}
        </h1>
        <p
          className="text-xl mb-8"
          style={{ color: config.subtitleColor || '#6B7280' }}
        >
          {config.subtitle || 'Build amazing websites in minutes'}
        </p>
        <button
          className="px-8 py-3 rounded-lg font-semibold text-lg"
          style={{
            backgroundColor: config.ctaColor || '#8B5CF6',
            color: 'white',
          }}
        >
          {config.ctaText || 'Get Started'}
        </button>
      </div>
    </div>
  );
}

function FeaturesBlock({ config }: { config: any }) {
  const features = config.features || [
    { title: 'Feature 1', description: 'Amazing feature description' },
    { title: 'Feature 2', description: 'Another great feature' },
    { title: 'Feature 3', description: 'One more awesome feature' },
  ];

  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ color: config.headingColor || '#111827' }}
        >
          {config.heading || 'Features'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: config.iconColor || '#8B5CF6' }}
              >
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingBlock({ config }: { config: any }) {
  const plans = config.plans || [
    { name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'] },
    { name: 'Pro', price: '$29', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { name: 'Enterprise', price: '$99', features: ['All Features'] },
  ];

  return (
    <div className="py-16 px-4" style={{ backgroundColor: config.backgroundColor || '#F9FAFB' }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {config.heading || 'Pricing Plans'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, index: number) => (
            <div
              key={index}
              className="p-6 rounded-xl border-2"
              style={{
                borderColor: config.borderColor || '#E5E7EB',
                backgroundColor: 'white',
              }}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-4">{plan.price}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: config.buttonColor || '#8B5CF6',
                  color: 'white',
                }}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FooterBlock({ config }: { config: any }) {
  return (
    <div
      className="py-12 px-4"
      style={{ backgroundColor: config.backgroundColor || '#111827' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div
              className="text-xl font-bold mb-4"
              style={{ color: config.brandColor || '#FFFFFF' }}
            >
              {config.brandName || 'Brand'}
            </div>
            <p className="text-gray-400 text-sm">
              {config.description || 'Building the future, one block at a time.'}
            </p>
          </div>
          {['Product', 'Company', 'Resources'].map((section) => (
            <div key={section}>
              <div className="text-white font-semibold mb-4">{section}</div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Link 1</li>
                <li>Link 2</li>
                <li>Link 3</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          {config.copyright || '© 2026 Brand. All rights reserved.'}
        </div>
      </div>
    </div>
  );
}

function GenericBlock({ block }: { block: Block }) {
  return (
    <div className="py-12 px-4 bg-gray-50 border-t border-b border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-purple-100 flex items-center justify-center">
          <span className="text-2xl">🧩</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{block.name}</h3>
        <p className="text-gray-600">Type: {block.type}</p>
        <pre className="mt-4 p-4 bg-white rounded-lg text-left text-xs overflow-auto max-h-32">
          {JSON.stringify(block.config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[600px] bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <motion.div
          className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Monitor className="w-16 h-16 text-purple-600" />
        </motion.div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Blocks Yet</h3>
          <p className="text-gray-600">
            Add blocks to your project to see them here
          </p>
        </div>

        <motion.button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Your First Block
        </motion.button>
      </div>
    </div>
  );
}
