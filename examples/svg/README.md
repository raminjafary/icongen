# SVG Icons Directory

This directory contains sample SVG icons that demonstrate how to use the IconGen Icons generator.

## How to Use

1. **Replace these sample icons** with your own SVG files
2. **Organize your icons** in subdirectories if needed (like the `Iconly/` folder structure shown)
3. **Run the generator** using the examples in the parent directories

## File Structure

```
examples/svg/
├── README.md                 # This file
├── Arrow---Down.svg         # Sample arrow icons
├── Arrow---Left.svg
├── Arrow---Right.svg
├── Arrow---Up.svg
├── bag.svg                  # Sample UI icons
├── Bank Card.svg
├── Bell.svg
├── Calendar.svg
├── Checkmark.svg
├── Chevron Down.svg
├── Chevron Left.svg
├── Chevron Right.svg
├── Chevron Up.svg
├── Circle close.svg
├── Close.svg
├── counter clock.svg
├── default.svg
├── error.svg
├── Group tour.svg
├── Helmet.svg
├── Home.svg
├── Hotel.svg
├── info circle.svg
├── Journey.svg
├── Location.svg
├── Minus.svg
├── Money.svg
├── planee.svg
├── Plus.svg
├── Search.svg
├── assistant.svg
├── Train.svg
├── user.svg
├── Vector-1.svg
├── Vector.svg
├── World Network.svg
└── Iconly/                  # Sample organized structure
    ├── Light/
    │   ├── Arrow---Down.svg
    │   ├── Arrow---Up.svg
    │   └── Home.svg
    └── Light-Outline/
        ├── Arrow---Left.svg
        ├── Arrow---Right.svg
        └── Swap.svg
```

## SVG Requirements

- **Format**: Standard SVG files
- **Optimization**: Icons will be automatically optimized using SVGO
- **Naming**: Use descriptive names (spaces and special characters are allowed)
- **Organization**: You can organize icons in subdirectories

## Next Steps

1. Replace the sample icons with your own SVG files
2. Run the Node.js CLI example: `cd examples/nodejs-cli && npm install && npm start`
3. Or run the browser example: `cd examples/browser-vanilla && npm install && npm run dev`

## Generated Output

The generator will create:
- **Font files**: `.woff2`, `.woff`, `.ttf`, `.eot` formats
- **CSS files**: `.css`, `.scss`, `.less`, `.styl` with icon classes
- **Sprite files**: SVG sprite sheets for better performance
- **TypeScript types**: Auto-generated type definitions
- **Showcase**: HTML preview of all icons
