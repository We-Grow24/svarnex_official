'use client';

/**
 * Edit Panel Component
 * Dynamic form generator based on block config schema
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, Copy, Trash2, Type, Palette, Image as ImageIcon, Link as LinkIcon, Hash } from 'lucide-react';
import { useBlockEditor } from '@/lib/store/block-editor';
import { useState } from 'react';

export function EditPanel() {
  const { selectedBlock, isEditPanelOpen, deselectBlock, updateBlockField, deleteBlock, duplicateBlock } = useBlockEditor();

  if (!selectedBlock) return null;

  const handleClose = () => {
    deselectBlock();
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedBlock.name}"?`)) {
      deleteBlock(selectedBlock.id);
    }
  };

  const handleDuplicate = () => {
    duplicateBlock(selectedBlock.id);
  };

  return (
    <AnimatePresence>
      {isEditPanelOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-screen w-96 z-50 flex flex-col"
        >
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-l border-white/10" />

          {/* Content */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Edit Block
                  </h2>
                  <p className="text-sm text-white/60">{selectedBlock.name}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {selectedBlock.type}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDuplicate}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
              <ConfigFormGenerator
                config={selectedBlock.config}
                blockId={selectedBlock.id}
                onChange={(field, value) => updateBlockField(selectedBlock.id, field, value)}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="text-xs text-white/40 mb-3">
                Changes are saved automatically
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
              >
                <Save className="w-4 h-4" />
                Done Editing
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Dynamic Config Form Generator
// ============================================

interface ConfigFormGeneratorProps {
  config: Record<string, any>;
  blockId: string;
  onChange: (field: string, value: any) => void;
}

function ConfigFormGenerator({ config, blockId, onChange }: ConfigFormGeneratorProps) {
  if (!config || Object.keys(config).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Type className="w-8 h-8 text-white/30" />
        </div>
        <p className="text-white/40 text-sm">No configurable fields</p>
      </div>
    );
  }

  return (
    <>
      {Object.entries(config).map(([key, value]) => (
        <ConfigField
          key={key}
          fieldName={key}
          value={value}
          onChange={(newValue) => onChange(key, newValue)}
        />
      ))}
    </>
  );
}

// ============================================
// Individual Config Field
// ============================================

interface ConfigFieldProps {
  fieldName: string;
  value: any;
  onChange: (value: any) => void;
}

function ConfigField({ fieldName, value, onChange }: ConfigFieldProps) {
  const fieldType = detectFieldType(fieldName, value);
  const label = formatFieldName(fieldName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="text-sm font-medium text-white/80 flex items-center gap-2">
        {getFieldIcon(fieldType)}
        {label}
      </label>

      {fieldType === 'text' && (
        <TextInput value={value} onChange={onChange} />
      )}

      {fieldType === 'longtext' && (
        <TextAreaInput value={value} onChange={onChange} />
      )}

      {fieldType === 'color' && (
        <ColorInput value={value} onChange={onChange} />
      )}

      {fieldType === 'number' && (
        <NumberInput value={value} onChange={onChange} />
      )}

      {fieldType === 'url' && (
        <UrlInput value={value} onChange={onChange} />
      )}

      {fieldType === 'boolean' && (
        <BooleanInput value={value} onChange={onChange} label={label} />
      )}

      {fieldType === 'select' && (
        <SelectInput value={value} onChange={onChange} options={getSelectOptions(fieldName)} />
      )}

      {fieldType === 'array' && (
        <ArrayInput value={value} onChange={onChange} fieldName={fieldName} />
      )}

      {fieldType === 'object' && (
        <ObjectInput value={value} onChange={onChange} fieldName={fieldName} />
      )}
    </motion.div>
  );
}

// ============================================
// Input Components
// ============================================

function TextInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
      placeholder="Enter text..."
    />
  );
}

function TextAreaInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
      placeholder="Enter text..."
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [localColor, setLocalColor] = useState(value || '#8B5CF6');

  const handleChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex gap-3">
      <div className="relative">
        <input
          type="color"
          value={localColor}
          onChange={(e) => handleChange(e.target.value)}
          className="w-16 h-10 rounded-lg cursor-pointer bg-white/5 border border-white/10"
          style={{ colorScheme: 'dark' }}
        />
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ backgroundColor: localColor, opacity: 0.2 }}
        />
      </div>
      <input
        type="text"
        value={localColor}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono text-sm"
        placeholder="#000000"
      />
    </div>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <input
      type="number"
      value={value || 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
    />
  );
}

function UrlInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <input
      type="url"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
      placeholder="https://..."
    />
  );
}

function BooleanInput({ value, onChange, label }: { value: boolean; onChange: (val: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-2 focus:ring-purple-500/50"
      />
      <span className="text-sm text-white/80">Enable {label}</span>
    </label>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (val: string) => void; options: string[] }) {
  return (
    <select
      value={value || options[0]}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-black">
          {option}
        </option>
      ))}
    </select>
  );
}

function ArrayInput({ value, onChange, fieldName }: { value: any[]; onChange: (val: any[]) => void; fieldName: string }) {
  const arr = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      <div className="text-xs text-white/50 mb-2">{arr.length} items</div>
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 max-h-40 overflow-y-auto hide-scrollbar">
        <pre className="text-xs text-white/70 font-mono">
          {JSON.stringify(arr, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function ObjectInput({ value, onChange, fieldName }: { value: object; onChange: (val: object) => void; fieldName: string }) {
  return (
    <div className="space-y-2">
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 max-h-40 overflow-y-auto hide-scrollbar">
        <pre className="text-xs text-white/70 font-mono">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ============================================
// Utility Functions
// ============================================

function detectFieldType(fieldName: string, value: any): string {
  const name = fieldName.toLowerCase();

  // Check by field name patterns
  if (name.includes('color') || name.includes('colour')) return 'color';
  if (name.includes('url') || name.includes('link') || name.includes('href')) return 'url';
  if (name.includes('description') || name.includes('content') || name.includes('text') && typeof value === 'string' && value.length > 50) return 'longtext';
  if (name.includes('enabled') || name.includes('visible') || name.includes('show')) return 'boolean';
  if (name.includes('count') || name.includes('number') || name.includes('amount')) return 'number';
  if (name.includes('variant') || name.includes('type') || name.includes('style')) return 'select';

  // Check by value type
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value !== null) return 'object';
  if (typeof value === 'string') {
    if (value.startsWith('#') || value.startsWith('rgb')) return 'color';
    if (value.startsWith('http')) return 'url';
    return 'text';
  }

  return 'text';
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function getFieldIcon(fieldType: string) {
  const iconClass = "w-4 h-4";
  
  switch (fieldType) {
    case 'text':
    case 'longtext':
      return <Type className={iconClass} />;
    case 'color':
      return <Palette className={iconClass} />;
    case 'url':
      return <LinkIcon className={iconClass} />;
    case 'number':
      return <Hash className={iconClass} />;
    case 'image':
      return <ImageIcon className={iconClass} />;
    default:
      return <Type className={iconClass} />;
  }
}

function getSelectOptions(fieldName: string): string[] {
  const name = fieldName.toLowerCase();

  if (name.includes('variant')) return ['default', 'primary', 'secondary', 'outline'];
  if (name.includes('size')) return ['small', 'medium', 'large'];
  if (name.includes('alignment') || name.includes('align')) return ['left', 'center', 'right'];
  if (name.includes('position')) return ['top', 'bottom', 'left', 'right'];

  return ['option1', 'option2', 'option3'];
}
