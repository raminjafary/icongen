import { resolve, join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SpriteGenerator, type SpriteConfig } from './sprite-generator.js';
import { Logger, createLogger } from './logger.js';

export interface SpriteManagerOptions extends SpriteConfig {
  updateSpriteUtils?: boolean;
  generateTypes?: boolean;
  generateShowcase?: boolean;
  updateComponents?: {
    spriteUtils?: string;
    AppIconSprite?: string | string[];
  };
}

export class SpriteManager {
  private options: Required<Omit<SpriteManagerOptions, 'updateComponents'>> & {
    updateComponents?: SpriteManagerOptions['updateComponents'];
  };
  private generator: SpriteGenerator;
  private logger: Logger;

  constructor(options: SpriteManagerOptions) {
    this.options = {
      name: options.name || 'default-sprite',
      src: options.src,
      dist: options.dist,
      spriteName: options.spriteName || 'icongen-sprite',
      hrefBasePath: options.hrefBasePath || '/sprite/',
      verbose: options.verbose || false,
      hashLength: options.hashLength || 10,
      enableHashRevving: options.enableHashRevving !== false,
      svgoConfig: options.svgoConfig || 'default',
      customSvgoConfig: options.customSvgoConfig,
      generateTypes: options.generateTypes !== false,
      generateShowcase: options.generateShowcase || false,
      updateSpriteUtils: options.updateSpriteUtils !== false,
      updateComponents: options.updateComponents,
    };

    this.generator = new SpriteGenerator({
      name: this.options.name,
      src: this.options.src,
      dist: this.options.dist,
      spriteName: this.options.spriteName,
      hrefBasePath: this.options.hrefBasePath,
      verbose: this.options.verbose,
      hashLength: this.options.hashLength,
      enableHashRevving: this.options.enableHashRevving,
      svgoConfig: this.options.svgoConfig,
      customSvgoConfig: this.options.customSvgoConfig,
      generateShowcase: this.options.generateShowcase,
    });

    this.logger = createLogger({
      verbose: this.options.verbose,
      prefix: this.options.name ? `[${this.options.name}] ` : '',
    });
  }

  async generate(): Promise<{
    spriteFile: string;
    hash: string;
    iconCount: number;
    fileSize: string;
    spriteUrl: string;
  }> {
    if (this.options.verbose) {
      this.logger.info('🚀 Starting sprite generation workflow...');
    }

    const result = await this.generator.generate();
    const spriteUrl = this.generator.getSpriteUrl();

    if (this.options.updateSpriteUtils) {
      await this.updateSpriteUtils(spriteUrl);
    }

    if (this.options.generateTypes) {
      await this.generateTypes(result.iconCount);
    }

    this.logger.success('✅ Sprite generation workflow completed!');

    return {
      ...result,
      spriteUrl,
    };
  }

  private async updateSpriteUtils(spriteUrl: string): Promise<void> {
    const spriteUtilsPath = resolve(
      process.cwd(),
      'src/components/sprite-utils.ts',
    );

    if (!existsSync(spriteUtilsPath)) {
      if (this.options.verbose) {
        console.warn('⚠️  Sprite utils file not found, skipping update');
      }
      return;
    }

    try {
      let content = readFileSync(spriteUtilsPath, 'utf8');

      const urlPattern = /export const SPRITE_URL = '[^']*';/;
      const newUrlLine = `export const SPRITE_URL = '${spriteUrl}';`;

      if (urlPattern.test(content)) {
        content = content.replace(urlPattern, newUrlLine);
      } else {
        content = content.replace(
          /export const DEFAULT_SPRITE_URL = '[^']*';/,
          `export const DEFAULT_SPRITE_URL = '${spriteUrl}';\n${newUrlLine}`,
        );
      }

      writeFileSync(spriteUtilsPath, content);

      if (this.options.verbose) {
        this.logger.log('🔧 Updated sprite utils with new URL');
      }
    } catch (error) {
      this.logger.error(`❌ Failed to update sprite utils: ${error}`);
    }
  }

  private async generateTypes(_iconCount: number): Promise<void> {
    const typesPath = join(this.options.dist, 'sprite-types.ts');

    try {
      mkdirSync(this.options.dist, { recursive: true });

      const typesContent = `export type SpriteIconName = 
${this.generateIconNames()}
  ;

export interface SpriteIcon {
  name: SpriteIconName;
  url: string;
  id: string;
}

export const SPRITE_ICONS: SpriteIconName[] = [
${this.generateIconNames()
  .split('\n')
  .map(name => `  ${name.trim()},`)
  .join('\n')}
];

export const SPRITE_URL = '${this.generator.getSpriteUrl()}';
`;

      writeFileSync(typesPath, typesContent);

      if (this.options.verbose) {
        this.logger.log('📝 Generated TypeScript types');
      }
    } catch (error) {
      this.logger.error(`❌ Failed to generate types: ${error}`);
    }
  }

  private generateIconNames(): string {
    return `  | 'home'
  | 'search'
  | 'user'
  | 'bell'
  | 'checkmark'
  | 'arrow-down'
  | 'arrow-up'
  | 'chevron-left'
  | 'chevron-right'`;
  }

  getSpriteUrl(): string {
    return this.generator.getSpriteUrl();
  }

  getContentHash(): string {
    return this.generator.getContentHash();
  }
}

export default SpriteManager;
