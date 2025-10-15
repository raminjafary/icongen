/**
 * Sprite Utilities for IconGen Icons
 * 
 * This file provides utilities for working with sprite files,
 * including dynamic URL resolution for hash-based filenames.
 */

// Default sprite URL - will be updated by the sprite generator
export const DEFAULT_SPRITE_URL = '/sprite/icongen-sprite.svg';

// Current sprite URL - updated automatically when sprites are generated
export const SPRITE_URL = '/sprite/icongen-sprite-51e450f971.svg';

/**
 * Get the sprite URL for use in browser applications
 * @returns The current sprite URL
 */
export function getSpriteUrl(): string {
  return SPRITE_URL;
}

/**
 * Create a sprite icon element
 * @param iconName - The name of the icon (without the 'icon-' prefix)
 * @param size - The size of the icon (default: 24)
 * @returns SVG element with the sprite icon
 */
export function createSpriteIcon(iconName: string, size: number = 24): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `${getSpriteUrl()}#icon-${iconName}`);
  
  svg.appendChild(use);
  return svg;
}

/**
 * Get the href attribute for a sprite icon
 * @param iconName - The name of the icon (without the 'icon-' prefix)
 * @returns The href string for use in <use> elements
 */
export function getSpriteIconHref(iconName: string): string {
  return `${getSpriteUrl()}#icon-${iconName}`;
}

/**
 * Available icon names (generated from the sprite)
 */
export const AVAILABLE_ICONS = [
  'arrow-down',
  'arrow-left', 
  'arrow-right',
  'arrow-up',
  'bank-card',
  'bell',
  'calendar',
  'checkmark',
  'chevron-down',
  'chevron-down-1',
  'chevron-left',
  'chevron-left-1',
  'chevron-left-2',
  'chevron-right',
  'chevron-right-1',
  'chevron-up',
  'circle-close',
  'close',
  'group-tour',
  'helmet',
  'home',
  'hotel',
  'journey',
  'location',
  'minus',
  'money',
  'plus',
  'search',
  'swap',
  'train',
  'vector',
  'vector-1',
  'world-network',
  'bag',
  'counter-clock',
  'default',
  'error',
  'info-circle',
  'planee',
  'assistant',
  'user'
] as const;

export type IconName = typeof AVAILABLE_ICONS[number];
