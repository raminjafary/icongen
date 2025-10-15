#!/usr/bin/env node

/**
 * Sprite Generation Example
 * 
 * This example demonstrates how to generate SVG sprites
 * using the IconGen Icons sprite functionality.
 */

import { SpriteManager, SpriteGenerator } from '@raminjafary/icongen/sprite';

async function generateSprite() {
  console.log('🎨 Sprite Generation Example');
  console.log('=============================\n');

  try {
    // Example 1: Basic sprite generation
    console.log('1️⃣ Generating basic sprite...');
    const spriteManager = new SpriteManager({
      src: '../../examples/svg',
      dist: './dist/sprite',
      name: 'icons-sprite',
      verbose: true
    });

    await spriteManager.generate();
    console.log('✅ Basic sprite generated\n');

    // Example 2: Advanced sprite generation with custom config
    console.log('2️⃣ Generating advanced sprite with custom config...');
    const spriteGenerator = new SpriteGenerator({
      src: '../../examples/svg',
      dist: './dist/advanced-sprite',
      name: 'advanced-sprite',
      config: {
        shape: {
          id: {
            generator: (name) => `icon-${name}`
          }
        },
        mode: {
          symbol: {
            dest: '.',
            sprite: 'sprite.svg',
            inline: true
          }
        }
      },
      verbose: true
    });

    await spriteGenerator.generate();
    console.log('✅ Advanced sprite generated\n');

    console.log('🎉 Sprite generation examples completed!');
    console.log('\nGenerated files:');
    console.log('- ./dist/sprite/ - Basic sprite');
    console.log('- ./dist/advanced-sprite/ - Advanced sprite with custom config');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
generateSprite();
