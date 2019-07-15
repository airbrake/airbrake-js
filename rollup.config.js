import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const plugins = [
  resolve({
    mainFields: ['module', 'main'],
  }),
  commonjs(),
  typescript(),
  replace({
    VERSION: `'${pkg.version}'`,
  }),
  terser({
    include: [/^.+\.min\.js$/, '*esm*'],
  }),
];

function umd(cfg) {
  return Object.assign(
    {
      format: 'umd',
      name: 'airbrakeJs.Client',
      banner: `/* airbrake-js v${pkg.version} */`,
      sourcemap: true,
    },
    cfg
  );
}

export default [
  {
    input: 'src/client.ts',
    output: [
      umd({ file: 'dist/client.js' }),
      umd({ file: 'dist/client.min.js' }),
    ],
    plugins,
  },
  {
    input: 'src/instrumentation/express.ts',
    output: [
      umd({
        file: 'dist/instrumentation/express.js',
        name: 'airbrakeJs.instrumentation.express',
      }),
      umd({
        file: 'dist/instrumentation/express.min.js',
        name: 'airbrakeJs.instrumentation.express',
      }),
    ],
    plugins,
  },
  {
    input: 'src/instrumentation/hapi.ts',
    output: [
      umd({
        file: 'dist/instrumentation/hapi.js',
        name: 'airbrakeJs.instrumentation.hapi',
      }),
      umd({
        file: 'dist/instrumentation/hapi.min.js',
        name: 'airbrakeJs.instrumentation.hapi',
      }),
    ],
    plugins,
  },
];
