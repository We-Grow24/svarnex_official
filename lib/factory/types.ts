/**
 * Types for the AI Block Generator System
 */

export type BlockType =
  | 'hero'
  | 'pricing'
  | 'footer'
  | 'navbar'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'contact'
  | 'gallery'
  | 'team'
  | 'stats'
  | 'blog'
  | 'newsletter';

/**
 * Configuration schema for a generated block
 */
export interface BlockConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  layout?: {
    variant?: string;
    columns?: number;
    alignment?: string;
  };
  content?: {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    items?: Array<{
      title?: string;
      description?: string;
      icon?: string;
    }>;
  };
  animation?: {
    enabled?: boolean;
    type?: string;
    duration?: number;
  };
  [key: string]: any; // Allow additional custom config
}

/**
 * Response structure expected from OpenAI
 */
export interface GeneratorResponse {
  code: string;
  config: BlockConfig;
  name: string;
  description?: string;
  tags?: string[];
}

/**
 * Parameters for block generation
 */
export interface GenerateBlockParams {
  prompt: string;
  type: BlockType;
  userId?: string;
  isPremium?: boolean;
  vibe?: string; // Optional aesthetic vibe (e.g., "cyberpunk", "minimal", "glassmorphism")
}

/**
 * Result of block generation
 */
export interface GenerateBlockResult {
  success: boolean;
  blockId?: string;
  data?: GeneratorResponse;
  error?: string;
}

/**
 * Validation result for generated code
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
