import { type SpriteConfig } from './sprite-generator.js';
import { MultiSpriteManager } from './multi-sprite-manager.js';
import { createLogger } from './logger.js';

interface CLIOptions {
  config?: string;
  src?: string[];
  dist?: string[];
  spriteName?: string[];
  hrefBasePath?: string[];
  verbose?: boolean;
  hashLength?: number;
  enableHashRevving?: boolean;
  svgoConfig?: 'default' | 'basic' | 'iconFont' | 'web' | 'custom';
  name?: string[];
  all?: boolean;
  list?: boolean;
  help?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1] || '';

    switch (arg) {
      case '--config':
      case '-c':
        options.config = nextArg;
        i++;
        break;
      case '--src':
      case '-s':
        options.src = options.src || [];
        options.src.push(nextArg);
        i++;
        break;
      case '--dist':
      case '-d':
        options.dist = options.dist || [];
        options.dist.push(nextArg);
        i++;
        break;
      case '--sprite-name':
        options.spriteName = options.spriteName || [];
        options.spriteName.push(nextArg);
        i++;
        break;
      case '--href-base-path':
        options.hrefBasePath = options.hrefBasePath || [];
        options.hrefBasePath.push(nextArg);
        i++;
        break;
      case '--name':
        options.name = options.name || [];
        options.name.push(nextArg);
        i++;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--hash-length':
        options.hashLength = parseInt(nextArg, 10);
        i++;
        break;
      case '--enable-hash-revving':
        options.enableHashRevving = true;
        break;
      case '--disable-hash-revving':
        options.enableHashRevving = false;
        break;
      case '--svgo-config':
        options.svgoConfig = nextArg as any;
        i++;
        break;
      case '--all':
      case '-a':
        options.all = true;
        break;
      case '--list':
      case '-l':
        options.list = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp(): void {
  const logger = createLogger({ verbose: true });
  logger.logAlways(`
🎨 IconGen Icons Sprite Generator

Usage:
  @raminjafary/icongen sprite [options]

Options:
  --config, -c <file>        Path to sprite configuration file (default: sprite-config.json)
  --src, -s <dir>           Source directory containing SVG files (can be used multiple times)
  --dist, -d <dir>          Output directory for generated sprite (can be used multiple times)
  --sprite-name <name>      Name of the generated sprite file (can be used multiple times)
  --href-base-path <path>   Base path for sprite URLs (can be used multiple times)
  --name <name>             Configuration name to generate (can be used multiple times)
  --all, -a                 Generate all configurations from config file
  --list, -l                List all available configurations
  --verbose, -v             Enable verbose output
  --hash-length <number>    Length of content hash (default: 10)
  --enable-hash-revving     Enable hash-based file revving
  --disable-hash-revving    Disable hash-based file revving
  --svgo-config <type>      SVGO configuration type: default, basic, iconFont, web, custom
  --help, -h                Show this help message

Examples:
  # Generate all configurations from config file
  @raminjafary/icongen sprite --all --verbose

  # Generate specific configuration by name
  @raminjafary/icongen sprite --name icons-sprite --verbose

  # Generate with multiple source/output pairs
  @raminjafary/icongen sprite --src ./examples/svg --dist ./dist/sprite --src ./examples/svg --dist ./dist

  # List available configurations
  @raminjafary/icongen sprite --list

  # Use custom config file
  @raminjafary/icongen sprite --config ./my-config.json --all

  # Generate sprite with specific SVGO config
  @raminjafary/icongen sprite --svgo-config web --verbose

Configuration File:
  Create a sprite-config.json file in your project root with options:
  {
    "src": "./examples/svg",
    "dist": "./dist/sprite",
    "spriteName": "icongen-sprite",
    "hrefBasePath": "/sprite/",
    "verbose": true,
    "hashLength": 10,
    "enableHashRevving": true,
    "svgoConfig": "default"
  }
`);
}

async function main(): Promise<void> {
  try {
    const cliOptions = parseArgs();
    const logger = createLogger({ verbose: cliOptions.verbose || false });

    if (cliOptions.help) {
      showHelp();
      return;
    }

    if (cliOptions.list) {
      const manager = new MultiSpriteManager({
        configFile: cliOptions.config,
        verbose: cliOptions.verbose,
      });

      const configurations = manager.listConfigurations();
      logger.logAlways('\n📋 Available configurations:');
      configurations.forEach((config, index) => {
        logger.logAlways(`  ${index + 1}. ${config.name}`);
        logger.logAlways(`     Source: ${config.src}`);
        logger.logAlways(`     Output: ${config.dist}`);
        logger.logAlways(`     Sprite: ${config.spriteName}`);
        logger.logAlways(`     Base Path: ${config.hrefBasePath}`);
        logger.logAlways('');
      });
      return;
    }

    if (
      cliOptions.src &&
      cliOptions.dist &&
      cliOptions.src.length === cliOptions.dist.length
    ) {
      const configurations: SpriteConfig[] = [];

      for (let i = 0; i < cliOptions.src.length; i++) {
        configurations.push({
          name: cliOptions.name?.[i] || `sprite-${i + 1}`,
          src: cliOptions.src[i]!,
          dist: cliOptions.dist[i]!,
          spriteName: cliOptions.spriteName?.[i] || 'icongen-sprite',
          hrefBasePath: cliOptions.hrefBasePath?.[i] || '/sprite/',
          verbose: cliOptions.verbose || false,
          hashLength: cliOptions.hashLength || 10,
          enableHashRevving:
            cliOptions.enableHashRevving !== undefined
              ? cliOptions.enableHashRevving
              : true,
          svgoConfig: cliOptions.svgoConfig || 'default',
          generateTypes: true,
        });
      }

      const manager = new MultiSpriteManager({
        configFile: cliOptions.config,
        configurations,
        verbose: cliOptions.verbose,
      });

      const result = await manager.generateAll();

      if (result.success) {
        logger.success(
          `\n✅ All sprites generated successfully! (${result.results.length} configurations)`,
        );
        result.results.forEach(r => {
          logger.logAlways(
            `  ✓ ${r.name}: ${r.iconCount} icons → ${r.spritePath}`,
          );
        });
      } else {
        logger.error('\n❌ Some sprites failed to generate:');
        result.results.forEach(r => {
          if (r.success) {
            logger.logAlways(
              `  ✓ ${r.name}: ${r.iconCount} icons → ${r.spritePath}`,
            );
          } else {
            logger.error(`  ✗ ${r.name}: ${r.error}`);
          }
        });
        process.exit(1);
      }
      return;
    }

    if (cliOptions.name && cliOptions.name.length > 0) {
      const manager = new MultiSpriteManager({
        configFile: cliOptions.config,
        verbose: cliOptions.verbose || true,
      });

      for (const name of cliOptions.name) {
        const result = await manager.generateByName(name);

        if (result.success && result.result) {
          logger.success(
            `✅ Generated ${name}: ${result.result.iconCount} icons → ${result.result.spritePath}`,
          );
        } else {
          logger.error(`❌ Failed to generate ${name}: ${result.error}`);
          process.exit(1);
        }
      }
      return;
    }

    if (cliOptions.all) {
      const manager = new MultiSpriteManager({
        configFile: cliOptions.config,
        verbose: cliOptions.verbose,
      });

      const result = await manager.generateAll();

      if (result.success) {
        logger.success(
          `\n✅ All sprites generated successfully! (${result.results.length} configurations)`,
        );
        result.results.forEach(r => {
          logger.logAlways(
            `  ✓ ${r.name}: ${r.iconCount} icons → ${r.spritePath}`,
          );
        });
      } else {
        logger.error('\n❌ Some sprites failed to generate:');
        result.results.forEach(r => {
          if (r.success) {
            logger.logAlways(
              `  ✓ ${r.name}: ${r.iconCount} icons → ${r.spritePath}`,
            );
          } else {
            logger.error(`  ✗ ${r.name}: ${r.error}`);
          }
        });
        process.exit(1);
      }
      return;
    }

    logger.warn(
      '⚠️  No specific action specified. Use --all, --name, or provide --src/--dist pairs.',
    );
    logger.logAlways('Run with --help for usage information.');
    process.exit(1);
  } catch (error) {
    const logger = createLogger({ verbose: true });
    logger.error(`❌ Sprite generation failed: ${error}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as generateSprite };
export default main;
