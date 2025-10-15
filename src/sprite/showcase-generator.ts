import { basename, extname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { Logger, createLogger } from './logger.js';

export interface ShowcaseIcon {
  name: string;
  id: string;
}

export interface ShowcaseGeneratorOptions {
  verbose?: boolean;
}

export class ShowcaseGenerator {
  private options: Required<ShowcaseGeneratorOptions>;
  private logger: Logger;

  constructor(options: ShowcaseGeneratorOptions = {}) {
    this.options = {
      verbose: options.verbose || false,
    };
    this.logger = createLogger({ verbose: this.options.verbose });
  }

  async generateShowcase(
    svgFiles: string[],
    spriteFile: string,
    _spriteUrl: string,
    outputDir: string,
    generateSpriteId: (filepath: string) => string,
  ): Promise<void> {
    this.logger.info('🎨 Generating showcase HTML...');

    const showcaseIcons = svgFiles.slice(0, 3);
    const icons = this.processIcons(showcaseIcons, generateSpriteId);

    const localSpriteUrl = spriteFile;
    const showcaseHtml = this.createShowcaseHtml(icons, localSpriteUrl);

    const showcasePath = resolve(outputDir, 'index.html');
    writeFileSync(showcasePath, showcaseHtml, 'utf-8');

    this.logger.output(`📄 Showcase generated: ${showcasePath}`);
  }

  private processIcons(
    iconFiles: string[],
    generateSpriteId: (filepath: string) => string,
  ): ShowcaseIcon[] {
    return iconFiles.map(file => {
      const fileName = basename(file, extname(file));
      const iconId = generateSpriteId(file);
      return { name: fileName, id: iconId };
    });
  }

  private createShowcaseHtml(icons: ShowcaseIcon[], spriteUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IconGen Icons Sprite Showcase</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: #666;
            font-size: 1.1rem;
        }

        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem;
            border: 2px solid #f0f0f0;
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        }

        .icon-item:hover {
            border-color: #667eea;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
            transform: translateY(-2px);
        }

        .icon-display {
            width: 24px;
            height: 24px;
            margin-bottom: 1rem;
            color: #333;
            transition: color 0.3s ease;
        }

        .icon-item:hover .icon-display {
            color: #667eea;
        }

        .icon-name {
            font-weight: 600;
            color: #555;
            margin-bottom: 0.5rem;
            text-align: center;
        }

        .icon-id {
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            color: #888;
            background: #f8f9fa;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            margin-bottom: 0.5rem;
        }

        .copy-feedback {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .copy-feedback.show {
            opacity: 1;
        }

        .usage-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        .usage-section h3 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }

        .code-block {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        .sprite-info {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .sprite-info h4 {
            color: #2e7d32;
            margin-bottom: 0.5rem;
        }

        .sprite-info p {
            color: #2e7d32;
            margin: 0.25rem 0;
        }

        .sprite-info code {
            background: #c8e6c9;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #1b5e20;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>IconGen Icons Sprite</h1>
            <p>SVG Sprite Showcase - ${icons.length} Icons</p>
        </header>

        <div class="sprite-info">
            <h4>📦 Sprite Information</h4>
            <p><strong>Sprite URL:</strong> <code>${spriteUrl}</code></p>
            <p><strong>Total Icons:</strong> ${icons.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="icon-grid">
            ${icons
              .map(
                icon => `
                <div class="icon-item" data-id="${icon.id}">
                    <div class="copy-feedback">Copied!</div>
                    <svg class="icon-display" width="24" height="24" fill="currentColor">
                        <use href="${spriteUrl}#${icon.id}"></use>
                    </svg>
                    <div class="icon-name">${icon.name}</div>
                    <div class="icon-id">#${icon.id}</div>
                </div>
            `,
              )
              .join('')}
        </div>

        <div class="usage-section">
            <h3>🚀 How to Use</h3>
            
            <h4>1. Include the sprite in your HTML:</h4>
            <div class="code-block">
&lt;svg width="24" height="24" fill="currentColor"&gt;
    &lt;use href="${spriteUrl}#${icons[0]?.id || 'icon-name'}"&gt;&lt;/use&gt;
&lt;/svg&gt;
            </div>

            <h4>2. Vue Component Usage:</h4>
            <div class="code-block">
&lt;template&gt;
    &lt;svg width="24" height="24" fill="currentColor"&gt;
        &lt;use :href="\`${spriteUrl}#\${iconName}\`"&gt;&lt;/use&gt;
    &lt;/svg&gt;
&lt;/template&gt;
            </div>

            <h4>3. React Component Usage:</h4>
            <div class="code-block">
const Icon = ({ name, size = 24 }) => (
    &lt;svg width={size} height={size} fill="currentColor"&gt;
        &lt;use href={\`${spriteUrl}#\${name}\`}&gt;&lt;/use&gt;
    &lt;/svg&gt;
);
            </div>

            <h4>4. Available Icons:</h4>
            <div class="code-block">
${icons.map(icon => `#${icon.id} - ${icon.name}`).join('\n')}
            </div>
        </div>
    </div>

    <script>
        document.querySelectorAll('.icon-item').forEach(item => {
            item.addEventListener('click', () => {
                const iconId = item.dataset.id;
                const copyText = \`&lt;svg width="24" height="24" fill="currentColor"&gt;
    &lt;use href="${spriteUrl}#\${iconId}"&gt;&lt;/use&gt;
&lt;/svg&gt;\`;

                navigator.clipboard.writeText(copyText).then(() => {
                    const feedback = item.querySelector('.copy-feedback');
                    feedback.classList.add('show');
                    setTimeout(() => {
                        feedback.classList.remove('show');
                    }, 2000);
                });
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            const iconItems = document.querySelectorAll('.icon-item');
            iconItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    </script>
</body>
</html>`;
  }
}

export default ShowcaseGenerator;
