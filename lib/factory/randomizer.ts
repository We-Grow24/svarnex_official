/**
 * Factory Randomizer Utility
 * 
 * Provides random selection for block generation
 */

import type { BlockType } from '@/lib/factory/types';

/**
 * All available block categories
 */
export const BLOCK_CATEGORIES: BlockType[] = [
  'hero',
  'navbar',
  'features',
  'pricing',
  'testimonials',
  'cta',
  'footer',
  'faq',
  'contact',
  'gallery',
  'team',
  'stats',
  'blog',
  'newsletter',
];

/**
 * Available aesthetic vibes for generation
 */
export const VIBES = [
  'minimal',
  'glassmorphism',
  'dark',
  'luxury',
  'cyberpunk',
  'neon',
  'neomorphism',
  'brutalist',
  'gradient',
  'retro',
  'modern',
  'playful',
  'professional',
  'elegant',
  'bold',
] as const;

export type Vibe = typeof VIBES[number];

/**
 * Prompts for each block type
 */
export const BLOCK_PROMPTS: Record<BlockType, string[]> = {
  hero: [
    'Create a hero section for a SaaS product with a compelling headline',
    'Design a hero banner for an e-commerce store',
    'Build a hero section for a tech startup with futuristic vibes',
    'Create an impactful hero for a creative agency',
    'Design a hero section for a fintech app with trust signals',
  ],
  navbar: [
    'Create a navigation bar for a modern web app',
    'Design a navbar for an e-commerce platform',
    'Build a header with mega menu for a content site',
    'Create a sticky navbar for a portfolio website',
    'Design a transparent navbar that becomes solid on scroll',
  ],
  features: [
    'Create a features section highlighting three key benefits',
    'Design a feature showcase with icon cards',
    'Build a feature comparison grid',
    'Create an interactive features showcase',
    'Design a features section with animated icons',
  ],
  pricing: [
    'Create a pricing table with three tiers',
    'Design a pricing section with toggle for monthly/yearly',
    'Build a pricing comparison with highlighted popular plan',
    'Create a simple pricing card layout',
    'Design an enterprise pricing showcase',
  ],
  testimonials: [
    'Create a testimonials section with customer reviews',
    'Design a testimonial carousel with avatars',
    'Build a video testimonials grid',
    'Create a testimonials wall with ratings',
    'Design a case study testimonials section',
  ],
  cta: [
    'Create a call-to-action section for sign-ups',
    'Design a conversion-focused CTA banner',
    'Build a CTA section with urgency messaging',
    'Create a newsletter signup CTA',
    'Design a free trial CTA section',
  ],
  footer: [
    'Create a comprehensive footer with links and social icons',
    'Design a minimal footer for a landing page',
    'Build a footer with newsletter subscription',
    'Create a footer with multiple columns',
    'Design a footer with site map and contact info',
  ],
  faq: [
    'Create an accordion FAQ section',
    'Design a searchable FAQ page',
    'Build a FAQ grid with categories',
    'Create an animated FAQ accordion',
    'Design a FAQ section with icons',
  ],
  contact: [
    'Create a contact form with validation',
    'Design a contact section with map integration',
    'Build a contact card with multiple methods',
    'Create a multi-step contact form',
    'Design a contact section with office info',
  ],
  gallery: [
    'Create a masonry image gallery',
    'Design a filterable portfolio gallery',
    'Build a lightbox image gallery',
    'Create an animated grid gallery',
    'Design a gallery with hover effects',
  ],
  team: [
    'Create a team members showcase grid',
    'Design a team section with bio cards',
    'Build a team page with social links',
    'Create an animated team member grid',
    'Design a team showcase with roles',
  ],
  stats: [
    'Create a statistics counter section',
    'Design a data visualization dashboard',
    'Build an animated stats showcase',
    'Create a metrics overview panel',
    'Design a KPI dashboard section',
  ],
  blog: [
    'Create a blog post card grid',
    'Design a featured blog post section',
    'Build a blog listing with filters',
    'Create a blog showcase with categories',
    'Design a latest articles section',
  ],
  newsletter: [
    'Create a newsletter signup form',
    'Design a popup newsletter subscription',
    'Build an inline newsletter CTA',
    'Create a newsletter section with benefits',
    'Design a minimal email capture form',
  ],
};

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random block category
 */
export function getRandomCategory(): BlockType {
  return getRandomItem(BLOCK_CATEGORIES);
}

/**
 * Get a random vibe
 */
export function getRandomVibe(): Vibe {
  return getRandomItem(VIBES);
}

/**
 * Get a random prompt for a specific block type
 */
export function getRandomPrompt(type: BlockType): string {
  const prompts = BLOCK_PROMPTS[type];
  return getRandomItem(prompts);
}

/**
 * Generate complete random parameters for block generation
 */
export function getRandomBlockParams() {
  const category = getRandomCategory();
  const vibe = getRandomVibe();
  const prompt = getRandomPrompt(category);

  return {
    category,
    vibe,
    prompt,
  };
}

/**
 * Weight distribution for block types (some blocks are generated more often)
 */
export const BLOCK_WEIGHTS: Record<BlockType, number> = {
  hero: 10,        // High demand
  navbar: 8,       // High demand
  features: 10,    // High demand
  pricing: 9,      // High demand
  testimonials: 7,
  cta: 8,          // High demand
  footer: 6,
  faq: 5,
  contact: 5,
  gallery: 4,
  team: 4,
  stats: 6,
  blog: 5,
  newsletter: 6,
};

/**
 * Get a weighted random category (prioritizes high-demand blocks)
 */
export function getWeightedRandomCategory(): BlockType {
  const totalWeight = Object.values(BLOCK_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [category, weight] of Object.entries(BLOCK_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return category as BlockType;
    }
  }

  return 'hero'; // Fallback
}

/**
 * Get generation statistics
 */
export interface GenerationStats {
  totalCombinations: number;
  categoriesCount: number;
  vibesCount: number;
  averagePromptsPerCategory: number;
}

export function getGenerationStats(): GenerationStats {
  const categoriesCount = BLOCK_CATEGORIES.length;
  const vibesCount = VIBES.length;
  const totalPrompts = Object.values(BLOCK_PROMPTS).reduce(
    (sum, prompts) => sum + prompts.length,
    0
  );
  const averagePromptsPerCategory = totalPrompts / categoriesCount;
  const totalCombinations = categoriesCount * vibesCount * averagePromptsPerCategory;

  return {
    totalCombinations,
    categoriesCount,
    vibesCount,
    averagePromptsPerCategory,
  };
}
