/**
 * Website Assembler
 * Selects and combines blocks to create a complete website project
 */

import type { WizardFormData } from '@/components/create/wizard';

export interface ProjectBlock {
  blockId: string;
  name: string;
  type: string;
  order: number;
}

export interface AssembledProject {
  name: string;
  description: string;
  blocks: ProjectBlock[];
  globalConfig: {
    brandName: string;
    industry: string;
    vibe: string;
    vibeIntensity: number;
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  metaTitle: string;
  metaDescription: string;
}

/**
 * Mock block library
 * In production, this would fetch from the database
 */
const MOCK_BLOCKS = [
  // Hero blocks
  { id: '1', name: 'Minimal Hero', type: 'hero', vibe: 'minimal' },
  { id: '2', name: 'Bold Hero', type: 'hero', vibe: 'bold' },
  { id: '3', name: 'Elegant Hero', type: 'hero', vibe: 'elegant' },
  { id: '4', name: 'Cyberpunk Hero', type: 'hero', vibe: 'cyberpunk' },
  
  // Navbar blocks
  { id: '5', name: 'Clean Navbar', type: 'navbar', vibe: 'minimal' },
  { id: '6', name: 'Modern Navbar', type: 'navbar', vibe: 'elegant' },
  { id: '7', name: 'Neon Navbar', type: 'navbar', vibe: 'cyberpunk' },
  
  // Features blocks
  { id: '8', name: 'Grid Features', type: 'features', vibe: 'minimal' },
  { id: '9', name: 'Animated Features', type: 'features', vibe: 'playful' },
  { id: '10', name: 'Professional Features', type: 'features', vibe: 'professional' },
  { id: '11', name: 'Neon Features', type: 'features', vibe: 'cyberpunk' },
  
  // Pricing blocks
  { id: '12', name: 'Simple Pricing', type: 'pricing', vibe: 'minimal' },
  { id: '13', name: 'Bold Pricing', type: 'pricing', vibe: 'bold' },
  { id: '14', name: 'Elegant Pricing', type: 'pricing', vibe: 'elegant' },
  
  // CTA blocks
  { id: '15', name: 'Minimal CTA', type: 'cta', vibe: 'minimal' },
  { id: '16', name: 'Bold CTA', type: 'cta', vibe: 'bold' },
  { id: '17', name: 'Playful CTA', type: 'cta', vibe: 'playful' },
  
  // Footer blocks
  { id: '18', name: 'Simple Footer', type: 'footer', vibe: 'minimal' },
  { id: '19', name: 'Professional Footer', type: 'footer', vibe: 'professional' },
  { id: '20', name: 'Cyberpunk Footer', type: 'footer', vibe: 'cyberpunk' },
  
  // Testimonials
  { id: '21', name: 'Card Testimonials', type: 'testimonials', vibe: 'minimal' },
  { id: '22', name: 'Elegant Testimonials', type: 'testimonials', vibe: 'elegant' },
  
  // Contact
  { id: '23', name: 'Simple Contact', type: 'contact', vibe: 'minimal' },
  { id: '24', name: 'Modern Contact', type: 'contact', vibe: 'professional' },
];

/**
 * Color schemes based on vibe
 */
const VIBE_COLOR_SCHEMES = {
  minimal: {
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#6B7280',
  },
  bold: {
    primary: '#DC2626',
    secondary: '#EA580C',
    accent: '#F59E0B',
  },
  elegant: {
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    accent: '#EC4899',
  },
  playful: {
    primary: '#EC4899',
    secondary: '#F59E0B',
    accent: '#10B981',
  },
  professional: {
    primary: '#1E40AF',
    secondary: '#4338CA',
    accent: '#6366F1',
  },
  cyberpunk: {
    primary: '#06B6D4',
    secondary: '#A855F7',
    accent: '#F0ABFC',
  },
};

/**
 * Select blocks that match the desired vibe
 */
function selectBlocksByVibe(vibe: string, type: string): typeof MOCK_BLOCKS {
  return MOCK_BLOCKS.filter((block) => block.type === type && block.vibe === vibe);
}

/**
 * Get a random block of a specific type, preferring vibe match
 */
function getRandomBlock(type: string, preferredVibe: string) {
  // Try to get a block matching the vibe
  const vibeMatches = selectBlocksByVibe(preferredVibe, type);
  if (vibeMatches.length > 0) {
    return vibeMatches[Math.floor(Math.random() * vibeMatches.length)];
  }
  
  // Fall back to any block of the type
  const typeMatches = MOCK_BLOCKS.filter((b) => b.type === type);
  if (typeMatches.length > 0) {
    return typeMatches[Math.floor(Math.random() * typeMatches.length)];
  }
  
  return null;
}

/**
 * Assemble a complete website from user preferences
 * 
 * This function:
 * 1. Selects 5 blocks based on vibe and common patterns
 * 2. Orders them in a logical sequence
 * 3. Generates configuration and metadata
 * 
 * @param formData - User's questionnaire responses
 * @returns Assembled project ready to save
 */
export function assembleWebsite(formData: WizardFormData): AssembledProject {
  const { brandName, industry, vibe, vibeIntensity } = formData;

  // Define the structure of a typical landing page
  // Navbar -> Hero -> Features -> Pricing/CTA -> Footer
  const blockTypes = ['navbar', 'hero', 'features', 'pricing', 'footer'];
  
  const selectedBlocks: ProjectBlock[] = [];
  let order = 0;

  // Select one block of each type
  for (const type of blockTypes) {
    const block = getRandomBlock(type, vibe);
    if (block) {
      selectedBlocks.push({
        blockId: block.id,
        name: block.name,
        type: block.type,
        order: order++,
      });
    }
  }

  // If we don't have 5 blocks yet, add random ones
  while (selectedBlocks.length < 5) {
    const randomBlock = MOCK_BLOCKS[Math.floor(Math.random() * MOCK_BLOCKS.length)];
    // Avoid duplicates
    if (!selectedBlocks.some((b) => b.blockId === randomBlock.id)) {
      selectedBlocks.push({
        blockId: randomBlock.id,
        name: randomBlock.name,
        type: randomBlock.type,
        order: order++,
      });
    }
  }

  // Get color scheme for the vibe
  const colorScheme = VIBE_COLOR_SCHEMES[vibe as keyof typeof VIBE_COLOR_SCHEMES] || VIBE_COLOR_SCHEMES.minimal;

  // Generate project metadata
  const projectName = `${brandName} Website`;
  const description = `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} ${industry} website for ${brandName}`;
  const metaTitle = `${brandName} - ${industry} Solutions`;
  const metaDescription = `Welcome to ${brandName}. Your trusted partner in ${industry.toLowerCase()}.`;

  return {
    name: projectName,
    description,
    blocks: selectedBlocks,
    globalConfig: {
      brandName,
      industry,
      vibe,
      vibeIntensity,
      colorScheme,
    },
    metaTitle,
    metaDescription,
  };
}

/**
 * Generate a unique subdomain from brand name
 */
export function generateSubdomain(brandName: string): string {
  const cleaned = brandName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const random = Math.random().toString(36).substring(2, 6);
  return `${cleaned}-${random}`;
}

/**
 * Simulate AI-powered block recommendations
 * This would integrate with the ML model in production
 */
export function getAIRecommendations(formData: WizardFormData): string[] {
  const { industry, vibe } = formData;

  // Mock recommendations based on industry patterns
  const recommendations: Record<string, string[]> = {
    'SaaS': ['features', 'pricing', 'testimonials', 'cta'],
    'E-commerce': ['hero', 'gallery', 'pricing', 'testimonials'],
    'Finance': ['hero', 'features', 'stats', 'contact'],
    'Healthcare': ['hero', 'team', 'contact', 'testimonials'],
    'Education': ['hero', 'features', 'pricing', 'faq'],
    'Real Estate': ['gallery', 'features', 'contact', 'cta'],
    'Marketing': ['hero', 'stats', 'testimonials', 'cta'],
    'Entertainment': ['hero', 'gallery', 'newsletter', 'cta'],
    'Tech Startup': ['hero', 'features', 'pricing', 'blog'],
    'Consulting': ['hero', 'features', 'team', 'contact'],
  };

  return recommendations[industry] || ['hero', 'features', 'pricing', 'footer'];
}

/**
 * Calculate estimated build time based on complexity
 */
export function estimateBuildTime(blocks: ProjectBlock[], vibeIntensity: number): number {
  // Base time: 5 seconds
  // +2 seconds per block
  // +1 second per 20% intensity
  const baseTime = 5;
  const blockTime = blocks.length * 2;
  const intensityTime = Math.floor(vibeIntensity / 20);
  
  return baseTime + blockTime + intensityTime;
}
