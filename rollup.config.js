import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const webPlugins = [
  resolve({
    mainFields: ['module', 'main'],
  }),
  commonjs(),
  typescript(),
  replace({ VERSION: `'${pkg.version}'` }),
  terser({
    include: [/^.+\.min\.js$/],
  }),
];

const nodePlugins = [typescript(), replace({ VERSION: `'${pkg.version}'` })];

function iife(cfg) {
  return Object.assign(
    {
      format: 'iife',
      banner: `/* airbrake-js v${pkg.version} */`,
      sourcemap: true,
    },
    cfg
  );
}

function cjs(cfg) {
  return Object.assign(
    {
      format: 'cjs',
      sourcemap: true,
    },
    cfg
  );
}

function esm(cfg) {
  return Object.assign(
    {
      format: 'esm',
      sourcemap: true,
    },
    cfg
  );
}

export default [
  {
    input: 'src/web.entry.ts',
    output: [
      iife({ file: 'dist/airbrake.iife.js', name: 'airbrakeJs.Client' }),
      iife({ file: 'dist/airbrake.iife.min.js', name: 'airbrakeJs.Client' }),
    ],
    plugins: webPlugins,
  },
  {
    input: 'src/node.entry.ts',
    output: [
      cjs({ file: 'dist/airbrake.common.js', name: 'airbrakeJs.Client' }),
    ],
    external: ['error-stack-parser'],
    plugins: nodePlugins,
  },
  {
    input: 'src/node.entry.ts',
    output: [esm({ file: 'dist/airbrake.esm.js' })],
    external: ['error-stack-parser'],
    plugins: nodePlugins,
  },
  {
    input: 'src/instrumentation/express.ts',
    output: [
      esm({
        file: 'dist/instrumentation/express.js',
        name: 'airbrakeJs.instrumentation.express',
      }),
    ],
    plugins: nodePlugins,
  },
  {
    input: 'src/instrumentation/hapi.ts',
    output: [
      esm({
        file: 'dist/instrumentation/hapi.js',
        name: 'airbrakeJs.instrumentation.hapi',
      }),
    ],
    plugins: nodePlugins,
  },
];
