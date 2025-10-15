import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        cli: resolve(__dirname, 'src/cli.ts'),
        optimizer: resolve(__dirname, 'src/svgo-optimizer.ts'),
        generator: resolve(__dirname, 'src/font-generator.ts'),
        sprite: resolve(__dirname, 'src/sprite/index.ts')
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'es') {
          return `${entryName}.js`;
        } else {
          return `${entryName}.cjs`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: [
        'oslllo-svg-fixer',
        'svgo',
        'svgtofont',
        'svg-sprite',
        'fs',
        'path',
        'crypto',
        'url',
        'child_process',
        'node:fs',
        'node:path',
        'node:crypto',
        'node:url',
        'node:child_process'
      ],
      output: {
        globals: {
          'oslllo-svg-fixer': 'oslllo-svg-fixer',
          'svgo': 'svgo',
          'svgtofont': 'svgtofont',
          'svg-sprite': 'svg-sprite'
        }
      }
    },
    target: 'node18',
    sourcemap: true,
    minify: false,
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
