import svgToFont from 'svgtofont';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { SVGOptimizer } from './svgo-optimizer.js';
import { BuildManager } from './build-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IconInfo {
  encodedCode: string;
  className?: string;
  [key: string]: unknown;
}

export interface FontGeneratorOptions {
  src: string;
  dist: string;
  fontName?: string;
  cssPrefix?: string;
  verbose?: boolean;
  website?: boolean;
  fixStrokes?: boolean;
  optimize?: boolean;
  formats?: ('ttf' | 'eot' | 'woff' | 'woff2' | 'svg')[];
  enableHashRevving?: boolean;
}

export class FontGenerator {
  private options: Required<FontGeneratorOptions>;
  private buildManager: BuildManager;

  constructor(options: FontGeneratorOptions) {
    this.options = {
      src: options.src,
      dist: options.dist,
      fontName: options.fontName || 'icongen-icons',
      cssPrefix: options.cssPrefix || 'icongen',
      verbose: options.verbose || false,
      website: options.website || false,
      fixStrokes: options.fixStrokes !== false, // Default to true
      optimize: options.optimize || true,
      formats: options.formats || ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      enableHashRevving: options.enableHashRevving !== false, // Default to true
    };

    this.buildManager = new BuildManager({
      verbose: this.options.verbose,
      enableHashRevving: this.options.enableHashRevving,
    });
  }

  async generate(): Promise<void> {
    try {
      const contentHash = this.buildManager.generateContentHash(
        this.options.src,
      );

      if (this.options.verbose) {
        console.log('🎯 Starting font generation...');
        console.log(`📁 Source: ${this.options.src}`);
        console.log(`📦 Output: ${this.options.dist}`);
        console.log(`🎨 Font name: ${this.options.fontName}`);
        console.log(`🏷️  CSS prefix: ${this.options.cssPrefix}`);
        if (contentHash) {
          console.log(`🔐 Content hash: ${contentHash}`);
        }
      }

      if (!fs.existsSync(this.options.dist)) {
        fs.mkdirSync(this.options.dist, { recursive: true });
      }

      const tempDir = path.join(this.options.dist, 'temp-svg-processed');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      if (this.options.fixStrokes) {
        if (this.options.verbose) {
          console.log(
            '🔧 Converting stroke-based SVGs to fills for proper font generation...',
          );
        }

        try {
          const command = `npx oslllo-svg-fixer -s "${this.options.src}" -d "${tempDir}"`;

          if (this.options.verbose) {
            console.log(`Running: ${command}`);
          }

          execSync(command, {
            stdio: this.options.verbose ? 'inherit' : 'pipe',
            cwd: process.cwd(),
          });

          if (this.options.verbose) {
            console.log(
              '✅ Successfully converted strokes to fills for font compatibility',
            );
          }

          const processedFiles = fs
            .readdirSync(tempDir)
            .filter(file => file.endsWith('.svg'));
          for (const file of processedFiles) {
            const oldPath = path.join(tempDir, file);

            const cleanFileName = file
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-+|-+$/g, '');
            const newPath = path.join(tempDir, cleanFileName);

            if (file !== cleanFileName) {
              fs.renameSync(oldPath, newPath);
              if (this.options.verbose) {
                console.log(`🔄 Renamed: "${file}" → "${cleanFileName}"`);
              }
            }
          }
        } catch (error) {
          if (this.options.verbose) {
            console.warn(
              '⚠️  SVGFixer failed, falling back to basic processing...',
            );
            console.warn(error);
          }

          const svgFiles = fs
            .readdirSync(this.options.src)
            .filter(file => file.endsWith('.svg'));
          for (const file of svgFiles) {
            const sourcePath = path.join(this.options.src, file);

            const cleanFileName = file
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-+|-+$/g, '');
            const targetPath = path.join(tempDir, cleanFileName);
            let content = fs.readFileSync(sourcePath, 'utf8');

            content = content
              .replace(/stroke="[^"]*"/g, 'fill="currentColor"')
              .replace(/fill="none"/g, '')
              .replace(/stroke-width="[^"]*"/g, '')
              .replace(/stroke-linecap="[^"]*"/g, '')
              .replace(/stroke-linejoin="[^"]*"/g, '')
              .replace(/<svg[^>]*>/g, match => {
                const viewBoxMatch = match.match(/viewBox="([^"]+)"/);
                const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
                return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">`;
              });

            fs.writeFileSync(targetPath, content);
          }
        }
      } else {
        if (this.options.verbose) {
          console.log('📋 Copying SVG files without stroke conversion...');
        }

        const svgFiles = fs
          .readdirSync(this.options.src)
          .filter(file => file.endsWith('.svg'));
        for (const file of svgFiles) {
          const sourcePath = path.join(this.options.src, file);

          const cleanFileName = file
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
          const targetPath = path.join(tempDir, cleanFileName);
          fs.copyFileSync(sourcePath, targetPath);
        }
      }

      if (this.options.optimize) {
        if (this.options.verbose) {
          console.log('\n📦 Optimizing SVG files with SVGO...');
        }

        try {
          const optimizer = new SVGOptimizer({
            verbose: this.options.verbose,
            inlineDefs: true,
            floatPrecision: 2,
            removeViewBox: false,
            removeDimensions: true,
            cleanupIds: true,
            convertColors: true,
          });

          await optimizer.optimizeDirectory(tempDir, tempDir);

          if (this.options.verbose) {
            console.log('✅ SVG optimization completed successfully!');
          }
        } catch (error) {
          if (this.options.verbose) {
            console.warn(
              '⚠️  SVG optimization failed, continuing with unoptimized files...',
            );
            console.warn(error);
          }
        }
      }

      await svgToFont({
        src: tempDir,
        dist: this.options.dist,
        fontName: this.options.fontName,
        css: true,
        outSVGReact: false,
        outSVGPath: false,
        generateInfoData: true,
        svgicons2svgfont: {
          fontHeight: 1000,
          normalize: true,
          centerHorizontally: true,
          centerVertically: false,
          ascent: 800,
          descent: 200,
          fixedWidth: true,
          round: 10e12,
        },
        website: undefined,
      });

      if (this.options.verbose) {
        console.log('✅ Font generation completed successfully!');
        console.log(`📄 Generated files in: ${this.options.dist}`);
      }

      if (this.buildManager.isHashRevvingEnabled()) {
        await this.buildManager.renameFilesWithHash(
          this.options.dist,
          this.options.fontName,
        );
      }

      await this.normalizeCSSClassNames();

      await this.generateTypes();

      await this.generateCustomShowcase();

      this.buildManager.generateManifest(
        this.options.dist,
        this.options.fontName,
        this.getIconList(),
      );

      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (this.options.verbose) {
          console.log('🧹 Cleaned up temporary files');
        }
      }
    } catch (error) {
      console.error('❌ Font generation failed:', error);
      throw error;
    }
  }

  private async generateCustomShowcase(): Promise<void> {
    if (this.options.verbose) {
      console.log('🔍 generateCustomShowcase called');
    }

    const possibleTemplatePaths = [
      path.join(__dirname, 'template.html'),
      path.join(__dirname, '../src/template.html'),
      path.join(process.cwd(), 'src/template.html'),
    ];

    let templatePath = '';
    for (const possiblePath of possibleTemplatePaths) {
      if (fs.existsSync(possiblePath)) {
        templatePath = possiblePath;
        break;
      }
    }

    if (!templatePath) {
      if (this.options.verbose) {
        console.log(
          '⚠️  Custom template not found, skipping showcase generation',
        );
      }
      return;
    }

    const showcasePath = path.join(this.options.dist, 'index.html');

    try {
      if (this.options.verbose) {
        console.log(`📄 Using template: ${templatePath}`);
      }

      let template = fs.readFileSync(templatePath, 'utf8');

      if (this.options.verbose) {
        console.log(`🔍 Template read from: ${templatePath}`);
        console.log(`🔍 Template length: ${template.length}`);
        console.log(
          `🔍 Template contains {{fileSizes}}: ${template.includes('{{fileSizes}}')}`,
        );
        console.log(
          `🔍 Template contains {{contentHash}}: ${template.includes('{{contentHash}}')}`,
        );
        console.log(
          `🔍 Template contains {{generationTime}}: ${template.includes('{{generationTime}}')}`,
        );
      }

      const infoPath = path.join(this.options.dist, 'info.json');
      let iconInfo: Record<string, IconInfo> = {};

      if (fs.existsSync(infoPath)) {
        iconInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8')) as Record<
          string,
          IconInfo
        >;
      }

      const fontFiles = [
        this.buildManager.getHashedFilename(this.options.fontName, 'ttf'),
        this.buildManager.getHashedFilename(this.options.fontName, 'woff'),
        this.buildManager.getHashedFilename(this.options.fontName, 'woff2'),
        this.buildManager.getHashedFilename(this.options.fontName, 'eot'),
        this.buildManager.getHashedFilename(this.options.fontName, 'svg'),
        `${this.options.fontName}.css`,
        'types.ts',
        'index.html',
      ];

      if (this.options.verbose) {
        console.log('🔍 Font files to check for sizes:');
        fontFiles.forEach(file => console.log(`  - ${file}`));
      }

      const fileSizes: Record<string, string> = {};
      let totalSize = 0;

      for (const fileName of fontFiles) {
        const filePath = path.join(this.options.dist, fileName);
        if (this.options.verbose) {
          console.log(`🔍 Checking file: ${fileName} at ${filePath}`);
          console.log(`🔍 File exists: ${fs.existsSync(filePath)}`);
        }
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
          if (this.options.verbose) {
            console.log(`🔍 File size for ${fileName}: ${sizeDisplay}`);
          }
        } else {
          if (this.options.verbose) {
            console.log(`⚠️  File not found: ${fileName}`);
          }
        }
      }

      let totalSizeDisplay: string;
      if (totalSize < 1024) {
        totalSizeDisplay = `${totalSize}B`;
      } else if (totalSize < 1024 * 1024) {
        totalSizeDisplay = `${(totalSize / 1024).toFixed(1)}KB`;
      } else {
        totalSizeDisplay = `${(totalSize / (1024 * 1024)).toFixed(1)}MB`;
      }

      if (this.options.verbose) {
        console.log('🔍 Final fileSizes object:');
        console.log(JSON.stringify(fileSizes, null, 2));
        console.log(`🔍 Total size: ${totalSizeDisplay}`);
      }

      const icons = Object.entries(iconInfo).map(([originalName, info]) => {
        let actualClassName =
          info.className ||
          `${this.options.cssPrefix}-${originalName.replace(/\s+/g, '-')}`;
        actualClassName = actualClassName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');

        const searchableName = originalName
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase();

        const hexCode = info.encodedCode
          ? info.encodedCode.replace('\\', 'U+')
          : '';

        return {
          name: searchableName,
          originalName: originalName,
          className: actualClassName,
          unicode: hexCode,
          unicodeHex: info.encodedCode || '',
          encodedCode: info.encodedCode || '',
        };
      });

      if (this.options.verbose) {
        console.log('🔍 Replacing template variables...');
        console.log('🔍 Content hash:', this.buildManager.getContentHash());
        console.log('🔍 Generation time:', new Date().toLocaleString());
      }

      template = template
        .replace(/\{\{title\}\}/g, this.options.fontName)
        .replace(/\{\{fontname\}\}/g, this.options.fontName)
        .replace(/\{\{classname\}\}/g, this.options.cssPrefix)
        .replace(/\{\{count\}\}/g, icons.length.toString())
        .replace(/\{\{totalSize\}\}/g, totalSizeDisplay)
        .replace(
          /\{\{description\}\}/g,
          `${this.options.fontName} icon font with ${icons.length} icons`,
        )
        .replace(/\{\{keywords\}\}/g, 'icons,font,svg,webfont')
        .replace(
          /\{\{contentHash\}\}/g,
          this.buildManager.getContentHash() || 'N/A',
        )
        .replace(/\{\{generationTime\}\}/g, new Date().toLocaleString());

      if (this.options.verbose) {
        console.log('🔍 Template variables replaced');
        console.log(
          '🔍 Template now contains {{fileSizes}}:',
          template.includes('{{fileSizes}}'),
        );
        console.log(
          '🔍 Template now contains {{contentHash}}:',
          template.includes('{{contentHash}}'),
        );
        console.log(
          '🔍 Template now contains {{generationTime}}:',
          template.includes('{{generationTime}}'),
        );
      }

      if (this.options.verbose) {
        console.log('🔍 About to call replaceIconLoop...');
      }
      template = this.replaceIconLoop(template, icons);
      if (this.options.verbose) {
        console.log('🔍 replaceIconLoop completed');
        console.log(
          '🔍 Template now contains {{fileSizes}}:',
          template.includes('{{fileSizes}}'),
        );
      }

      if (this.options.verbose) {
        console.log('🔍 About to call replaceFileSizes...');
      }
      template = this.replaceFileSizes(template, fileSizes);
      if (this.options.verbose) {
        console.log('🔍 replaceFileSizes completed');
        console.log(
          '🔍 Template now contains {{fileSizes}}:',
          template.includes('{{fileSizes}}'),
        );
      }

      if (this.options.verbose) {
        console.log('🔍 About to process conditional blocks...');
      }
      template = this.processConditionalBlocks(template);
      if (this.options.verbose) {
        console.log('🔍 Conditional blocks processed');
        console.log(
          '🔍 Template now contains {{fileSizes}}:',
          template.includes('{{fileSizes}}'),
        );
        console.log(
          '🔍 Template now contains {{contentHash}}:',
          template.includes('{{contentHash}}'),
        );
        console.log(
          '🔍 Template now contains {{generationTime}}:',
          template.includes('{{generationTime}}'),
        );
      }

      if (this.options.verbose) {
        console.log(
          '🔍 Final template contains {{fileSizes}}:',
          template.includes('{{fileSizes}}'),
        );
        console.log(
          '🔍 Final template contains {{contentHash}}:',
          template.includes('{{contentHash}}'),
        );
        console.log(
          '🔍 Final template contains {{generationTime}}:',
          template.includes('{{generationTime}}'),
        );
      }

      fs.writeFileSync(showcasePath, template);

      if (this.options.verbose) {
        console.log(`🌐 Generated custom showcase: ${showcasePath}`);
        console.log(`📊 Total font package size: ${totalSizeDisplay}`);
      }
    } catch (error) {
      console.error('❌ Failed to generate custom showcase:', error);
    }
  }

  private async generateTypes(): Promise<void> {
    const svgFiles = fs
      .readdirSync(this.options.src)
      .filter(file => file.endsWith('.svg'))
      .map(file => {
        return file
          .replace('.svg', '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      });

    const typeDefinition = `// Auto-generated types for ${this.options.fontName}
export type IconName = ${svgFiles.map(name => `'${name}'`).join(' | ')};

export interface IconProps {
  name: IconName;
  size?: string | number;
  color?: string;
  className?: string;
}

export const iconNames: IconName[] = [
  ${svgFiles.map(name => `'${name}'`).join(',\n  ')}
];

export default iconNames;
`;

    const typesPath = path.join(this.options.dist, 'types.ts');
    fs.writeFileSync(typesPath, typeDefinition);

    if (this.options.verbose) {
      console.log(`📝 Generated TypeScript types: ${typesPath}`);
    }
  }

  private replaceIconLoop(
    template: string,
    icons: Array<{
      name: string;
      className: string;
      originalName: string;
      unicode: string;
      unicodeHex: string;
      encodedCode: string;
    }>,
  ): string {
    const iconsHtml = icons
      .map(
        icon => `
        <div class="icon-item" data-name="${icon.name}" data-class="${icon.className}">
            <div class="copy-feedback">Copied!</div>
            <div class="icon-display ${icon.className}"></div>
            <div class="icon-name">${icon.originalName}</div>
            <div class="icon-class">.${icon.className}</div>
            <div class="icon-unicode">${icon.unicode}</div>
        </div>`,
      )
      .join('');

    const iconLoopPattern = /{% for icon in icons %}[\s\S]*?{% endfor %}/;
    return template.replace(iconLoopPattern, iconsHtml);
  }

  private replaceFileSizes(
    template: string,
    fileSizes: Record<string, string>,
  ): string {
    if (this.options.verbose) {
      console.log('🔍 replaceFileSizes called with fileSizes:');
      console.log(JSON.stringify(fileSizes, null, 2));
    }

    const fileSizesHtml = Object.entries(fileSizes)
      .map(
        ([fileName, size]) => `
        <div class="file-size-item">
          <span class="file-size">${size}</span>
          <span class="file-name">${fileName}</span>
        </div>
      `,
      )
      .join('');

    if (this.options.verbose) {
      console.log('🔍 Generated fileSizesHtml:');
      console.log(fileSizesHtml);
    }

    const result = template.replace(/\{\{fileSizes\}\}/g, fileSizesHtml);

    if (this.options.verbose) {
      console.log(
        '🔍 Template contains {{fileSizes}}:',
        template.includes('{{fileSizes}}'),
      );
      console.log(
        '🔍 Result contains fileSizesHtml:',
        result.includes(fileSizesHtml.substring(0, 50)),
      );
    }

    return result;
  }

  private processConditionalBlocks(template: string): string {
    if (this.options.verbose) {
      console.log('🔍 Processing conditional blocks...');
      console.log('🔍 Hash revving enabled:', this.options.enableHashRevving);
      console.log('🔍 Content hash:', this.buildManager.getContentHash());
    }

    if (this.options.enableHashRevving) {
      const startMarker = '{{#if hashRevvingEnabled}}';
      const endMarker = '{{/if}}';
      const elseMarker = '{{else}}';

      let result = template;

      while (result.includes(startMarker)) {
        const startIndex = result.indexOf(startMarker);
        const endIndex = result.indexOf(endMarker, startIndex);

        if (startIndex !== -1 && endIndex !== -1) {
          const beforeBlock = result.substring(0, startIndex);
          const afterBlock = result.substring(endIndex + endMarker.length);

          const blockContent = result.substring(
            startIndex + startMarker.length,
            endIndex,
          );

          const elseIndex = blockContent.indexOf(elseMarker);

          let selectedContent = '';
          if (elseIndex !== -1) {
            selectedContent = blockContent.substring(0, elseIndex);
          } else {
            selectedContent = blockContent;
          }

          selectedContent = selectedContent
            .replace(
              /\{\{contentHash\}\}/g,
              this.buildManager.getContentHash() || 'N/A',
            )
            .replace(/\{\{generationTime\}\}/g, new Date().toLocaleString())
            .replace(/\{\{fontname\}\}/g, this.options.fontName);

          result = beforeBlock + selectedContent + afterBlock;

          if (this.options.verbose) {
            console.log(
              '🔍 Processed conditional block, content length:',
              selectedContent.length,
            );
          }
        } else {
          break;
        }
      }

      return result;
    } else {
      const startMarker = '{{#if hashRevvingEnabled}}';
      const endMarker = '{{/if}}';
      const elseMarker = '{{else}}';

      let result = template;

      while (result.includes(startMarker)) {
        const startIndex = result.indexOf(startMarker);
        const endIndex = result.indexOf(endMarker, startIndex);

        if (startIndex !== -1 && endIndex !== -1) {
          const beforeBlock = result.substring(0, startIndex);
          const afterBlock = result.substring(endIndex + endMarker.length);

          const blockContent = result.substring(
            startIndex + startMarker.length,
            endIndex,
          );

          const elseIndex = blockContent.indexOf(elseMarker);

          let selectedContent = '';
          if (elseIndex !== -1) {
            selectedContent = blockContent.substring(
              elseIndex + elseMarker.length,
            );
          }

          selectedContent = selectedContent
            .replace(
              /\{\{contentHash\}\}/g,
              this.buildManager.getContentHash() || 'N/A',
            )
            .replace(/\{\{generationTime\}\}/g, new Date().toLocaleString())
            .replace(/\{\{fontname\}\}/g, this.options.fontName);

          result = beforeBlock + selectedContent + afterBlock;

          if (this.options.verbose) {
            console.log(
              '🔍 Processed conditional block (else), content length:',
              selectedContent.length,
            );
          }
        } else {
          break;
        }
      }

      return result;
    }
  }

  private async normalizeCSSClassNames(): Promise<void> {
    const cssPath = path.join(
      this.options.dist,
      `${this.options.fontName}.css`,
    );
    if (!fs.existsSync(cssPath)) {
      if (this.options.verbose) {
        console.warn(
          '⚠️  CSS file not found, skipping class name normalization',
        );
      }
      return;
    }

    try {
      let cssContent = fs.readFileSync(cssPath, 'utf8');

      const originalFiles = fs
        .readdirSync(this.options.src)
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));

      const nameMapping: Record<string, string> = {};
      for (const originalName of originalFiles) {
        const normalizedName = originalName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes

        if (originalName !== normalizedName) {
          nameMapping[originalName] = normalizedName;
        }
      }

      for (const [originalName, normalizedName] of Object.entries(
        nameMapping,
      )) {
        const originalClass = `.${this.options.cssPrefix}-${originalName}`;
        const normalizedClass = `.${this.options.cssPrefix}-${normalizedName}`;

        cssContent = cssContent.replace(
          new RegExp(originalClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          normalizedClass,
        );
      }

      fs.writeFileSync(cssPath, cssContent);

      if (this.options.verbose) {
        console.log(
          `🔧 Normalized CSS class names to lowercase with single dashes`,
        );
      }
    } catch (error) {
      console.error('❌ Failed to normalize CSS class names:', error);
    }
  }

  getIconList(): string[] {
    if (!fs.existsSync(this.options.src)) {
      return [];
    }

    return fs
      .readdirSync(this.options.src)
      .filter(file => file.endsWith('.svg'))
      .map(file => {
        return file
          .replace('.svg', '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      });
  }
}

export default FontGenerator;
