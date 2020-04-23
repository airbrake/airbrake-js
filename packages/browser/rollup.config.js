import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json');

const webPlugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript({ tsconfig: './tsconfig.umd.json' }),
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
      name: 'Airbrake',
    },
    cfg,
  );
}

export default {
  input: 'src/index.ts',
  output: [
    umd({ file: 'umd/airbrake.js' }),
    umd({ file: 'umd/airbrake.min.js' }),
  ],
  plugins: webPlugins,
};
