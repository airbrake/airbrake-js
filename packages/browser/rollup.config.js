import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const webPlugins = [
  resolve({
    browser: true,
  }),
  commonjs(),
  typescript(),
  replace({ VERSION: `${pkg.version}` }),
  terser({
    include: [/^.+\.min\.js$/],
  }),
];

const nodePlugins = [typescript(), replace({ VERSION: `${pkg.version}` })];

function iife(cfg) {
  return Object.assign(
    {
      format: 'iife',
      banner: `/* airbrake-js v${pkg.version} */`,
      sourcemap: true,
    },
    cfg,
  );
}

function cjs(cfg) {
  return Object.assign(
    {
      format: 'cjs',
      sourcemap: true,
    },
    cfg,
  );
}

function esm(cfg) {
  return Object.assign(
    {
      format: 'esm',
      sourcemap: true,
    },
    cfg,
  );
}

export default [
  {
    input: 'src/browser.entry.ts',
    output: [
      iife({ file: 'dist/airbrake.iife.js', name: 'Airbrake' }),
      iife({ file: 'dist/airbrake.iife.min.js', name: 'Airbrake' }),
    ],
    plugins: webPlugins,
  },
  {
    input: 'src/bundler.entry.ts',
    output: [cjs({ file: 'dist/airbrake.common.js', name: 'Airbrake' })],
    external: ['error-stack-parser', 'cross-fetch'],
    plugins: nodePlugins,
  },
  {
    input: 'src/bundler.entry.ts',
    output: [esm({ file: 'dist/airbrake.esm.js' })],
    external: ['error-stack-parser', 'cross-fetch'],
    plugins: nodePlugins,
  },
];
