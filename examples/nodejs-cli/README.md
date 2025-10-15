# Node.js CLI Example

This example demonstrates how to use IconGen Icons in a Node.js environment to generate icon fonts, optimize SVG files, and create sprite sheets.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the examples:

### Basic Usage
```bash
npm start
```

### Individual Examples
```bash
# Generate icon fonts
npm run generate:fonts

# Generate SVG sprites
npm run generate:sprite

# Optimize SVG files
npm run optimize
```

## What This Example Shows

### 1. Basic Icon Font Generation
- Generate icon fonts from SVG files
- Configure font settings (name, CSS prefix, etc.)
- Enable optimization and stroke fixing

### 2. SVG Optimization
- Basic SVG optimization for general use
- Advanced optimization with custom settings
- Font-specific optimization for better font generation

### 3. Sprite Generation
- Generate SVG sprites for web use
- Custom sprite configuration
- Multiple sprite formats

### 4. Advanced Workflows
- Using BuildManager for complex workflows
- Programmatic API usage
- Error handling and logging

## Generated Output

After running the examples, you'll find:

- `./dist/fonts/` - Icon font files (CSS, WOFF, WOFF2, etc.)
- `./dist/optimized/` - Optimized SVG files
- `./dist/sprite/` - SVG sprite files
- `./dist/advanced/` - Advanced build outputs

## API Reference

The example demonstrates these key APIs:

- `generateIconFont()` - High-level font generation
- `optimizeSVGs()` - SVG optimization
- `FontGenerator` - Programmatic font generation
- `SVGOptimizer` - SVG optimization with custom settings
- `SpriteManager` - Sprite generation
- `BuildManager` - Advanced build workflows
