import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import {
  SpriteGenerator,
  type SpriteConfig,
  type MultiSpriteConfig,
} from './sprite-generator.js';
import { Logger, createLogger } from './logger.js';

export interface MultiSpriteManagerOptions {
  configFile?: string;
  configurations?: SpriteConfig[];
  defaults?: Partial<SpriteConfig>;
  verbose?: boolean;
}

export class MultiSpriteManager {
  private options: Required<MultiSpriteManagerOptions>;
  private config: MultiSpriteConfig;
  private logger: Logger;

  constructor(options: MultiSpriteManagerOptions = {}) {
    this.options = {
      configFile: options.configFile || './sprite-config.json',
      configurations: options.configurations || [],
      defaults: options.defaults || {},
      verbose: options.verbose || false,
    };

    this.logger = createLogger({ verbose: this.options.verbose });
    this.config = this.loadConfig();
  }

  private loadConfig(): MultiSpriteConfig {
    try {
      const possiblePaths = [
        this.options.configFile,
        resolve(this.options.configFile),
        resolve(process.cwd(), this.options.configFile),
        ...this.findConfigInParentDirs(this.options.configFile),
      ];

      let configPath: string | null = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          configPath = path;
          break;
        }
      }

      if (!configPath) {
        throw new Error(
          `Configuration file not found. Tried: ${possiblePaths.join(', ')}`,
        );
      }

      this.logger.log(`Loading config from: ${configPath}`);

      const configContent = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent) as MultiSpriteConfig;

      if (this.options.configurations.length > 0) {
        config.configurations = this.options.configurations;
      }

      if (this.options.defaults) {
        config.defaults = { ...config.defaults, ...this.options.defaults };
      }

      return config;
    } catch (error) {
      this.logger.warn(`Failed to load config file: ${error}`);

      return {
        configurations:
          this.options.configurations.length > 0
            ? this.options.configurations
            : [this.createDefaultConfig()],
        defaults: this.options.defaults,
      };
    }
  }

  private getConfigFileDirectory(): string {
    const possiblePaths = [
      this.options.configFile,
      resolve(this.options.configFile),
      resolve(process.cwd(), this.options.configFile),
      ...this.findConfigInParentDirs(this.options.configFile),
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return resolve(path, '..');
      }
    }

    return process.cwd();
  }

  private findConfigInParentDirs(configFileName: string): string[] {
    const paths: string[] = [];
    let currentDir = process.cwd();
    const maxDepth = 10;
    let depth = 0;

    while (currentDir !== resolve(currentDir, '..') && depth < maxDepth) {
      const configPath = join(currentDir, configFileName);
      paths.push(configPath);
      currentDir = resolve(currentDir, '..');
      depth++;
    }

    return paths;
  }

  private createDefaultConfig(): SpriteConfig {
    return {
      name: 'default-sprite',
      src: './examples/svg',
      dist: './dist/sprite',
      spriteName: 'icongen-sprite',
      hrefBasePath: '/sprite/',
      verbose: this.options.verbose,
      hashLength: 10,
      enableHashRevving: true,
      svgoConfig: 'default',
      generateTypes: true,
    };
  }

  private mergeWithDefaults(config: SpriteConfig): SpriteConfig {
    return {
      ...this.config.defaults,
      ...config,
    };
  }

  async generateAll(): Promise<{
    success: boolean;
    results: Array<{
      name: string;
      success: boolean;
      iconCount: number;
      spritePath: string;
      spriteUrl: string;
      error?: string;
    }>;
  }> {
    const results = [];
    let allSuccess = true;

    this.logger.info(
      `Generating ${this.config.configurations.length} sprite configurations...`,
    );

    for (const config of this.config.configurations) {
      const mergedConfig = this.mergeWithDefaults(config);

      this.logger.info(
        `\nGenerating sprite: ${mergedConfig.name || 'unnamed'}`,
      );
      this.logger.log(`  Source: ${mergedConfig.src}`);
      this.logger.log(`  Output: ${mergedConfig.dist}`);
      this.logger.log(`  Sprite Name: ${mergedConfig.spriteName}`);
      this.logger.log(`  Href Base: ${mergedConfig.hrefBasePath}`);

      try {
        const configDir = this.getConfigFileDirectory();
        const resolvedConfig = {
          ...mergedConfig,
          src: resolve(configDir, mergedConfig.src),
          dist: resolve(configDir, mergedConfig.dist),
          updateComponents: mergedConfig.updateComponents
            ? {
                spriteUtils: mergedConfig.updateComponents.spriteUtils
                  ? resolve(
                      configDir,
                      mergedConfig.updateComponents.spriteUtils,
                    )
                  : undefined,
                AppIconSprite: mergedConfig.updateComponents.AppIconSprite
                  ? Array.isArray(mergedConfig.updateComponents.AppIconSprite)
                    ? mergedConfig.updateComponents.AppIconSprite.map(file =>
                        resolve(configDir, file),
                      )
                    : resolve(
                        configDir,
                        mergedConfig.updateComponents.AppIconSprite,
                      )
                  : undefined,
              }
            : undefined,
        };

        const generator = new SpriteGenerator({
          name: mergedConfig.name,
          src: resolvedConfig.src,
          dist: resolvedConfig.dist,
          spriteName: resolvedConfig.spriteName,
          hrefBasePath: resolvedConfig.hrefBasePath,
          verbose: resolvedConfig.verbose,
          hashLength: resolvedConfig.hashLength,
          enableHashRevving: resolvedConfig.enableHashRevving,
          svgoConfig: resolvedConfig.svgoConfig,
          customSvgoConfig: resolvedConfig.customSvgoConfig,
          generateShowcase: resolvedConfig.generateShowcase,
        });
        const result = await generator.generate();

        if (resolvedConfig.updateComponents) {
          const spriteUrl = `${resolvedConfig.hrefBasePath}${result.spriteFile}`;
          await generator.updateComponents(
            spriteUrl,
            resolvedConfig.updateComponents,
          );
        }

        results.push({
          name: mergedConfig.name || 'unnamed',
          success: true,
          iconCount: result.iconCount,
          spritePath: result.spriteFile,
          spriteUrl: `${mergedConfig.hrefBasePath}${result.spriteFile}`,
        });

        this.logger.success(`  ✓ Generated ${result.iconCount} icons`);
        this.logger.log(`  ✓ Sprite file: ${result.spriteFile}`);
        this.logger.log(`  ✓ File size: ${result.fileSize}`);
      } catch (error) {
        allSuccess = false;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        results.push({
          name: mergedConfig.name || 'unnamed',
          success: false,
          iconCount: 0,
          spritePath: '',
          spriteUrl: '',
          error: errorMessage,
        });

        this.logger.error(`  ✗ Failed: ${errorMessage}`);
      }
    }

    this.logger.info(
      `\nSprite generation completed. ${results.filter(r => r.success).length}/${results.length} successful.`,
    );

    return {
      success: allSuccess,
      results,
    };
  }

  async generateByName(name: string): Promise<{
    success: boolean;
    result?: {
      name: string;
      success: boolean;
      iconCount: number;
      spritePath: string;
      spriteUrl: string;
      error?: string;
    };
    error?: string;
  }> {
    const config = this.config.configurations.find(c => c.name === name);

    if (!config) {
      return {
        success: false,
        error: `Configuration '${name}' not found`,
      };
    }

    const mergedConfig = this.mergeWithDefaults(config);

    const configDir = this.getConfigFileDirectory();
    const resolvedConfig = {
      ...mergedConfig,
      src: resolve(configDir, mergedConfig.src),
      dist: resolve(configDir, mergedConfig.dist),
      updateComponents: mergedConfig.updateComponents
        ? {
            spriteUtils: mergedConfig.updateComponents.spriteUtils
              ? resolve(configDir, mergedConfig.updateComponents.spriteUtils)
              : undefined,
            AppIconSprite: mergedConfig.updateComponents.AppIconSprite
              ? Array.isArray(mergedConfig.updateComponents.AppIconSprite)
                ? mergedConfig.updateComponents.AppIconSprite.map(file =>
                    resolve(configDir, file),
                  )
                : resolve(
                    configDir,
                    mergedConfig.updateComponents.AppIconSprite,
                  )
              : undefined,
          }
        : undefined,
    };

    try {
      const generator = new SpriteGenerator({
        name: mergedConfig.name,
        src: resolvedConfig.src,
        dist: resolvedConfig.dist,
        spriteName: resolvedConfig.spriteName,
        hrefBasePath: resolvedConfig.hrefBasePath,
        verbose: resolvedConfig.verbose,
        hashLength: resolvedConfig.hashLength,
        enableHashRevving: resolvedConfig.enableHashRevving,
        svgoConfig: resolvedConfig.svgoConfig,
        customSvgoConfig: resolvedConfig.customSvgoConfig,
        generateShowcase: resolvedConfig.generateShowcase,
      });
      const result = await generator.generate();

      if (resolvedConfig.updateComponents) {
        const spriteUrl = `${resolvedConfig.hrefBasePath}${result.spriteFile}`;
        await generator.updateComponents(
          spriteUrl,
          resolvedConfig.updateComponents,
        );
      }

      return {
        success: true,
        result: {
          name: resolvedConfig.name || 'unnamed',
          success: true,
          iconCount: result.iconCount,
          spritePath: result.spriteFile,
          spriteUrl: `${resolvedConfig.hrefBasePath}${result.spriteFile}`,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  listConfigurations(): Array<{
    name: string;
    src: string;
    dist: string;
    spriteName: string;
    hrefBasePath: string;
  }> {
    return this.config.configurations.map(config => {
      const merged = this.mergeWithDefaults(config);
      return {
        name: merged.name || 'unnamed',
        src: merged.src,
        dist: merged.dist,
        spriteName: merged.spriteName || 'sprite',
        hrefBasePath: merged.hrefBasePath || '/sprite/',
      };
    });
  }
}
