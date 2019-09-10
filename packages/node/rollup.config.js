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

let todo = [
  {
    input: 'src/node.entry.ts',
    output: [cjs({ file: 'dist/airbrake.common.js', name: 'Airbrake' })],
    external: ['error-stack-parser', 'cross-fetch', 'async_hooks'],
    plugins: nodePlugins,
  },
];

for (let mod of ['express', 'pg', 'mysql', 'redis']) {
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
