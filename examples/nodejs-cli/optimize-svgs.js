#!/usr/bin/env node

/**
 * SVG Optimization Example
 * 
 * This example shows different ways to optimize SVG files
 * using the IconGen Icons SVGO integration.
 */

import { SVGOptimizer } from '@raminjafary/icongen/optimizer';

async function optimizeSVGs() {
  console.log('⚡ SVG Optimization Example');
  console.log('============================\n');

  try {
    // Example 1: Basic SVG optimization
    console.log('1️⃣ Basic SVG optimization...');
    const basicOptimizer = new SVGOptimizer({
      verbose: true
    });

    await basicOptimizer.optimizeDirectory('../svg', './dist/basic-optimized');
    console.log('✅ Basic optimization completed\n');

    // Example 2: Advanced optimization with custom settings
    console.log('2️⃣ Advanced SVG optimization...');
    const advancedOptimizer = new SVGOptimizer({
      verbose: true,
      inlineDefs: true,
      removeViewBox: false,
      floatPrecision: 3,
      plugins: [
        'preset-default',
        'removeDimensions',
        'removeUselessStrokeAndFill',
        'removeEmptyAttrs',
        'removeHiddenElems',
        'removeEmptyText',
        'removeEmptyContainers',
        'removeUnusedNS',
        'removeEditorsNSData',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeXMLNS',
        'removeComments',
        'removeDoctype',
        'removeXMLProcInst',
        'removeStyleElement',
        'removeScriptElement'
      ]
    });

    await advancedOptimizer.optimizeDirectory('../svg', './dist/advanced-optimized');
    console.log('✅ Advanced optimization completed\n');

    // Example 3: Font-specific optimization
    console.log('3️⃣ Font-specific SVG optimization...');
    const fontOptimizer = new SVGOptimizer({
      verbose: true,
      inlineDefs: true,
      removeViewBox: false,
      floatPrecision: 2,
      plugins: [
        'preset-default',
        'removeDimensions',
        'removeUselessStrokeAndFill',
        'removeEmptyAttrs',
        'removeHiddenElems',
        'removeEmptyText',
        'removeEmptyContainers',
        'removeUnusedNS',
        'removeEditorsNSData',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeXMLNS',
        'removeComments',
        'removeDoctype',
        'removeXMLProcInst',
        'removeStyleElement',
        'removeScriptElement',
        'convertPathData',
        'convertTransform',
        'convertShapeToPath',
        'mergePaths',
        'convertColors',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'removeUnusedNS',
        'removeEditorsNSData',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeXMLNS',
        'removeComments',
        'removeDoctype',
        'removeXMLProcInst',
        'removeStyleElement',
        'removeScriptElement'
      ]
    });

    await fontOptimizer.optimizeDirectory('../svg', './dist/font-optimized');
    console.log('✅ Font-specific optimization completed\n');

    console.log('🎉 SVG optimization examples completed!');
    console.log('\nGenerated files:');
    console.log('- ./dist/basic-optimized/ - Basic optimization');
    console.log('- ./dist/advanced-optimized/ - Advanced optimization');
    console.log('- ./dist/font-optimized/ - Font-specific optimization');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
optimizeSVGs();
