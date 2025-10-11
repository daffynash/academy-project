# Academy Color System Documentation

## Overview

This project uses a global color system that allows easy customization of the academy's brand colors. The system is designed to support multiple academy instances with different color schemes.

## Color Structure

### Primary Colors
- **Primary**: Main brand color (currently indigo)
  - Used for: buttons, links, focus states, main brand elements
  - Classes: `bg-primary-600`, `text-primary-600`, `border-primary-600`
  - Variants: `primary-50` to `primary-900`

### Secondary Colors  
- **Secondary**: Supporting brand color (currently teal)
  - Used for: accent elements, secondary buttons, highlights
  - Classes: `bg-secondary-600`, `text-secondary-600`, `border-secondary-600`
  - Variants: `secondary-50` to `secondary-900`

### Semantic Colors
- **Success**: Positive actions and feedback (green)
  - Classes: `bg-success-600`, `text-success-600`, `border-success-600`
  
- **Danger**: Errors and destructive actions (red)
  - Classes: `bg-danger-600`, `text-danger-600`, `border-danger-600`

- **Neutral**: Text, backgrounds, borders (gray)
  - Classes: `bg-neutral-600`, `text-neutral-600`, `border-neutral-600`

## How to Customize Colors

### Option 1: CSS Variables (Recommended)
Edit `src/styles/colors.css` and update the CSS custom properties:

```css
:root {
  /* Change primary color from indigo to blue */
  --color-primary-600: #2563eb; /* blue-600 */
  --color-primary-700: #1d4ed8; /* blue-700 */
  
  /* Change secondary color from teal to orange */
  --color-secondary-600: #ea580c; /* orange-600 */
  --color-secondary-700: #c2410c; /* orange-700 */
}
```

### Option 2: Configuration File
Update `src/config/colors.js` and use the provided presets:

```javascript
// Use blue & orange preset
export const academyColors = {
  primary: colorPresets.blueOrange.primary,
  secondary: colorPresets.blueOrange.secondary,
  // ... rest stays the same
}
```

### Available Presets
- `blueOrange`: Blue primary, Orange secondary (classic sports)
- `greenGold`: Green primary, Gold secondary (nature/excellence)
- `purplePink`: Purple primary, Pink secondary (modern/creative)
- `navyCyan`: Navy primary, Cyan secondary (professional)

## Usage Examples

### Buttons
```jsx
// Primary button
<button className="bg-primary-600 hover:bg-primary-700 text-white">
  Primary Action
</button>

// Secondary button  
<button className="bg-secondary-600 hover:bg-secondary-700 text-white">
  Secondary Action
</button>

// Danger button
<button className="bg-danger-600 hover:bg-danger-700 text-white">
  Delete
</button>
```

### Text Colors
```jsx
<h1 className="text-primary-600">Main Heading</h1>
<p className="text-secondary-600">Secondary text</p>
<span className="text-success-600">Success message</span>
<span className="text-danger-600">Error message</span>
```

### Focus States
```jsx
<input className="focus:ring-primary-500 focus:border-primary-500" />
```

## Dark Mode Support

All colors automatically adjust for dark mode using the `dark:` prefix:

```jsx
<div className="bg-primary-600 dark:bg-primary-500">
  Adjusts automatically in dark mode
</div>
```

## Implementation Details

### File Structure
```
src/
├── styles/
│   └── colors.css          # CSS custom properties
├── config/
│   └── colors.js           # Color configuration & presets
└── index.css               # Imports color system
```

### Tailwind Integration
Colors are registered in `tailwind.config.cjs` to enable Tailwind classes:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        600: 'var(--color-primary-600)',
        // ...
      }
    }
  }
}
```

## Best Practices

1. **Use semantic naming**: Always use `primary`, `secondary`, `success`, `danger` instead of specific color names
2. **Consistent weight usage**: Use `600` for default states, `700` for hover, `500` for disabled
3. **Dark mode consideration**: Test colors in both light and dark themes
4. **Accessibility**: Ensure sufficient contrast ratios for text readability

## Testing Changes

After updating colors:
1. Run `npm run dev` to see changes
2. Test in both light and dark modes
3. Verify contrast ratios for accessibility
4. Check all components (Login, Signup, Dashboard, etc.)

## Academy Customization Checklist

For each new academy instance:

- [ ] Choose primary brand color
- [ ] Choose secondary accent color  
- [ ] Update `src/styles/colors.css` with new color values
- [ ] Test login/signup pages
- [ ] Test dashboard and all UI components
- [ ] Verify dark mode appearance
- [ ] Check mobile responsiveness
- [ ] Validate accessibility contrast ratios