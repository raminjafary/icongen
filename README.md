# IconGen Icons

[![npm version](https://img.shields.io/npm/v/@raminjafary/icongen.svg)](https://www.npmjs.com/package/@raminjafary/icongen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Optimized SVG to font icon converter using SVGO and svgtofont. Generate high-quality icon fonts and SVG sprites from your SVG files with advanced optimization and customization options.

## ✨ Features

- 🚀 **Vite-powered** - Modern build system with fast compilation
- 🎨 **Multiple Output Formats** - Generate fonts (WOFF, WOFF2, TTF, EOT) and SVG sprites
- ⚡ **Advanced Optimization** - SVGO integration for maximum file size reduction
- 🔧 **Flexible Configuration** - Customize fonts, CSS, and optimization settings
- 📦 **TypeScript Support** - Full type definitions included
- 🌐 **Universal Compatibility** - Works in Node.js and browser environments
- 🎯 **CLI & API** - Use via command line or programmatically

## 🚀 Quick Start

### Installation

```bash
npm install @raminjafary/icongen
```

### Basic Usage

```javascript
import { generateIconFont, optimizeSVGs } from '@raminjafary/icongen';

// Generate icon font
await generateIconFont({
  src: './src/svg',
  dist: './dist/fonts',
  fontName: 'my-icons',
  cssPrefix: 'icon',
  verbose: true
});

// Optimize SVG files
await optimizeSVGs('./src/svg', './dist/optimized', true);
```

### CLI Usage

```bash
# Generate icon font
npx @raminjafary/icongen --src ./src/svg --dist ./dist/fonts --fontName my-icons

# Generate SVG sprite
npx @raminjafary/icongen sprite --src ./src/svg --dist ./dist/sprite
```

## 📖 Documentation

### Core APIs

#### `generateIconFont(options)`
Generate icon fonts from SVG files.

```javascript
import { generateIconFont } from '@raminjafary/icongen';

await generateIconFont({
  src: string;           // Source directory with SVG files
  dist: string;          // Output directory for fonts
  fontName?: string;     // Font name (default: 'icongen-icons')
  cssPrefix?: string;    // CSS class prefix (default: 'icongen-icons')
  verbose?: boolean;     // Enable verbose logging
  website?: boolean;     // Generate demo website
  optimize?: boolean;    // Enable optimization
  fixStrokes?: boolean; // Fix stroke issues
  enableHashRevving?: boolean; // Enable hash-based file naming
});
```

#### `optimizeSVGs(srcDir, outputDir?, verbose?)`
Optimize SVG files for general use.

```javascript
import { optimizeSVGs } from '@raminjafary/icongen';

await optimizeSVGs('./src/svg', './dist/optimized', true);
```

#### `optimizeSVGsForFonts(srcDir, outputDir?, verbose?)`
Optimize SVG files specifically for font generation.

```javascript
import { optimizeSVGsForFonts } from '@raminjafary/icongen';

await optimizeSVGsForFonts('./src/svg', './dist/font-ready', true);
```

### Advanced APIs

#### `FontGenerator`
Programmatic font generation with full control.

```javascript
import { FontGenerator } from '@raminjafary/icongen/generator';

const generator = new FontGenerator({
  src: './src/svg',
  dist: './dist/fonts',
  fontName: 'my-icons',
  cssPrefix: 'icon',
  verbose: true
});

await generator.generate();
```

#### `SVGOptimizer`
Advanced SVG optimization with custom settings.

```javascript
import { SVGOptimizer } from '@raminjafary/icongen/optimizer';

const optimizer = new SVGOptimizer({
  verbose: true,
  inlineDefs: true,
  removeViewBox: false,
  floatPrecision: 2
});

await optimizer.optimizeDirectory('./src/svg', './dist/optimized');
```

#### `SpriteManager`
Generate SVG sprites for web use.

```javascript
import { SpriteManager } from '@raminjafary/icongen/sprite';

const spriteManager = new SpriteManager({
  src: './src/svg',
  dist: './dist/sprite',
  name: 'icons-sprite',
  verbose: true
});

await spriteManager.generate();
```

#### `BuildManager`
Advanced build workflows with multiple outputs.

```javascript
import { BuildManager } from '@raminjafary/icongen';

const buildManager = new BuildManager({
  src: './src/svg',
  dist: './dist',
  fontName: 'app-icons',
  cssPrefix: 'icon',
  verbose: true
});

await buildManager.build();
```

## 🎯 Examples

Check out the comprehensive examples in the `examples/` directory:

### Node.js CLI Example
```bash
cd examples/nodejs-cli
npm install
npm start
```

### Browser Vanilla JavaScript Example
```bash
cd examples/browser-vanilla
npm install
npm run dev
```

### Run All Examples
```bash
npm run examples:all
```

## 🛠️ Development

### Development Scripts

```bash
# Build the library
npm run build

# Build with type definitions
npm run build:types

# Build everything (library + generate assets)
npm run build:all

# Development mode with watch
npm run dev

# Generate fonts from examples
npm run generate:fonts

# Generate sprites
npm run generate:sprite

# Preview generated fonts
npm run preview

# Run examples
npm run examples:nodejs
npm run examples:browser
npm run examples:all
```

## 🛠️ Configuration

### Vite Configuration
The library is built with Vite for optimal performance and modern tooling support.

### TypeScript Configuration
Full TypeScript support with comprehensive type definitions.

### Build Configuration
```json
{
  "scripts": {
    "build": "vite build",
    "build:types": "tsc --emitDeclarationOnly",
    "dev": "vite build --watch",
    "build:all": "npm run build && npm run build:types && npm run generate"
  }
}
```

## 📦 Output Formats

### Icon Fonts
- **CSS**: Multiple format support (CSS, LESS, SCSS, Stylus)
- **Fonts**: WOFF, WOFF2, TTF, EOT, SVG
- **Types**: TypeScript definitions for icon names
- **Manifest**: JSON files with icon metadata

### SVG Sprites
- **Symbol**: SVG symbol sprite for `<use>` elements
- **CSS**: Sprite CSS for background positioning
- **HTML**: Demo page with all icons

## 🔧 Advanced Usage

### Custom SVGO Configuration
```javascript
import { SVGOptimizer } from '@raminjafary/icongen/optimizer';

const optimizer = new SVGOptimizer({
  verbose: true,
  plugins: [
    'preset-default',
    'removeDimensions',
    'removeUselessStrokeAndFill',
    'removeEmptyAttrs'
  ]
});
```

### Custom Font Configuration
```javascript
import { FontGenerator } from '@raminjafary/icongen/generator';

const generator = new FontGenerator({
  src: './src/svg',
  dist: './dist/fonts',
  fontName: 'custom-icons',
  cssPrefix: 'ci',
  verbose: true,
  website: true,
  optimize: true,
  fixStrokes: true,
  enableHashRevving: true
});
```

### Custom Sprite Configuration
```javascript
import { SpriteGenerator } from '@raminjafary/icongen/sprite';

const spriteGenerator = new SpriteGenerator({
  src: './src/svg',
  dist: './dist/sprite',
  name: 'custom-sprite',
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
  }
});
```

## 🌐 Browser Usage

### Include Generated CSS
```html
<link rel="stylesheet" href="./fonts/icongen-icons.css">
```

### Use Icon Fonts
```html
<i class="icongen-icons icongen-icons-home"></i>
<i class="icongen-icons icongen-icons-search"></i>
```

### Use SVG Sprites
```html
<svg class="icon">
  <use href="./sprite/sprite.svg#icon-home"></use>
</svg>
```

## 🚀 Performance

- **Optimized SVGs**: Advanced SVGO optimization for minimal file sizes
- **Multiple Formats**: Generate only the formats you need
- **Tree Shaking**: Import only the functions you use
- **Fast Builds**: Vite-powered compilation for speed

## 📋 Requirements

- Node.js 18+
- Modern browser (for browser examples)
- SVG files for processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
