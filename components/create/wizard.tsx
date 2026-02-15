'use client';

/**
 * Multi-Step Wizard Component
 * Typeform-style questionnaire with smooth transitions
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export interface WizardFormData {
  brandName: string;
  industry: string;
  vibe: string;
  vibeIntensity: number;
}

interface WizardProps {
  onComplete: (data: WizardFormData) => void;
  isSubmitting?: boolean;
}

export default function Wizard({ onComplete, isSubmitting = false }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>({
    brandName: '',
    industry: '',
    vibe: 'minimal',
    vibeIntensity: 50,
  });

  const totalSteps = 2;

  const updateFormData = (field: keyof WizardFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return formData.brandName.trim().length > 0 && formData.industry.trim().length > 0;
    }
    if (currentStep === 1) {
      return formData.vibe.length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main wizard container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-white/50">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            {currentStep === 0 && (
              <StepBrandInfo
                brandName={formData.brandName}
                industry={formData.industry}
                onUpdateBrandName={(value) => updateFormData('brandName', value)}
                onUpdateIndustry={(value) => updateFormData('industry', value)}
              />
            )}

            {currentStep === 1 && (
              <StepVibe
                vibe={formData.vibe}
                vibeIntensity={formData.vibeIntensity}
                onUpdateVibe={(value) => updateFormData('vibe', value)}
                onUpdateIntensity={(value) => updateFormData('vibeIntensity', value)}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-12">
              {currentStep > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Creating...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create My Website
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// Step 1: Brand Name & Industry
// ============================================

interface StepBrandInfoProps {
  brandName: string;
  industry: string;
  onUpdateBrandName: (value: string) => void;
  onUpdateIndustry: (value: string) => void;
}

function StepBrandInfo({
  brandName,
  industry,
  onUpdateBrandName,
  onUpdateIndustry,
}: StepBrandInfoProps) {
  const industries = [
    'SaaS',
    'E-commerce',
    'Finance',
    'Healthcare',
    'Education',
    'Real Estate',
    'Marketing',
    'Entertainment',
    'Tech Startup',
    'Consulting',
    'Other',
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Let&apos;s start with the basics
        </h2>
        <p className="text-lg text-white/60 mb-12">
          Tell us about your brand so we can create the perfect website
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-white/80 mb-3">
            Brand Name
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => onUpdateBrandName(e.target.value)}
            placeholder="e.g., Acme Corp"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-lg"
            autoFocus
          />
        </motion.div>

        {/* Industry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-white/80 mb-3">
            Industry
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {industries.map((ind) => (
              <motion.button
                key={ind}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpdateIndustry(ind)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  industry === ind
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {ind}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// Step 2: Vibe Selection
// ============================================

interface StepVibeProps {
  vibe: string;
  vibeIntensity: number;
  onUpdateVibe: (value: string) => void;
  onUpdateIntensity: (value: number) => void;
}

function StepVibe({
  vibe,
  vibeIntensity,
  onUpdateVibe,
  onUpdateIntensity,
}: StepVibeProps) {
  const vibes = [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean, simple, and focused',
      emoji: '⚪',
      gradient: 'from-gray-600 to-gray-800',
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Large typography, high contrast',
      emoji: '🔥',
      gradient: 'from-red-600 to-orange-600',
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated and refined',
      emoji: '✨',
      gradient: 'from-purple-600 to-blue-600',
    },
    {
      id: 'playful',
      name: 'Playful',
      description: 'Fun, colorful, and energetic',
      emoji: '🎨',
      gradient: 'from-pink-500 to-yellow-500',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Corporate and trustworthy',
      emoji: '💼',
      gradient: 'from-blue-700 to-indigo-800',
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Futuristic neon aesthetics',
      emoji: '🌆',
      gradient: 'from-cyan-500 to-purple-600',
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Choose your vibe
        </h2>
        <p className="text-lg text-white/60 mb-12">
          This will define the aesthetic and personality of your website
        </p>
      </motion.div>

      {/* Vibe cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
      >
        {vibes.map((v) => (
          <motion.button
            key={v.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdateVibe(v.id)}
            className={`relative p-6 rounded-2xl text-left transition-all ${
              vibe === v.id
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black'
                : ''
            }`}
          >
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${v.gradient} opacity-80`}
            />
            <div className="relative z-10">
              <div className="text-4xl mb-2">{v.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-1">{v.name}</h3>
              <p className="text-xs text-white/70">{v.description}</p>
            </div>
            {vibe === v.id && (
              <motion.div
                layoutId="selected-vibe"
                className="absolute inset-0 rounded-2xl border-2 border-white pointer-events-none"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Intensity slider */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <label className="block text-sm font-medium text-white/80">
          Intensity Level: <span className="text-purple-400">{vibeIntensity}%</span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={vibeIntensity}
            onChange={(e) => onUpdateIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(236 72 153) ${vibeIntensity}%, rgba(255,255,255,0.1) ${vibeIntensity}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50">
          <span>Subtle</span>
          <span>Medium</span>
          <span>Intense</span>
        </div>
      </motion.div>
    </div>
  );
}
