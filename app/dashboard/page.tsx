'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { FactoryFeed } from '@/components/dashboard/factory-feed'
import { LivePreview } from '@/components/dashboard/live-preview'
import { ProfileMenu } from '@/components/dashboard/profile-menu'
import { EditPanel } from '@/components/dashboard/edit-panel'
import { useBlockEditor } from '@/lib/store/block-editor'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamically import factory monitor
const FactoryMonitor = dynamic(
  () => import('@/components/factory/factory-monitor'),
  { ssr: false }
)

interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
  blocks_count?: number
}

export default function DashboardPage() {
  const { setBlocks } = useBlockEditor()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch user and their projects - SINGLE useEffect
  useEffect(() => {
    async function loadUserAndProjects() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Fetch user's projects from real database
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Error fetching projects:', error)
          setProjects([])
        } else {
          setProjects(projectsData || [])
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndProjects()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </div>
    )
  }

  // No projects state - show "Create First Site" card
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 -z-10" />
        
        {/* Factory Monitor in corner */}
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <FactoryMonitor />
        </div>

        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="ml-64 min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <div className="relative p-12 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20" />
              
              <div className="relative z-10 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-10 h-10" />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                    Welcome to Svarnex
                  </h1>
                  <p className="text-xl text-gray-400">
                    You haven't created any projects yet. Let's build your first website!
                  </p>
                </div>

                <div className="pt-6">
                  <Link href="/create">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/50"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Site
                    </motion.button>
                  </Link>
                </div>

                <div className="pt-8 grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="text-3xl font-bold text-purple-400">1 min</div>
                    <div className="text-gray-500 mt-1">Average Build Time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pink-400">AI-Powered</div>
                    <div className="text-gray-500 mt-1">Smart Generation</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">∞</div>
                    <div className="text-gray-500 mt-1">Customization</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Profile Menu */}
        <ProfileMenu />
      </div>
    )
  }

  // Has projects - show full dashboard with mock blocks for editor
  // Initialize with mock blocks on mount
  useEffect(() => {
    const mockBlocks = [
      {
        id: 'navbar-1',
        name: 'Main Navigation',
        type: 'navbar',
        order: 0,
        config: {
          brandName: 'Svarnex',
          brandColor: '#8B5CF6',
          buttonColor: '#EC4899',
          ctaText: 'Get Started',
          backgroundColor: '#FFFFFF',
        },
      },
      {
        id: 'hero-1',
        name: 'Hero Section',
        type: 'hero',
        order: 1,
        config: {
          title: 'Build Websites in Minutes',
          subtitle: 'The AI-powered website builder that does the work for you',
          ctaText: 'Start Building',
          ctaColor: '#8B5CF6',
          backgroundColor: '#F9FAFB',
          titleColor: '#111827',
          subtitleColor: '#6B7280',
        },
      },
      {
        id: 'features-1',
        name: 'Features Grid',
        type: 'features',
        order: 2,
        config: {
          heading: 'Why Choose Svarnex?',
          headingColor: '#111827',
          iconColor: '#8B5CF6',
          features: [
            { title: 'AI-Powered', description: 'Generate components with AI' },
            { title: 'Lightning Fast', description: 'Build websites in minutes' },
            { title: 'Fully Customizable', description: 'Edit every detail' },
          ],
        },
      },
      {
        id: 'pricing-1',
        name: 'Pricing Table',
        type: 'pricing',
        order: 3,
        config: {
          heading: 'Simple Pricing',
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB',
          buttonColor: '#8B5CF6',
          plans: [
            { name: 'Starter', price: '₹199', features: ['100 Credits', '5 Projects', 'Basic Support'] },
            { name: 'Pro', price: '₹499', features: ['500 Credits', 'Unlimited Projects', 'Priority Support'] },
            { name: 'Empire', price: '₹799', features: ['Unlimited Credits', 'Unlimited Projects', '24/7 Support'] },
          ],
        },
      },
      {
        id: 'footer-1',
        name: 'Footer',
        type: 'footer',
        order: 4,
        config: {
          brandName: 'Svarnex',
          brandColor: '#FFFFFF',
          backgroundColor: '#111827',
          description: 'Build the future, one block at a time.',
          copyright: '© 2026 Svarnex. All rights reserved.',
        },
      },
    ]

    setBlocks(mockBlocks)
  }, [setBlocks])
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 -z-10" />
      
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Factory Monitor in corner */}
      <div className="fixed bottom-4 right-4 w-96 z-50">
        <FactoryMonitor />
      </div>

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 mr-80 min-h-screen">
        <LivePreview />
      </main>

      {/* Right Factory Feed */}
      <FactoryFeed />

      {/* Profile Menu (Top Right) */}
      <ProfileMenu />

      {/* Edit Panel (Slides from right) */}
      <EditPanel />
    </div>
  )
}
