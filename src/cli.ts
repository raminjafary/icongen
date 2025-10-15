#!/usr/bin/env node

import { FontGenerator } from './font-generator.js';
import path from 'path';

interface CLIOptions {
  src?: string | undefined;
  dist?: string | undefined;
  fontName?: string | undefined;
  cssPrefix?: string | undefined;
  verbose?: boolean;
  website?: boolean;
  optimize?: boolean;
  fixStrokes?: boolean;
  enableHashRevving?: boolean;
  help?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--src':
        if (args[i + 1]) options.src = args[++i];
        break;
      case '--dist':
        if (args[i + 1]) options.dist = args[++i];
        break;
      case '--font-name':
        if (args[i + 1]) options.fontName = args[++i];
        break;
      case '--css-prefix':
        if (args[i + 1]) options.cssPrefix = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--website':
        options.website = true;
        break;
      case '--optimize':
        options.optimize = true;
        break;
      case '--fix-strokes':
        options.fixStrokes = true;
        break;
      case '--no-hash-revving':
        options.enableHashRevving = false;
        break;
      case '--hash-revving':
        options.enableHashRevving = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (arg && arg.startsWith('--')) {
          console.warn(`⚠️  Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
🎨 IconGen Icons Font Generator

Usage:
  icongen-icons [options]

Options:
  --src <path>         Source directory containing SVG files (required)
  --dist <path>        Output directory for generated fonts (default: ./dist/fonts)
  --font-name <name>   Name of the generated font (default: icongen-icons)
  --css-prefix <name>  CSS class prefix (default: icongen)
  --verbose            Enable verbose output
  --website            Generate showcase website
  --optimize           Optimize SVGs with SVGO before font generation
  --fix-strokes        Convert stroke-based SVGs to fills
  --hash-revving       Enable content-based hash revving (default: true)
  --no-hash-revving    Disable hash revving
  --help, -h           Show this help message

Hash Revving:
  Hash revving automatically adds content hashes to font filenames for cache busting.
  When SVG content changes, new hashes are generated, ensuring browsers fetch updated fonts.
  
  Example output:
  • icongen-icons.a1b2c3d4.ttf     - TrueType font with hash
  • icongen-icons.a1b2c3d4.woff    - Web Open Font Format with hash
  • icongen-icons.a1b2c3d4.woff2   - Web Open Font Format 2.0 with hash
  • icongen-icons.a1b2c3d4.eot     - Embedded OpenType with hash
  • icongen-icons.a1b2c3d4.svg     - SVG font with hash
  • icongen-icons.css               - CSS with updated font references
  • manifest.json                 - Build manifest with file information
  • types.ts                      - TypeScript type definitions
  • index.html                    - Showcase website (if --website enabled)

Examples:
  icongen-icons --src ./my-icons
  icongen-icons --src ./icons --verbose --website
  icongen-icons --src ./icons --dist ./fonts --font-name my-icons
  icongen-icons --src ./icons --css-prefix icon --optimize --website
  icongen-icons --src ./icons --optimize --fix-strokes --verbose
  icongen-icons --src ./icons --no-hash-revving  # Disable hash revving
  icongen-icons --src ./icons --hash-revving     # Explicitly enable hash revving

Generated files:
  • {font-name}.{hash}.ttf     - TrueType font with content hash
  • {font-name}.{hash}.woff    - Web Open Font Format with content hash
  • {font-name}.{hash}.woff2   - Web Open Font Format 2.0 with content hash
  • {font-name}.{hash}.eot     - Embedded OpenType with content hash
  • {font-name}.{hash}.svg     - SVG font with content hash
  • {fontname}.css              - CSS with font-face and icon classes
  • manifest.json               - Build manifest with file metadata
  • types.ts                    - TypeScript type definitions
  • index.html                  - Showcase website (if --website enabled)
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.src) {
    console.error('❌ Error: --src parameter is required');
    console.error('   Please specify the source directory containing SVG files');
    console.error('   Example: icongen-icons --src ./my-icons --dist ./fonts');
    process.exit(1);
  }
  const srcDir = path.resolve(process.cwd(), options.src);
  const distDir = options.dist || path.resolve(process.cwd(), 'dist/fonts');
  const fontName = options.fontName || 'icongen-icons';
  const cssPrefix = options.cssPrefix || 'icongen';
  const verbose = options.verbose || false;
  const website = options.website || false;
  const optimize = options.optimize || false;
  const fixStrokes = options.fixStrokes !== false;
  const enableHashRevving = options.enableHashRevving !== false; // Default to true

  try {
    if (verbose) {
      console.log('🚀 IconGen Icons Font Generator');
      console.log('==============================');
      if (optimize) {
        console.log('🔧 SVG optimization enabled');
      }
      if (fixStrokes) {
        console.log('🎨 Stroke-to-fill conversion enabled');
      }
      if (enableHashRevving) {
        console.log('🔐 Content hash revving enabled');
      } else {
        console.log('⚠️  Content hash revving disabled');
      }
    }

    const fontGenerator = new FontGenerator({
      src: srcDir,
      dist: distDir,
      fontName,
      cssPrefix,
      verbose,
      website,
      optimize,
      fixStrokes,
      enableHashRevving,
    });

    await fontGenerator.generate();

    if (verbose) {
      console.log('\n🎉 All done! Your icon font is ready to use.');
      console.log(`📁 Check the output directory: ${distDir}`);

      if (enableHashRevving) {
        console.log(`🔐 Font files include content hashes for cache busting`);
        console.log(`📋 Check manifest.json for file information`);
      }

      if (website) {
        console.log(`🌐 Open index.html in your browser to see the showcase`);
      }
    }
  } catch (error) {
    console.error('\n❌ Font generation failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
