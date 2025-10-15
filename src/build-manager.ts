import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export interface BuildManagerOptions {
  verbose?: boolean;
  enableHashRevving?: boolean;
}

export class BuildManager {
  private options: Required<BuildManagerOptions>;
  private contentHash: string = '';

  constructor(options: BuildManagerOptions = {}) {
    this.options = {
      verbose: options.verbose || false,
      enableHashRevving: options.enableHashRevving !== false,
    };
  }

  generateContentHash(svgDirectory: string): string {
    if (!this.options.enableHashRevving) {
      return '';
    }

    try {
      const svgFiles = fs
        .readdirSync(svgDirectory)
        .filter(file => file.endsWith('.svg'))
        .sort();

      if (svgFiles.length === 0) {
        if (this.options.verbose) {
          console.warn('⚠️  No SVG files found for hash generation');
        }
        return '';
      }

      const contentBuffer = Buffer.concat(
        svgFiles.map(file => {
          const filePath = path.join(svgDirectory, file);
          return fs.readFileSync(filePath);
        }),
      );

      const hash = createHash('sha256').update(contentBuffer).digest('hex');
      this.contentHash = hash.substring(0, 8);

      if (this.options.verbose) {
        console.log(`🔐 Generated content hash: ${this.contentHash}`);
      }

      return this.contentHash;
    } catch (error) {
      if (this.options.verbose) {
        console.warn(
          '⚠️  Failed to generate content hash, using timestamp fallback:',
          error,
        );
      }
      this.contentHash = Date.now().toString(36);
      return this.contentHash;
    }
  }

  getHashedFilename(baseName: string, extension: string): string {
    if (!this.contentHash) {
      return `${baseName}.${extension}`;
    }
    return `${baseName}.${this.contentHash}.${extension}`;
  }

  getContentHash(): string {
    return this.contentHash;
  }

  isHashRevvingEnabled(): boolean {
    return this.options.enableHashRevving;
  }

  async renameFilesWithHash(
    distDirectory: string,
    fontName: string,
    updateCSS: boolean = true,
  ): Promise<void> {
    if (!this.contentHash) {
      if (this.options.verbose) {
        console.log('ℹ️  No content hash available, skipping file renaming');
      }
      return;
    }

    const filesToRename = [
      { old: `${fontName}.ttf`, new: this.getHashedFilename(fontName, 'ttf') },
      {
        old: `${fontName}.woff`,
        new: this.getHashedFilename(fontName, 'woff'),
      },
      {
        old: `${fontName}.woff2`,
        new: this.getHashedFilename(fontName, 'woff2'),
      },
      { old: `${fontName}.eot`, new: this.getHashedFilename(fontName, 'eot') },
      { old: `${fontName}.svg`, new: this.getHashedFilename(fontName, 'svg') },
    ];

    for (const { old, new: newName } of filesToRename) {
      const oldPath = path.join(distDirectory, old);
      const newPath = path.join(distDirectory, newName);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        if (this.options.verbose) {
          console.log(`🔄 Renamed: ${old} → ${newName}`);
        }
      }
    }

    if (updateCSS) {
      await this.updateCSSWithHashedFilenames(distDirectory, fontName);
    }
  }

  private async updateCSSWithHashedFilenames(
    distDirectory: string,
    fontName: string,
  ): Promise<void> {
    const cssPath = path.join(distDirectory, `${fontName}.css`);
    if (!fs.existsSync(cssPath)) {
      if (this.options.verbose) {
        console.warn('⚠️  CSS file not found, skipping CSS update');
      }
      return;
    }

    try {
      let cssContent = fs.readFileSync(cssPath, 'utf8');

      const replacements = [
        {
          old: `${fontName}.ttf`,
          new: this.getHashedFilename(fontName, 'ttf'),
        },
        {
          old: `${fontName}.woff`,
          new: this.getHashedFilename(fontName, 'woff'),
        },
        {
          old: `${fontName}.woff2`,
          new: this.getHashedFilename(fontName, 'woff2'),
        },
        {
          old: `${fontName}.eot`,
          new: this.getHashedFilename(fontName, 'eot'),
        },
        {
          old: `${fontName}.svg`,
          new: this.getHashedFilename(fontName, 'svg'),
        },
      ];

      for (const { old, new: newName } of replacements) {
        const patterns = [
          new RegExp(
            `url\\(['"]?${old.replace(/\./g, '\\.')}\\?[^'"]*['"]?\\)`,
            'g',
          ),
          new RegExp(`url\\(['"]?${old.replace(/\./g, '\\.')}['"]?\\)`, 'g'),
        ];

        for (const pattern of patterns) {
          cssContent = cssContent.replace(pattern, `url("${newName}")`);
        }
      }

      fs.writeFileSync(cssPath, cssContent);

      if (this.options.verbose) {
        console.log(`🔧 Updated CSS to reference hashed font files`);
      }
    } catch (error) {
      console.error('❌ Failed to update CSS with hashed filenames:', error);
    }
  }

  generateManifest(
    distDirectory: string,
    fontName: string,
    iconList: string[],
  ): void {
    if (!this.contentHash) {
      if (this.options.verbose) {
        console.log(
          'ℹ️  No content hash available, skipping manifest generation',
        );
      }
      return;
    }

    try {
      const fontFiles = [
        this.getHashedFilename(fontName, 'ttf'),
        this.getHashedFilename(fontName, 'woff'),
        this.getHashedFilename(fontName, 'woff2'),
        this.getHashedFilename(fontName, 'eot'),
        this.getHashedFilename(fontName, 'svg'),
      ];

      const fileSizes: Record<string, string> = {};
      let totalSize = 0;

      for (const fileName of fontFiles) {
        const filePath = path.join(distDirectory, fileName);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const sizeInBytes = stats.size;
          totalSize += sizeInBytes;

          let sizeDisplay: string;
          if (sizeInBytes < 1024) {
            sizeDisplay = `${sizeInBytes}B`;
          } else if (sizeInBytes < 1024 * 1024) {
            sizeDisplay = `${(sizeInBytes / 1024).toFixed(1)}KB`;
          } else {
            sizeDisplay = `${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`;
          }

          fileSizes[fileName] = sizeDisplay;
        }
      }

      const manifest = {
        version: '1.0.0',
        hash: this.contentHash,
        generatedAt: new Date().toISOString(),
        css: `${fontName}.css`,
        fonts: {
          ttf: this.getHashedFilename(fontName, 'ttf'),
          woff: this.getHashedFilename(fontName, 'woff'),
          woff2: this.getHashedFilename(fontName, 'woff2'),
          eot: this.getHashedFilename(fontName, 'eot'),
          svg: this.getHashedFilename(fontName, 'svg'),
        },
        icons: iconList,
        totalSize,
        fileSizes,
      };

      const manifestPath = path.join(distDirectory, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      if (this.options.verbose) {
        console.log(`📋 Generated manifest: ${manifestPath}`);
      }
    } catch (error) {
      console.error('❌ Failed to generate manifest:', error);
    }
  }
}

export default BuildManager;
