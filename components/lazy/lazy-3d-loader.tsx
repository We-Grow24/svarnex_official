/**
 * Lazy Loading Wrapper for 3D Components
 * 
 * Improves initial page load by deferring 3D component loading
 * Shows loading fallback until the component is ready
 */

'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface Lazy3DLoaderProps {
  /**
   * Loader component function
   * Example: () => import('./my-3d-component')
   */
  loader: () => Promise<{ default: ComponentType<any> }>;
  
  /**
   * Props to pass to the loaded component
   */
  componentProps?: Record<string, any>;
  
  /**
   * Custom loading fallback
   */
  fallback?: React.ReactNode;
  
  /**
   * Minimum loading time in ms (prevents flash)
   */
  minLoadTime?: number;
}

/**
 * Default loading fallback with glassmorphism spinner
 */
function DefaultLoadingFallback() {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full" />
        <motion.div
          className="absolute inset-0 w-16 h-16 border-4 border-blue-500/30 border-b-blue-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      <p className="absolute mt-24 text-sm text-gray-400 font-light">
        Loading 3D Experience...
      </p>
    </div>
  );
}

/**
 * Lazy load a 3D component with fallback
 * 
 * Usage:
 * ```tsx
 * <Lazy3DLoader 
 *   loader={() => import('@/components/3d/hero-scene')}
 *   componentProps={{ color: 'purple' }}
 * />
 * ```
 */
export function Lazy3DLoader({
  loader,
  componentProps = {},
  fallback,
  minLoadTime = 500,
}: Lazy3DLoaderProps) {
  // Create lazy component
  const LazyComponent = lazy(async () => {
    const startTime = Date.now();
    const component = await loader();
    
    // Ensure minimum load time to prevent flash
    const loadTime = Date.now() - startTime;
    if (loadTime < minLoadTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadTime - loadTime));
    }
    
    return component;
  });

  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <LazyComponent {...componentProps} />
    </Suspense>
  );
}

/**
 * HOC to make any component lazy-loadable
 * 
 * Usage:
 * ```tsx
 * const LazyHeroScene = withLazy3D(() => import('./hero-scene'));
 * 
 * <LazyHeroScene color="purple" />
 * ```
 */
export function withLazy3D<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  return function Lazy3DComponent(props: P) {
    return (
      <Lazy3DLoader
        loader={loader}
        componentProps={props}
        fallback={fallback}
      />
    );
  };
}

/**
 * Preload a 3D component before it's needed
 * Useful for preloading on hover or scroll
 * 
 * Usage:
 * ```tsx
 * const preloadHeroScene = preload3DComponent(() => import('./hero-scene'));
 * 
 * <button onMouseEnter={preloadHeroScene}>
 *   View Demo
 * </button>
 * ```
 */
export function preload3DComponent(
  loader: () => Promise<{ default: ComponentType<any> }>
) {
  return () => {
    // Trigger the dynamic import
    loader().catch(err => {
      console.error('Failed to preload 3D component:', err);
    });
  };
}
