import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SmoothScrollWrapper } from '@/components/smooth-scroll-wrapper'
import { ErrorBoundary } from '@/components/error/error-boundary'
import { generateSEOMetadata, generateStructuredData } from '@/lib/seo/metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateSEOMetadata({
  title: 'Svarnex - The Autonomous Website Factory',
  description: 'An AI-powered software house that generates stunning websites in seconds. Create, customize, and deploy professional websites with no code.',
  path: '/',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = generateStructuredData();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark">
            <SmoothScrollWrapper>
              {children}
            </SmoothScrollWrapper>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
