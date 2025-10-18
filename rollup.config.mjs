import path from 'path';
import { fileURLToPath } from 'url';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: 'src/app/main.ts',
  output: {
    dir: '.',
    entryFileNames: 'main.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'default'
  },
  external: ['obsidian', 'fs', 'path', 'os', 'child_process'],
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development')
    }),
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({ tsconfig: path.resolve(__dirname, 'tsconfig.json') }),
    copy({
      targets: [
        { src: 'src/platform/windows/helpers/*', dest: './platform/windows/helpers' }
      ]
    })
  ]
};
