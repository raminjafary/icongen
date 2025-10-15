export {
  SpriteGenerator,
  type SpriteGeneratorOptions,
  type SpriteConfig,
  type MultiSpriteConfig,
} from './sprite-generator.js';
export { SpriteManager, type SpriteManagerOptions } from './sprite-manager.js';
export {
  MultiSpriteManager,
  type MultiSpriteManagerOptions,
} from './multi-sprite-manager.js';
export {
  ShowcaseGenerator,
  type ShowcaseGeneratorOptions,
  type ShowcaseIcon,
} from './showcase-generator.js';
export { generateSprite } from './sprite-cli.js';

export const DEFAULT_SPRITE_CONFIG = {
  src: './examples/svg',
  dist: './dist/sprite',
  spriteName: 'icongen-sprite',
  hrefBasePath: '/sprite/',
  verbose: true,
  hashLength: 10,
  enableHashRevving: true,
  svgoConfig: 'default' as const,
  generateTypes: true,
  generateShowcase: true,
};

export async function generateSpriteWithDefaults(
  options: Partial<import('./sprite-generator.js').SpriteConfig> = {},
) {
  const config = { ...DEFAULT_SPRITE_CONFIG, ...options };
  const { SpriteManager } = await import('./sprite-manager.js');
  const manager = new SpriteManager(config);
  return await manager.generate();
}

export default {
  generateSpriteWithDefaults,
  DEFAULT_SPRITE_CONFIG,
};
