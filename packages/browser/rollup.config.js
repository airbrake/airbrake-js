import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const pkg = require('./package.json');

const webPlugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript({ tsconfig: './tsconfig.umd.json' }),
];

function umd(cfg) {
  return Object.assign(
    {
      format: 'umd',
      banner: `/* airbrake-js v${pkg.version} */`,
      sourcemap: true,
      name: 'Airbrake',
    },
    cfg
  );
}

export default [
  {
    input: 'src/index.ts',
    output: [
      umd({ file: 'umd/airbrake.js' }),
      umd({ file: 'umd/airbrake.min.js', plugins: [terser()] }),
    ],
    plugins: webPlugins,
  },

  //export types
  {
    input: 'src/index.ts',
    output: [{ file: 'types/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
