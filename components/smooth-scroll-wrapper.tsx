'use client'

import { useEffect } from 'react'

interface SmoothScrollWrapperProps {
  children: React.ReactNode
}

export function SmoothScrollWrapper({ children }: SmoothScrollWrapperProps) {
  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return <>{children}</>
}
