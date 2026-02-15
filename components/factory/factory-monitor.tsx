/**
 * Factory Monitor Component
 * 
 * Real-time dashboard showing automated block generation statistics
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface FactoryStats {
  total_blocks_generated: number;
  successful: number;
  failed: number;
  success_rate_percent: number;
  avg_generation_time_ms: number;
  blocks_last_24h: number;
  last_generation: {
    category: string;
    vibe: string;
    success: boolean;
    created_at: string;
  } | null;
}

interface CategoryStat {
  category: string;
  total_generated: number;
  successful: number;
  failed: number;
  avg_time_ms: number;
  last_generated: string;
}

export default function FactoryMonitor() {
  const [stats, setStats] = useState<FactoryStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/factory/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setCategoryStats(data.by_category || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch factory stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
          <span className="text-white text-lg">Loading Factory Monitor...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Failed to load factory statistics</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Generated',
      value: stats.total_blocks_generated,
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Successful',
      value: stats.successful,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'from-red-500 to-orange-500',
    },
    {
      label: 'Success Rate',
      value: `${stats.success_rate_percent}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Avg Time',
      value: `${Math.round(stats.avg_generation_time_ms / 1000)}s`,
      icon: Clock,
      color: 'from-yellow-500 to-amber-500',
    },
    {
      label: 'Last 24h',
      value: stats.blocks_last_24h,
      icon: Activity,
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              Factory Monitor
            </h1>
            <p className="text-white/60 mt-2">
              Real-time automated block generation statistics
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchStats}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <p className="text-sm text-white/40 mt-2">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="h-full rounded-2xl bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-white/40">{stat.label}</span>
              </div>
              <div className="text-4xl font-bold text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last Generation */}
      {stats.last_generation && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Last Generation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-white/40">Category</p>
                <p className="text-lg font-medium text-white capitalize">
                  {stats.last_generation.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/40">Vibe</p>
                <p className="text-lg font-medium text-white capitalize">
                  {stats.last_generation.vibe}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/40">Status</p>
                <p
                  className={`text-lg font-medium ${
                    stats.last_generation.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stats.last_generation.success ? 'Success' : 'Failed'}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/40">Time</p>
                <p className="text-lg font-medium text-white">
                  {new Date(stats.last_generation.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Generation by Category</h2>
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Category</th>
                  <th className="text-right p-4 text-white/60 font-medium">Total</th>
                  <th className="text-right p-4 text-white/60 font-medium">Success</th>
                  <th className="text-right p-4 text-white/60 font-medium">Failed</th>
                  <th className="text-right p-4 text-white/60 font-medium">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.length > 0 ? (
                  categoryStats.map((cat, index) => (
                    <motion.tr
                      key={cat.category}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 text-white font-medium capitalize">{cat.category}</td>
                      <td className="p-4 text-white text-right">{cat.total_generated}</td>
                      <td className="p-4 text-green-400 text-right">{cat.successful}</td>
                      <td className="p-4 text-red-400 text-right">{cat.failed}</td>
                      <td className="p-4 text-white/60 text-right">
                        {Math.round(cat.avg_time_ms / 1000)}s
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/40">
                      No generation data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6">
          <p className="text-white/80 text-center">
            <Cpu className="w-5 h-5 inline mr-2" />
            The Factory generates a new block every 15 minutes automatically via Vercel Cron Jobs
          </p>
        </div>
      </div>
    </div>
  );
}
