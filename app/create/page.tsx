'use client';

/**
 * Create Page - Website Builder Questionnaire
 * Multi-step wizard for creating new websites
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Wizard, { type WizardFormData } from '@/components/create/wizard';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  const handleComplete = async (formData: WizardFormData) => {
    setIsSubmitting(true);

    try {
      // Call the API to create the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();

      console.log('✅ Website created:', result);

      // Show success animation
      setProjectId(result.project.id);
      setProjectName(result.project.name);
      setShowSuccess(true);

      // Wait for success animation, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Failed to create website:', error);
      alert(error instanceof Error ? error.message : 'Failed to create website. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Wizard onComplete={handleComplete} isSubmitting={isSubmitting} />
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-black flex items-center justify-center p-4"
          >
            <SuccessScreen projectName={projectName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Success Screen Component
// ============================================

interface SuccessScreenProps {
  projectName: string;
}

function SuccessScreen({ projectName }: SuccessScreenProps) {
  return (
    <div className="text-center max-w-2xl">
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative z-10 mb-8"
      >
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50">
          <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Sparkle effects */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-80px)`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
              }}
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Success message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Website Created! 🎉
        </h1>
        <p className="text-xl text-white/70 mb-2">
          <span className="text-purple-400 font-semibold">{projectName}</span> is ready
        </p>
        <p className="text-lg text-white/50">
          Redirecting to your dashboard...
        </p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-2 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-purple-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-16 grid grid-cols-3 gap-6"
      >
        {[
          { icon: Sparkles, label: '5 Blocks Selected' },
          { icon: Zap, label: 'AI Optimized' },
          { icon: CheckCircle2, label: 'Ready to Publish' },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <item.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-white/70">{item.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
