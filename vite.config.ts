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
    rollupOptions: {
      external: [
        'oslllo-svg-fixer',
        'svgo',
        'svgtofont',
        'svg-sprite',
        'fs',
        'path',
        'node:fs',
        'node:path',
        'node:crypto',
        'node:os',
        'node:util',
        'node:stream',
        'node:url',
        'node:querystring',
        'node:http',
        'node:https',
        'node:zlib',
        'node:events',
        'node:buffer',
        'node:process',
        'node:child_process',
        'node:worker_threads',
        'node:cluster',
        'node:net',
        'node:tls',
        'node:dgram',
        'node:dns',
        'node:readline',
        'node:repl',
        'node:vm',
        'node:v8',
        'node:perf_hooks',
        'node:async_hooks',
        'node:timers',
        'node:tty',
        'node:assert',
        'node:constants',
        'node:domain',
        'node:punycode',
        'node:string_decoder',
        'node:sys',
        'node:trace_events',
        'node:wasi',
        'os',
        'util',
        'stream',
        'crypto',
        'url',
        'querystring',
        'http',
        'https',
        'zlib',
        'events',
        'buffer',
        'process',
        'child_process',
        'worker_threads',
        'cluster',
        'net',
        'tls',
        'dgram',
        'dns',
        'readline',
        'repl',
        'vm',
        'v8',
        'perf_hooks',
        'async_hooks',
        'timers',
        'tty',
        'assert',
        'constants',
        'domain',
        'punycode',
        'string_decoder',
        'sys',
        'trace_events',
        'wasi'
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
    target: 'es2022',
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
