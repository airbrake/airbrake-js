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
  typescript({
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        module: 'ES6',
      },
    },
  }),
  replace({ VERSION: `${pkg.version}` }),
  terser({
    include: [/^.+\.min\.js$/],
  }),
];

function umd(cfg) {
  return Object.assign(
    {
      format: 'umd',
      banner: `/* airbrake-js v${pkg.version} */`,
      sourcemap: true,
    },
    cfg,
  );
}

export default [
  {
    input: 'src/index.ts',
    output: [
      umd({ file: 'umd/airbrake.js', name: 'Airbrake' }),
      umd({ file: 'umd/airbrake.min.js', name: 'Airbrake' }),
    ],
    plugins: webPlugins,
  },
];
