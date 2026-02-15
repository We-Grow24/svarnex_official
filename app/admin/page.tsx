import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FactoryMonitor from '@/components/factory/factory-monitor'
import { ShieldAlert, Users, Database, Zap } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Verify Admin Status (Double Check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard') // Kick them out if they aren't you
  }

  // 2. Fetch System Stats
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact' })
  const { count: blockCount } = await supabase.from('blocks').select('*', { count: 'exact' })
  const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact' })

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-red-500 tracking-tighter">OVERLORD CONSOLE</h1>
          <p className="text-zinc-400">System Control :: {user.email}</p>
        </div>
        <div className="px-4 py-1 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-xs font-mono uppercase">
          Admin Access Granted
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Users /></div>
            <div>
              <p className="text-zinc-500 text-sm uppercase">Total Users</p>
              <p className="text-2xl font-bold">{userCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><Database /></div>
            <div>
              <p className="text-zinc-500 text-sm uppercase">Total Blocks Generated</p>
              <p className="text-2xl font-bold">{blockCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><Zap /></div>
            <div>
              <p className="text-zinc-500 text-sm uppercase">Live Projects</p>
              <p className="text-2xl font-bold">{projectCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* The AI Factory Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-yellow-500" />
            Factory Operations
          </h2>
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
            <FactoryMonitor />
          </div>
        </div>

        {/* Manual Override Controls */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold mb-4">Manual Overrides</h2>
           <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4">
              <p className="text-sm text-zinc-400">Emergency Controls</p>
              <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors">
                FORCE STOP FACTORY
              </button>
              <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                FLUSH REDIS CACHE
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}