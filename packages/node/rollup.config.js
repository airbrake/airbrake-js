import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';

const pkg = require('./package.json');

const nodePlugins = [typescript(), replace({ VERSION: `${pkg.version}` })];

function cjs(cfg) {
  return Object.assign(
    {
      format: 'cjs',
      sourcemap: true,
    },
    cfg,
  );
}

export default [
  {
    input: 'src/node.entry.ts',
    output: [cjs({ file: 'dist/airbrake.common.js', name: 'Airbrake' })],
    external: ['error-stack-parser', 'cross-fetch'],
    plugins: nodePlugins,
  },
  {
    input: 'src/instrumentation/express.ts',
    output: [
      cjs({
        file: 'dist/instrumentation/express.js',
        name: 'airbrake.instrumentation.express',
      }),
    ],
    plugins: nodePlugins,
  },
];
