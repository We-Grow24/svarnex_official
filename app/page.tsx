'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { WarpButton } from '@/components/warp-button'
import { PricingCard } from '@/components/pricing-card'
import { ArrowRight, Sparkles, Zap, Boxes, Code2 } from 'lucide-react'
import { Suspense } from 'react'

// Dynamically import 3D scene - NEVER render on server
const Scene3D = dynamic(
  () => import('@/components/3d-scene').then(mod => ({ default: mod.Scene3D })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
      </div>
    )
  }
)

export default function LandingPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  const headline = 'The Last Website You Will Ever Need'.split(' ')

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* High-End 3D Glassmorphism Background */}
      <Scene3D />

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-transparent to-black -z-10" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          className="max-w-6xl mx-auto text-center space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow text */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold tracking-wider uppercase text-sm">
              AI-Powered Website Factory
            </span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>

          {/* Main Headline - Massive & Cinematic */}
          <div className="space-y-4">
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-black leading-none"
              variants={containerVariants}
            >
              {headline.map((word, wordIndex) => (
                <motion.span
                  key={wordIndex}
                  className="inline-block mr-4 md:mr-6"
                  variants={letterVariants}
                  transition={{
                    duration: 0.5,
                    delay: wordIndex * 0.1,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  }}
                >
                  {wordIndex === 0 || wordIndex === 1 ? (
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
                      {word}
                    </span>
                  ) : wordIndex === 2 || wordIndex === 3 ? (
                    <span className="text-white">{word}</span>
                  ) : (
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-transparent bg-clip-text">
                      {word}
                    </span>
                  )}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              An autonomous AI factory that generates stunning React components.
              <br />
              Build, customize, and deploy in seconds. Not hours.
            </motion.p>
          </div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 pt-8">
            <WarpButton />
            
            {/* Stats */}
            <motion.div
              className="flex items-center gap-8 text-sm text-gray-400"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>1000+ Components Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Deploy in 30 seconds</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
              <ArrowRight className="w-5 h-5 rotate-90" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The factory never sleeps. AI generates new components every 15 minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Interviews You',
                description: 'Tell us your vibe, brand, and style. Our AI understands context.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Boxes,
                title: 'Factory Generates',
                description: 'Pick from 1000+ pre-made blocks or let AI create custom ones.',
                color: 'from-pink-500 to-red-500',
              },
              {
                icon: Code2,
                title: 'Deploy Instantly',
                description: 'One-click publish to your subdomain. No code, no servers, no hassle.',
                color: 'from-red-500 to-orange-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500">
                  {/* Glow on hover */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32 px-6" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
                Choose Your Power
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free. Upgrade when you{"'"}re ready to unleash full potential.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            <PricingCard
              name="Starter"
              price="Free"
              tier="free"
              icon="zap"
              features={[
                '100 credits/month',
                'Access to free blocks',
                'Basic hero & footer',
                '1 website',
                'Svarnex subdomain',
              ]}
            />

            <PricingCard
              name="Pro"
              price="₹199"
              tier="pro_199"
              icon="rocket"
              recommended
              features={[
                '500 credits/month',
                'All premium blocks',
                'AI component generation',
                '5 websites',
                'Custom domain support',
                'Priority regeneration',
              ]}
            />

            <PricingCard
              name="Empire"
              price="₹799"
              tier="empire_799"
              icon="crown"
              features={[
                'Unlimited credits',
                'All blocks + early access',
                'White-label deployment',
                'Unlimited websites',
                'Custom code injection',
                'API access',
                'Dedicated support',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="relative p-12 md:p-20 rounded-3xl overflow-hidden">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-white/10" />
            
            {/* Animated gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            />

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold">
                Ready to Build the{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  Future?
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of creators building stunning websites with AI.
                No design skills needed.
              </p>
              <WarpButton />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-sm">
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              SVARNEX
            </span>
            <p className="mt-2">The Autonomous Website Factory</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-center md:text-right">
            <p>&copy; 2026 Svarnex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
