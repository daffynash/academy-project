/**
 * Academy Color Configuration
 * 
 * This file allows easy customization of the academy's brand colors.
 * Simply update the hex values below and the entire application will update.
 * 
 * Usage:
 * 1. Update the colors below for your academy's brand
 * 2. Run `npm run dev` to see changes
 * 3. Colors are automatically available as Tailwind classes:
 *    - bg-primary-600, text-primary-600, border-primary-600, etc.
 *    - bg-secondary-500, text-secondary-500, etc.
 *    - bg-success-600, text-success-600, etc.
 */

export const academyColors = {
  // Primary brand color (currently blue)
  // Used for: buttons, links, focus states, main brand elements
  primary: {
    name: 'Blue',
    base: '#3b82f6', // primary-500 (blue-500)
    light: '#60a5fa', // primary-400 (blue-400)
    dark: '#1d4ed8', // primary-700 (blue-700)
    description: 'Main brand color for primary actions and branding'
  },

  // Secondary brand color (currently teal)
  // Used for: accent elements, secondary buttons, highlights
  secondary: {
    name: 'Teal', 
    base: '#14b8a6', // secondary-500
    light: '#2dd4bf', // secondary-400
    dark: '#0f766e', // secondary-700
    description: 'Supporting color for accents and secondary elements'
  },

  // Success color (currently green)
  // Used for: success messages, positive actions, confirmations
  success: {
    name: 'Green',
    base: '#22c55e', // success-500
    light: '#4ade80', // success-400
    dark: '#15803d', // success-700
    description: 'Color for positive feedback and success states'
  },

  // Danger color (currently red) - STANDARD, rarely customized
  // Used for: error messages, destructive actions, warnings
  danger: {
    name: 'Red',
    base: '#ef4444', // danger-500
    light: '#f87171', // danger-400
    dark: '#b91c1c', // danger-700
    description: 'Color for errors and destructive actions'
  }
}

/**
 * Generate CSS custom properties from the color configuration
 * This function is used internally - you don't need to call it manually
 */
export function generateColorCSS(colors = academyColors) {
  // This would be used by a build script to generate the CSS variables
  // For now, colors are manually defined in src/styles/colors.css
  console.log('Academy colors loaded:', colors)
  return colors
}

/**
 * Academy Color Presets
 * 
 * Quick presets for common academy color schemes
 * Uncomment and modify academyColors above to use a preset
 */
export const colorPresets = {
  // Blue & Orange (classic sports combination)
  blueOrange: {
    primary: { base: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8' }, // blue
    secondary: { base: '#f97316', light: '#fb923c', dark: '#c2410c' }, // orange
  },

  // Green & Gold (nature/excellence theme) 
  greenGold: {
    primary: { base: '#22c55e', light: '#4ade80', dark: '#15803d' }, // green
    secondary: { base: '#eab308', light: '#facc15', dark: '#a16207' }, // yellow/gold
  },

  // Purple & Pink (modern/creative theme)
  purplePink: {
    primary: { base: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9' }, // purple
    secondary: { base: '#ec4899', light: '#f472b6', dark: '#be185d' }, // pink
  },

  // Navy & Cyan (professional theme)
  navyCyan: {
    primary: { base: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' }, // navy blue
    secondary: { base: '#06b6d4', light: '#22d3ee', dark: '#0891b2' }, // cyan
  }
}

export default academyColors