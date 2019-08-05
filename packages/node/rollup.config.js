import typescript from 'rollup-plugin-typescript2';

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
    output: [cjs({ file: 'dist/airbrake.common.js', name: 'airbrake.Client' })],
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
