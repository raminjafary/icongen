#!/usr/bin/env node

import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';

// Map of expected files to actual generated files
const fileMappings = {
  'font-generator.js': 'generator.js',
  'font-generator.cjs': 'generator.cjs',
  'svgo-optimizer.js': 'optimizer.js',
  'svgo-optimizer.cjs': 'optimizer.cjs'
};

console.log('🔧 Post-build: Creating expected file names...');

for (const [expected, actual] of Object.entries(fileMappings)) {
  const actualPath = join(distDir, actual);
  const expectedPath = join(distDir, expected);
  
  if (existsSync(actualPath)) {
    copyFileSync(actualPath, expectedPath);
    console.log(`✅ Created ${expected} from ${actual}`);
  } else {
    console.warn(`⚠️  File not found: ${actual}`);
  }
}

console.log('✅ Post-build completed!');
