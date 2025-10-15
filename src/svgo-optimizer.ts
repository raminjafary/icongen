import { optimize, Config, PluginConfig } from 'svgo';
import fs from 'fs';
import path from 'path';
import inlineDefsPlugin from './svgo-inline-defs-plugin.js';

export interface SVGOptimizerOptions {
  verbose?: boolean;
  multipass?: boolean;
  floatPrecision?: number;
  removeViewBox?: boolean;
  removeDimensions?: boolean;
  cleanupIds?: boolean;
  convertColors?: boolean;
  inlineDefs?: boolean;
}

export class SVGOptimizer {
  private config: Config;
  private options: SVGOptimizerOptions;

  constructor(options: SVGOptimizerOptions = {}) {
    this.options = {
      verbose: false,
      multipass: true,
      floatPrecision: 2,
      removeViewBox: false,
      removeDimensions: true,
      cleanupIds: true,
      convertColors: true,
      inlineDefs: true,
      ...options,
    };

    this.config = this.buildConfig();
  }

  private buildConfig(): Config {
    const plugins: PluginConfig[] = [
      'preset-default',
      {
        name: 'removeAttrs',
        params: {
          attrs: [
            'clip-rule',
            'data-name',
            'data-*',
            'sketch:*',
            'xmlns:sketch',
            'xmlns:xlink',
            'version',
            'baseProfile',
            'enable-background',
            'xml:space',
          ],
        },
      },
    ];

    if (this.options.inlineDefs) {
      plugins.push(inlineDefsPlugin);
    }

    return {
      multipass: this.options.multipass,
      floatPrecision: this.options.floatPrecision,
      plugins,
    };
  }

  getConfig(): Config {
    return this.config;
  }

  updateConfig(newOptions: Partial<SVGOptimizerOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.config = this.buildConfig();
  }

  getBasicConfig(): Config {
    return {
      multipass: false,
      floatPrecision: 2,
      plugins: [
        'preset-default',
        {
          name: 'removeAttrs',
          params: {
            attrs: ['fill', 'stroke.*'],
          },
        },
        {
          name: 'addAttributesToSVGElement',
          params: {
            attributes: [{ fill: 'currentColor' }],
          },
        },
      ],
    };
  }

  getIconFontConfig(): Config {
    return {
      multipass: true,
      floatPrecision: 1,
      plugins: [
        'preset-default',
        {
          name: 'removeAttrs',
          params: {
            attrs: [
              'clip-rule',
              'data-name',
              'data-*',
              'sketch:*',
              'xmlns:sketch',
              'xmlns:xlink',
              'version',
              'baseProfile',
              'enable-background',
              'xml:space',
            ],
          },
        },
        inlineDefsPlugin,
      ],
    };
  }

  getWebConfig(): Config {
    const config = this.getConfig();
    if (config.plugins) {
      config.plugins = config.plugins.filter(plugin => {
        if (typeof plugin === 'string') {
          return plugin !== 'removeViewBox';
        }
        return plugin.name !== 'removeViewBox';
      });
    }
    return config;
  }

  async optimizeFile(filePath: string): Promise<string> {
    try {
      const svgContent = fs.readFileSync(filePath, 'utf8');
      const result = optimize(svgContent, {
        path: filePath,
        ...this.config,
      });

      if (this.options.verbose) {
        this.logOptimizationResult(filePath, svgContent, result.data);
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Failed to optimize ${filePath}:`, error);
      throw error;
    }
  }

  private logOptimizationResult(
    filePath: string,
    originalContent: string,
    optimizedContent: string,
  ): void {
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    console.log(
      `📦 ${path.basename(filePath)}: ${originalSize}B → ${optimizedSize}B (saved ${savedPercent}%)`,
    );
  }

  async optimizeDirectory(srcDir: string, outputDir?: string): Promise<void> {
    const outDir = outputDir || srcDir;

    if (!fs.existsSync(srcDir)) {
      throw new Error(`Source directory does not exist: ${srcDir}`);
    }

    if (outDir !== srcDir && !fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.svg'));

    if (this.options.verbose) {
      console.log(`🎯 Optimizing ${files.length} SVG files...`);
    }

    const { totalOriginalSize, totalOptimizedSize } = await this.processFiles(
      srcDir,
      outDir,
      files,
    );

    if (this.options.verbose) {
      this.logTotalOptimizationResult(totalOriginalSize, totalOptimizedSize);
    }
  }

  private async processFiles(
    srcDir: string,
    outDir: string,
    files: string[],
  ): Promise<{ totalOriginalSize: number; totalOptimizedSize: number }> {
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const file of files) {
      const filePath = path.join(srcDir, file);
      const outputPath = path.join(outDir, file);

      const originalContent = fs.readFileSync(filePath, 'utf8');
      const optimizedContent = await this.optimizeFile(filePath);

      totalOriginalSize += Buffer.byteLength(originalContent, 'utf8');
      totalOptimizedSize += Buffer.byteLength(optimizedContent, 'utf8');

      fs.writeFileSync(outputPath, optimizedContent);
    }

    return { totalOriginalSize, totalOptimizedSize };
  }

  private logTotalOptimizationResult(
    totalOriginalSize: number,
    totalOptimizedSize: number,
  ): void {
    const totalSaved = totalOriginalSize - totalOptimizedSize;
    const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(
      1,
    );
    console.log(`✅ Optimization complete!`);
    console.log(
      `📊 Total: ${totalOriginalSize}B → ${totalOptimizedSize}B (saved ${totalSavedPercent}%)`,
    );
  }
}

export default SVGOptimizer;
