import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const nodePlugins = [
  resolve(),
  commonjs({
    namedExports: { tdigest: ['TDigest'] },
  }),
  typescript(),
  replace({ VERSION: `${pkg.version}` }),
];

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

const external = ['error-stack-parser', 'cross-fetch', 'async_hooks'];

let todo = [
  {
    input: 'src/node.entry.ts',
    output: [cjs({ file: 'dist/airbrake.common.js', name: 'Airbrake' })],
    external,
    plugins: nodePlugins,
  },
  {
    input: 'src/node.entry.ts',
    output: [esm({ file: 'dist/airbrake.esm.js' })],
    external,
    plugins: nodePlugins,
  },
];

for (let mod of [
  'express',
  'pg',
  'mysql',
  'mysql2',
  'redis',
  'http',
  'https',
  'debug',
]) {
  todo.push({
    input: `src/instrumentation/${mod}.ts`,
    output: [
      cjs({
        file: `dist/instrumentation/${mod}.js`,
        name: `airbrake.instrumentation.${mod}`,
      }),
    ],
    plugins: nodePlugins,
  });
}

export default todo;
