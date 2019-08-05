import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const nodePlugins = [typescript()];

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
    input: 'src/node.entry.ts',
    output: [
      cjs({ file: 'dist/airbrake.common.js', name: 'airbrakeJs.Client' }),
    ],
    external: ['error-stack-parser', 'cross-fetch'],
    plugins: nodePlugins,
  },
  {
    input: 'src/node.entry.ts',
    output: [esm({ file: 'dist/airbrake.esm.js' })],
    external: ['error-stack-parser', 'cross-fetch'],
    plugins: nodePlugins,
  },
];
