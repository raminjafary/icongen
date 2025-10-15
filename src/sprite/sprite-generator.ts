import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import crypto from 'node:crypto';
import {
  existsSync,
  unlinkSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import Sprite from 'svg-sprite';
import { SVGOptimizer } from '../svgo-optimizer.js';
import { ShowcaseGenerator } from './showcase-generator.js';
import { Logger, createLogger } from './logger.js';

export interface SpriteGeneratorOptions {
  name?: string;
  src: string;
  dist: string;
  spriteName?: string;
  hrefBasePath?: string;
  verbose?: boolean;
  hashLength?: number;
  enableHashRevving?: boolean;
  svgoConfig?: 'default' | 'basic' | 'iconFont' | 'web' | 'custom';
  customSvgoConfig?: any;
  generateShowcase?: boolean;
}

export interface SpriteConfig {
  name?: string;
  src: string;
  dist: string;
  spriteName?: string;
  hrefBasePath?: string;
  verbose?: boolean;
  hashLength?: number;
  enableHashRevving?: boolean;
  svgoConfig?: 'default' | 'basic' | 'iconFont' | 'web' | 'custom';
  customSvgoConfig?: any;
  generateTypes?: boolean;
  generateShowcase?: boolean;
  updateComponents?: {
    spriteUtils?: string;
    AppIconSprite?: string | string[];
  };
}

export interface MultiSpriteConfig {
  configurations: SpriteConfig[];
  defaults?: Partial<SpriteConfig>;
}

export class SpriteGenerator {
  private options: Required<Omit<SpriteGeneratorOptions, 'name'>> &
    Pick<SpriteGeneratorOptions, 'name'>;
  private svgoOptimizer: SVGOptimizer;
  private showcaseGenerator: ShowcaseGenerator;
  private logger: Logger;
  private contentHash: string = '';

  constructor(options: SpriteGeneratorOptions) {
    this.options = {
      name: options.name,
      src: options.src,
      dist: options.dist,
      spriteName: options.spriteName || 'sprite',
      hrefBasePath: options.hrefBasePath || '/sprite/',
      verbose: options.verbose || false,
      hashLength: options.hashLength || 10,
      enableHashRevving: options.enableHashRevving !== false,
      svgoConfig: options.svgoConfig || 'default',
      customSvgoConfig: options.customSvgoConfig,
      generateShowcase: options.generateShowcase || false,
    };

    this.svgoOptimizer = new SVGOptimizer({
      verbose: this.options.verbose,
    });

    this.showcaseGenerator = new ShowcaseGenerator({
      verbose: this.options.verbose,
    });

    this.logger = createLogger({
      verbose: this.options.verbose,
      prefix: this.options.name ? `[${this.options.name}] ` : '',
    });
  }

  async updateComponents(
    spriteUrl: string,
    updateComponents?: SpriteConfig['updateComponents'],
  ): Promise<void> {
    if (!updateComponents) return;

    const { spriteUtils, AppIconSprite } = updateComponents;

    if (spriteUtils) {
      await this.updateSpriteUtils(spriteUtils, spriteUrl);
    }

    if (AppIconSprite) {
      const files = Array.isArray(AppIconSprite)
        ? AppIconSprite
        : [AppIconSprite];
      for (const file of files) {
        await this.updateAppIconSprite(file, spriteUrl);
      }
    }
  }

  private async updateSpriteUtils(
    filePath: string,
    spriteUrl: string,
  ): Promise<void> {
    try {
      const fullPath = resolve(filePath);
      if (!existsSync(fullPath)) {
        if (this.options.verbose) {
          console.warn(`Sprite utils file not found: ${fullPath}`);
        }
        return;
      }

      let content = readFileSync(fullPath, 'utf-8');

      const spriteUrlRegex = /export const SPRITE_URL = ['"`][^'"`]*['"`];/;
      const newSpriteUrlLine = `export const SPRITE_URL = '${spriteUrl}';`;

      if (spriteUrlRegex.test(content)) {
        content = content.replace(spriteUrlRegex, newSpriteUrlLine);
      } else {
        content += `\n${newSpriteUrlLine}\n`;
      }

      writeFileSync(fullPath, content, 'utf-8');

      if (this.options.verbose) {
        this.logger.log(`Updated sprite utils: ${fullPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update sprite utils: ${error}`);
    }
  }

  private async updateAppIconSprite(
    filePath: string,
    spriteUrl: string,
  ): Promise<void> {
    try {
      const fullPath = resolve(filePath);
      if (!existsSync(fullPath)) {
        if (this.options.verbose) {
          console.warn(`AppIconSprite file not found: ${fullPath}`);
        }
        return;
      }

      let content = readFileSync(fullPath, 'utf-8');

      // Handle both Vue and React components
      const spriteUrlRegex = /SPRITE_URL = ['"`][^'"`]*['"`]/g;
      const newSpriteUrl = `SPRITE_URL = '${spriteUrl}'`;

      content = content.replace(spriteUrlRegex, newSpriteUrl);

      writeFileSync(fullPath, content, 'utf-8');

      if (this.options.verbose) {
        this.logger.log(`Updated AppIconSprite: ${fullPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update AppIconSprite: ${error}`);
    }
  }

  async generate(): Promise<{
    spriteFile: string;
    hash: string;
    iconCount: number;
    fileSize: string;
  }> {
    this.logger.info('🚀 Starting SVG sprite generation...');

    const svgFiles = this.findSvgFiles(this.options.src);
    if (svgFiles.length === 0) {
      throw new Error(`No SVG files found in ${this.options.src}`);
    }

    this.logger.stats(`📊 Found ${svgFiles.length} SVG files to process`);

    if (this.options.enableHashRevving) {
      this.contentHash = this.generateContentHash(svgFiles);
      this.logger.hash(`🔑 Generated content hash: ${this.contentHash}`);
    }

    const sprite = this.createSpriteInstance();

    await this.processSvgFiles(sprite, svgFiles);

    const result = await this.compileSprite(sprite, svgFiles.length);

    const spriteFile = this.writeSpriteFile(result, svgFiles.length);

    this.logger.success(
      '✅ SVG sprite successfully generated with aggressive optimizations!',
    );

    if (this.options.generateShowcase) {
      const spriteUrl = `${this.options.hrefBasePath}${spriteFile}`;
      await this.showcaseGenerator.generateShowcase(
        svgFiles,
        spriteFile,
        spriteUrl,
        this.options.dist,
        filepath => this.generateSpriteId(filepath),
      );
    }

    return {
      spriteFile,
      hash: this.contentHash,
      iconCount: svgFiles.length,
      fileSize: this.formatFileSize(result.length),
    };
  }

  private findSvgFiles(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    const svgFiles = entries.flatMap(entry => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return this.findSvgFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        return [fullPath];
      }
      return [];
    });

    return svgFiles.sort();
  }

  private generateContentHash(svgFiles: string[]): string {
    try {
      const contentBuffer = Buffer.concat(
        svgFiles.map(file => readFileSync(file)),
      );
      return crypto
        .createHash('md5')
        .update(contentBuffer)
        .digest('hex')
        .slice(0, this.options.hashLength);
    } catch (error) {
      if (this.options.verbose) {
        console.warn('⚠️  Failed to generate content hash:', error);
      }
      return Date.now().toString(36).slice(0, this.options.hashLength);
    }
  }

  private createSpriteInstance(): any {
    const svgoConfig = this.getSvgoConfig();

    return new Sprite({
      mode: {
        symbol: {
          sprite: 'sprite.svg',
          example: false,
          bust: false,
          render: {
            css: false,
            scss: false,
          },
        },
      },
      svg: {
        doctypeDeclaration: false,
        xmlDeclaration: false,
        namespaceIDs: false,
        namespaceClassnames: false,
        dimensionAttributes: false,
      },
      shape: {
        transform: [
          {
            svgo: svgoConfig,
          },
        ],
        id: {
          generator: filepath => this.generateSpriteId(filepath),
          separator: '-',
          whitespace: '-',
        },
        spacing: {
          padding: 0,
          box: 'content',
        },
        meta: undefined,
        align: undefined,
        dest: undefined,
      },
    });
  }

  private getSvgoConfig(): any {
    switch (this.options.svgoConfig) {
      case 'basic':
        return this.svgoOptimizer.getBasicConfig();
      case 'iconFont':
        return this.svgoOptimizer.getIconFontConfig();
      case 'web':
        return this.svgoOptimizer.getWebConfig();
      case 'custom':
        return this.options.customSvgoConfig || this.svgoOptimizer.getConfig();
      case 'default':
      default:
        return this.svgoOptimizer.getConfig();
    }
  }

  private generateSpriteId(filepath: string): string {
    const file = basename(filepath, extname(filepath));
    const dir = dirname(filepath);

    const relPath = relative(this.options.src, dir).replace(/\\/g, '/');

    if (relPath === '' || relPath === '.' || relPath.startsWith('..')) {
      return file;
    }

    const pathParts = relPath.split('/').filter(p => p !== '..' && p !== '.');
    if (pathParts.length === 0) {
      return file;
    }

    const folderPath = pathParts.join('-');
    return `${folderPath}-${file}`;
  }

  private async processSvgFiles(sprite: any, files: string[]): Promise<void> {
    this.logger.info('📝 Processing SVG files...');

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const content = readFileSync(file, 'utf8');
      const relPath = relative(this.options.src, file).replace(/\\/g, '/');
      const fileName = basename(file, extname(file));

      sprite.add(relPath, relPath, content);

      this.logger.log(`  ✓ Processing ${fileName}`);
    }

    this.logger.success('✅ All files processed!');
  }

  private async compileSprite(
    sprite: any,
    _fileCount: number,
  ): Promise<string> {
    this.logger.file('⚙️  Compiling SVG sprite...');

    return new Promise((resolve, reject) => {
      sprite.compile((err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.symbol.sprite.contents);
        }
      });
    });
  }

  private writeSpriteFile(compiled: string, fileCount: number): string {
    const outputDir = this.options.dist;
    const spriteFileName = this.options.enableHashRevving
      ? `${this.options.spriteName}-${this.contentHash}.svg`
      : `${this.options.spriteName}.svg`;

    this.cleanupOldSprites(outputDir);

    mkdirSync(outputDir, { recursive: true });

    const outputFile = resolve(outputDir, spriteFileName);
    writeFileSync(outputFile, compiled);

    this.logger.stats(`📦 Sprite contains ${fileCount} icons`);
    this.logger.size(`📏 File size: ${this.formatFileSize(compiled.length)}`);
    this.logger.output(`📍 Output: ${outputFile}`);

    return spriteFileName;
  }

  private cleanupOldSprites(outputDir: string): void {
    if (!existsSync(outputDir)) return;

    const existingFiles = readdirSync(outputDir);
    const spritePattern = new RegExp(
      `${this.options.spriteName}(?:-[a-zA-Z0-9]+)?\\.svg`,
    );

    existingFiles.forEach(file => {
      if (spritePattern.test(file)) {
        unlinkSync(resolve(outputDir, file));
        if (this.options.verbose) {
          this.logger.log(`🗑️  Removed old sprite: ${file}`);
        }
      }
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getSpriteUrl(): string {
    const spriteFileName = this.options.enableHashRevving
      ? `${this.options.spriteName}-${this.contentHash}.svg`
      : `${this.options.spriteName}.svg`;

    return `${this.options.hrefBasePath}${spriteFileName}`;
  }

  getContentHash(): string {
    return this.contentHash;
  }
}

export default SpriteGenerator;
