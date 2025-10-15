export { FontGenerator, type FontGeneratorOptions } from './font-generator.js';
export { SVGOptimizer, type SVGOptimizerOptions } from './svgo-optimizer.js';
export { BuildManager, type BuildManagerOptions } from './build-manager.js';
export { default as inlineDefsPlugin } from './svgo-inline-defs-plugin.js';
export * from './sprite/index.js';

export async function generateIconFont(options: {
  src: string;
  dist: string;
  fontName?: string;
  cssPrefix?: string;
  verbose?: boolean;
  website?: boolean;
  optimize?: boolean;
  fixStrokes?: boolean;
  enableHashRevving?: boolean;
}): Promise<void> {
  const { FontGenerator } = await import('./font-generator.js');
  const generator = new FontGenerator(options);
  await generator.generate();
}

export async function optimizeSVGs(
  srcDir: string,
  outputDir?: string,
  verbose = false,
): Promise<void> {
  const { SVGOptimizer } = await import('./svgo-optimizer.js');
  const optimizer = new SVGOptimizer({ verbose });
  await optimizer.optimizeDirectory(srcDir, outputDir);
}

export async function optimizeSVGsForFonts(
  srcDir: string,
  outputDir?: string,
  verbose = false,
): Promise<void> {
  const { SVGOptimizer } = await import('./svgo-optimizer.js');
  const optimizer = new SVGOptimizer({
    verbose,
    inlineDefs: true,
    removeViewBox: false,
    floatPrecision: 2,
  });
  await optimizer.optimizeDirectory(srcDir, outputDir);
}
