# Browser Vanilla JavaScript Example

This example demonstrates how to use IconGen Icons in a browser environment with vanilla JavaScript, including dynamic icon loading, sprite usage, and programmatic icon management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## What This Example Shows

### 1. Icon Font Usage
- Include generated CSS files
- Use icon classes in HTML
- Dynamic icon loading with JavaScript
- Responsive icon grid layout

### 2. SVG Sprite Usage
- Include sprite SVG files
- Use `<use>` elements for icons
- Better performance for multiple icons
- Flexible styling options

### 3. Dynamic Icon Management
- Load random icons
- Load all available icons
- Clear icons dynamically
- Interactive icon grid

### 4. Programmatic API Usage
- Simulate icon optimization
- Generate sprite files
- Export icons in multiple formats
- Real-time status updates

## Features Demonstrated

### Icon Font Integration
```html
<!-- Include the generated CSS -->
<link rel="stylesheet" href="./fonts/icongen-icons.css">

<!-- Use icons in your HTML -->
<i class="icongen-icons icongen-icons-home"></i>
```

### SVG Sprite Integration
```html
<!-- Include the sprite SVG -->
<svg style="display: none;">
  <use href="./sprite/sprite.svg#icon-home"></use>
</svg>

<!-- Use icons with <use> element -->
<svg class="icon">
  <use href="./sprite/sprite.svg#icon-home"></use>
</svg>
```

### JavaScript API Usage
```javascript
// Load random icons
loadRandomIcons();

// Load all icons
loadAllIcons();

// Clear icons
clearIcons();

// Optimize icons
optimizeIcons();

// Generate sprite
generateSprite();

// Export icons
exportIcons();
```

## File Structure

```
browser-vanilla/
├── index.html          # Main HTML file
├── main.js            # JavaScript functionality
├── vite.config.js     # Vite configuration
├── package.json       # Dependencies and scripts
├── dist/              # Generated assets (fonts, sprites)
└── README.md         # This file
```

## Dependencies

This example uses:
- `@raminjafary/icongen` - The main IconGen Icons library (local dependency)
- `vite` - Development server and build tool
- `tsx` - TypeScript execution for sprite generation

## Development

### Local Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Generate Assets
```bash
# Generate icon fonts
npm run generate:fonts

# Generate SVG sprites
npm run generate:sprite

# Generate all assets
npm run generate:assets

# Test sprite generation and start dev server
npm run test:sprite
```

## Integration with IconGen Icons

This example shows how to integrate with the IconGen Icons library:

1. **Font Generation**: Use the CLI or API to generate icon fonts
2. **Sprite Generation**: Create SVG sprites for better performance
3. **Optimization**: Optimize SVG files for web use
4. **Dynamic Loading**: Load icons programmatically

## Browser Compatibility

This example works in all modern browsers that support:
- ES6 modules
- CSS Grid
- SVG `<use>` elements
- Fetch API

## Performance Considerations

- **Icon Fonts**: Good for simple icons, limited styling options
- **SVG Sprites**: Better performance, more flexible styling
- **Dynamic Loading**: Reduces initial bundle size
- **Optimization**: Smaller file sizes, better performance
