/**
 * Block Editor Store - Zustand
 * Manages the state of block editing in the dashboard
 */

import { create } from 'zustand';

export interface BlockConfig {
  [key: string]: any;
}

export interface Block {
  id: string;
  name: string;
  type: string;
  config: BlockConfig;
  order: number;
}

interface BlockEditorState {
  // Currently selected block for editing
  selectedBlock: Block | null;
  
  // All blocks in the current project
  blocks: Block[];
  
  // Whether the edit panel is open
  isEditPanelOpen: boolean;
  
  // Actions
  selectBlock: (block: Block) => void;
  deselectBlock: () => void;
  updateBlockConfig: (blockId: string, config: Partial<BlockConfig>) => void;
  updateBlockField: (blockId: string, field: string, value: any) => void;
  setBlocks: (blocks: Block[]) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
}

export const useBlockEditor = create<BlockEditorState>((set, get) => ({
  selectedBlock: null,
  blocks: [],
  isEditPanelOpen: false,

  selectBlock: (block) =>
    set({
      selectedBlock: block,
      isEditPanelOpen: true,
    }),

  deselectBlock: () =>
    set({
      selectedBlock: null,
      isEditPanelOpen: false,
    }),

  updateBlockConfig: (blockId, config) =>
    set((state) => {
      const updatedBlocks = state.blocks.map((block) =>
        block.id === blockId
          ? { ...block, config: { ...block.config, ...config } }
          : block
      );

      const updatedSelectedBlock =
        state.selectedBlock?.id === blockId
          ? { ...state.selectedBlock, config: { ...state.selectedBlock.config, ...config } }
          : state.selectedBlock;

      return {
        blocks: updatedBlocks,
        selectedBlock: updatedSelectedBlock,
      };
    }),

  updateBlockField: (blockId, field, value) =>
    set((state) => {
      const updatedBlocks = state.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              config: {
                ...block.config,
                [field]: value,
              },
            }
          : block
      );

      const updatedSelectedBlock =
        state.selectedBlock?.id === blockId
          ? {
              ...state.selectedBlock,
              config: {
                ...state.selectedBlock.config,
                [field]: value,
              },
            }
          : state.selectedBlock;

      return {
        blocks: updatedBlocks,
        selectedBlock: updatedSelectedBlock,
      };
    }),

  setBlocks: (blocks) => set({ blocks }),

  reorderBlocks: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.blocks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Update order property
      const reorderedBlocks = result.map((block, index) => ({
        ...block,
        order: index,
      }));

      return { blocks: reorderedBlocks };
    }),

  deleteBlock: (blockId) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== blockId),
      selectedBlock:
        state.selectedBlock?.id === blockId ? null : state.selectedBlock,
      isEditPanelOpen:
        state.selectedBlock?.id === blockId ? false : state.isEditPanelOpen,
    })),

  duplicateBlock: (blockId) =>
    set((state) => {
      const blockToDuplicate = state.blocks.find((block) => block.id === blockId);
      if (!blockToDuplicate) return state;

      const newBlock: Block = {
        ...blockToDuplicate,
        id: `${blockToDuplicate.id}-copy-${Date.now()}`,
        name: `${blockToDuplicate.name} (Copy)`,
        order: state.blocks.length,
      };

      return {
        blocks: [...state.blocks, newBlock],
      };
    }),
}));
