/**
 * Factory Module - Main exports
 * 
 * This module provides the AI block generation system for Svarnex.
 * Import the functions and types you need from this file.
 */

// Core generator functions
export { 
  generateBlock, 
  generateBlockBatch,
  validateCode,
} from './generator';

// TypeScript types
export type {
  BlockType,
  BlockConfig,
  GeneratorResponse,
  GenerateBlockParams,
  GenerateBlockResult,
  ValidationResult,
} from './types';

// Example usage:
// import { generateBlock, type BlockType } from '@/lib/factory';
// 
// const result = await generateBlock({
//   prompt: 'Modern hero section',
//   type: 'hero',
//   userId: 'user-id',
// });
