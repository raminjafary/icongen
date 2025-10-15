#!/usr/bin/env node

/**
 * Font Generation Example
 * 
 * This example shows how to programmatically generate icon fonts
 * using the IconGen Icons library.
 */

import { FontGenerator } from '@icongen/icons/generator';
import { SVGOptimizer } from '@icongen/icons/optimizer';
import { BuildManager } from '@icongen/icons';

async function generateFonts() {
  console.log('🔤 Font Generation Example');
  console.log('==========================\n');

  try {
    // Step 1: Optimize SVG files for font generation
    console.log('1️⃣ Optimizing SVG files...');
    const optimizer = new SVGOptimizer({
      verbose: true,
      inlineDefs: true,
      removeViewBox: false,
      floatPrecision: 2
    });
    
    await optimizer.optimizeDirectory('../svg', './dist/temp/optimized');
    console.log('✅ SVG files optimized\n');

    // Step 2: Generate icon font
    console.log('2️⃣ Generating icon font...');
    const generator = new FontGenerator({
      src: '../svg',
      dist: './dist/fonts',
      fontName: 'my-icons',
      cssPrefix: 'my-icon',
      verbose: true,
      website: true,
      optimize: true,
      fixStrokes: true,
      enableHashRevving: true
    });

    await generator.generate();
    console.log('✅ Icon font generated\n');

    // Step 3: Use BuildManager for advanced workflows
    console.log('3️⃣ Using BuildManager for advanced workflow...');
    const buildManager = new BuildManager({
      src: '../svg',
      dist: './dist/advanced',
      fontName: 'advanced-icons',
      cssPrefix: 'adv-icon',
      verbose: true
    });

    await buildManager.build();
    console.log('✅ Advanced build completed\n');

    console.log('🎉 Font generation examples completed!');
    console.log('\nGenerated files:');
    console.log('- ./dist/fonts/ - Basic font generation');
    console.log('- ./dist/advanced/ - Advanced build workflow');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
generateFonts();
