# PWA Icons

## Required Sizes
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Create Icons

### Option 1: Using Figma/Photoshop (Recommended)
1. Create a 512x512 artboard
2. Design your icon with the Academy logo
3. Export at all required sizes

### Option 2: Using SVG + Online Converter
1. Create an SVG icon
2. Convert to PNG at different sizes using: https://cloudconvert.com/svg-to-png
3. Save in this folder

### Option 3: Using Node.js Script
```bash
node generate-icons.js
```
This creates SVG placeholders. You'll need to convert them to PNG.

### Temporary Solution
For now, you can use the Vite logo as a placeholder:
```bash
# Copy vite.svg to each icon size (temporary)
cp ../vite.svg icon-192x192.png
```

## Design Guidelines
- Use brand colors (primary blue: #3b82f6)
- Keep design simple and recognizable
- Ensure icon is visible on both light and dark backgrounds
- Use "maskable" safe zone (center 80% of icon)
