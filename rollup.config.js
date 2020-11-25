import { externalModules } from '@proc7ts/rollup-helpers';
import flatDts from '@proc7ts/rollup-plugin-flat-dts';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default {
  input: {
    'style-producer': './src/index.ts',
  },
  plugins: [
    commonjs(),
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheRoot: 'target/.rts2_cache',
    }),
    nodeResolve(),
    sourcemaps(),
  ],
  external: externalModules(),
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      entryFileNames: '[name].cjs',
    },
    {
      dir: '.',
      format: 'esm',
      sourcemap: true,
      entryFileNames: 'dist/[name].js',
      plugins: [
        flatDts({
          tsconfig: 'tsconfig.main.json',
          lib: true,
        }),
      ],
    },
  ],
};
