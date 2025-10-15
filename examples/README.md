# IconGen Icons Examples

This directory contains practical examples demonstrating how to use IconGen Icons in different environments and scenarios.

## SVG Icons Directory (`svg/`)

**Important**: The `svg/` directory contains sample SVG icons that you should replace with your own icons. This directory demonstrates the expected structure and format for your SVG files.

- **Location**: `examples/svg/`
- **Purpose**: Place your SVG icons here
- **Structure**: You can organize icons in subdirectories
- **Format**: Standard SVG files (will be automatically optimized)

## Available Examples

### 1. Node.js CLI Example (`nodejs-cli/`)
Demonstrates how to use IconGen Icons in a Node.js environment to:
- Generate icon fonts from SVG files
- Optimize SVG files for different use cases
- Create SVG sprites
- Use the programmatic API

**Key Features:**
- Font generation with custom settings
- SVG optimization with SVGO
- Sprite generation with custom configurations
- Advanced build workflows

**Quick Start:**
```bash
cd nodejs-cli
npm install
npm start
```

**Available Scripts:**
- `npm start` - Run the main example script
- `npm run generate:fonts` - Generate icon fonts
- `npm run generate:sprite` - Generate SVG sprites
- `npm run optimize` - Optimize SVG files

### 2. Browser Vanilla JavaScript Example (`browser-vanilla/`)
Shows how to integrate IconGen Icons in a browser environment with vanilla JavaScript:
- Icon font usage in HTML
- SVG sprite integration
- Dynamic icon loading
- Programmatic icon management

**Key Features:**
- Responsive icon grid
- Dynamic icon loading
- Interactive examples
- Real-time status updates

**Quick Start:**
```bash
cd browser-vanilla
npm install
npm run dev
```

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate:fonts` - Generate icon fonts
- `npm run generate:sprite` - Generate SVG sprites
- `npm run generate:assets` - Generate all assets
- `npm run test:sprite` - Test sprite generation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Modern browser (for browser examples)

### Installation
1. Clone the repository
2. Install dependencies in the root directory
3. Build the library:
```bash
npm run build:all
```

### Running Examples
Each example has its own setup instructions. Navigate to the example directory and follow the README.

## Example Use Cases

### Font Generation
```javascript
import { generateIconFont } from '@raminjafary/icongen';

await generateIconFont({
  src: './src/svg',
  dist: './output/fonts',
  fontName: 'my-icons',
  cssPrefix: 'icon',
  verbose: true
});
```

### SVG Optimization
```javascript
import { optimizeSVGs } from '@raminjafary/icongen';

await optimizeSVGs('./src/svg', './output/optimized', true);
```

### Sprite Generation
```javascript
import { SpriteManager } from '@raminjafary/icongen/sprite';

const spriteManager = new SpriteManager({
  src: './src/svg',
  dist: './output/sprite',
  name: 'icons-sprite'
});

await spriteManager.generate();
```

## Integration Patterns

### 1. Build-time Integration
Generate icons during your build process:
```bash
# In your package.json
{
  "scripts": {
    "build:icons": "@raminjafary/icongen --src ./assets/svg --dist ./public/fonts",
    "build": "npm run build:icons && npm run build:app"
  }
}
```

### 2. Development Integration
Use the library programmatically in your build tools:
```javascript
import { BuildManager } from '@raminjafary/icongen';

const buildManager = new BuildManager({
  src: './src/svg',
  dist: './dist/fonts',
  fontName: 'app-icons'
});

await buildManager.build();
```

### 3. Runtime Integration
Load icons dynamically in your application:
```javascript
// Load icon font
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './fonts/icongen-icons.css';
document.head.appendChild(link);

// Use icons
const icon = document.createElement('i');
icon.className = 'icongen-icons icongen-icons-home';
```

## Best Practices

### 1. Icon Organization
- Keep SVG files organized in logical folders
- Use consistent naming conventions
- Optimize SVGs before processing

### 2. Performance
- Use SVG sprites for better performance
- Optimize SVG files before font generation
- Consider lazy loading for large icon sets

### 3. Maintenance
- Version your icon sets
- Document icon usage
- Regular optimization and updates

## Troubleshooting

### Common Issues

**Icons not displaying:**
- Check CSS file paths
- Verify font file generation
- Ensure proper class names

**Build errors:**
- Check SVG file validity
- Verify source directory exists
- Review build configuration

**Performance issues:**
- Optimize SVG files
- Use appropriate icon formats
- Consider sprite generation

### Getting Help
- Check the main library documentation
- Review example code
- Open an issue on the repository

## Contributing

To add new examples:
1. Create a new directory under `examples/`
2. Include a `package.json` with dependencies
3. Add a comprehensive `README.md`
4. Update this main README
5. Test the example thoroughly

## License

These examples are provided under the same license as the main IconGen Icons library.
