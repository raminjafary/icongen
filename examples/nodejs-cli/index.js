#!/usr/bin/env node

/**
 * Node.js CLI Example for IconGen Icons
 * 
 * This example demonstrates how to use IconGen Icons in a Node.js environment
 * to generate icon fonts and optimize SVG files.
 */

import { generateIconFont, optimizeSVGs, optimizeSVGsForFonts } from '@icongen/icons';

async function main() {
  console.log('🚀 IconGen Icons Node.js CLI Example');
  console.log('=====================================\n');

  try {
    // Example 1: Generate icon font from SVG files
    console.log('📝 Example 1: Generating icon font...');
    await generateIconFont({
      src: '../svg',
      dist: './dist/fonts',
      fontName: 'example-icons',
      cssPrefix: 'icon',
      verbose: true,
      website: true,
      optimize: true,
      fixStrokes: true,
      enableHashRevving: true
    });
    console.log('✅ Icon font generated successfully!\n');

    // Example 2: Optimize SVG files for general use
    console.log('📝 Example 2: Optimizing SVG files...');
    await optimizeSVGs(
      '../svg',
      './dist/optimized',
      true
    );
    console.log('✅ SVG files optimized successfully!\n');

    // Example 3: Optimize SVG files specifically for font generation
    console.log('📝 Example 3: Optimizing SVG files for fonts...');
    await optimizeSVGsForFonts(
      '../svg',
      './dist/font-ready',
      true
    );
    console.log('✅ SVG files optimized for fonts successfully!\n');

    console.log('🎉 All examples completed successfully!');
    console.log('\nGenerated files:');
    console.log('- ./dist/fonts/ - Icon font files');
    console.log('- ./dist/optimized/ - General optimized SVGs');
    console.log('- ./dist/font-ready/ - Font-optimized SVGs');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
