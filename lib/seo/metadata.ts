/**
 * SEO Metadata Generation for Svarnex
 * 
 * Dynamic Open Graph tags based on project/brand name
 */

import { Metadata } from 'next';

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  brandName?: string;
  projectName?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  path?: string;
}

const DEFAULT_TITLE = 'Svarnex - The Autonomous Website Factory';
const DEFAULT_DESCRIPTION = 'An AI-powered software house that generates stunning websites in seconds. Create, customize, and deploy professional websites with no code.';
const DEFAULT_OG_IMAGE = '/og-image.png'; // Create this image

export function generateSEOMetadata(options: GenerateMetadataOptions = {}): Metadata {
  const {
    title,
    description,
    brandName,
    projectName,
    ogImage,
    type = 'website',
    path = '',
  } = options;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://svarnex.app';
  const url = `${siteUrl}${path}`;

  // Generate dynamic title
  let finalTitle = title || DEFAULT_TITLE;
  if (brandName && projectName) {
    finalTitle = `${projectName} - ${brandName} | Built with Svarnex`;
  } else if (brandName) {
    finalTitle = `${brandName} | Built with Svarnex`;
  } else if (projectName) {
    finalTitle = `${projectName} | Svarnex`;
  }

  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = ogImage || DEFAULT_OG_IMAGE;

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      type,
      url,
      title: finalTitle,
      description: finalDescription,
      siteName: 'Svarnex',
      images: [
        {
          url: finalImage.startsWith('http') ? finalImage : `${siteUrl}${finalImage}`,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [finalImage.startsWith('http') ? finalImage : `${siteUrl}${finalImage}`],
      creator: '@svarnex',
      site: '@svarnex',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  };
}

/**
 * Generate metadata for user projects
 */
export function generateProjectMetadata(project: {
  name: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  subdomain?: string;
  custom_domain?: string;
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://svarnex.app';
  const projectUrl = project.custom_domain 
    ? `https://${project.custom_domain}`
    : project.subdomain 
      ? `https://${project.subdomain}.${siteUrl.replace('https://', '')}`
      : siteUrl;

  return generateSEOMetadata({
    title: project.meta_title || project.name,
    description: project.meta_description || project.description,
    projectName: project.name,
    ogImage: project.og_image_url,
    path: projectUrl.replace(siteUrl, ''),
  });
}

/**
 * Schema.org structured data for better SEO
 */
export function generateStructuredData(project?: {
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://svarnex.app';

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Svarnex',
    applicationCategory: 'WebApplication',
    description: 'AI-powered website builder that generates stunning websites in seconds',
    url: siteUrl,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Svarnex',
      url: siteUrl,
    },
  };

  if (project) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: project.name,
      description: project.description,
      dateCreated: project.created_at,
      dateModified: project.updated_at,
      isPartOf: baseSchema,
    };
  }

  return baseSchema;
}
