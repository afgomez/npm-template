const fs = require('fs');
const del = require('del');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const pkg = require('../package.json');

const moduleName = 'PROJECT_NAME';

const bundles = [
  {
    format: 'es',
    ext: '.es.js',
  },
  {
    format: 'umd',
    ext: '.js',
  }
];

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(['dist/*']));

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
  promise = promise.then(() => rollup.rollup({
    entry: 'src/index.js',
    sourceMap: true,
    external: Object.keys(pkg.dependencies),
    plugins: [
      babel({
        babelrc: false,
        exclude: 'node_modules/**',
        presets: 'es2015-rollup',
      })
    ],
  }).then(bundle => bundle.write({
    dest: `dist/${moduleName}${config.ext}`,
    format: config.format,
    sourceMap: true,
    moduleName: moduleName,
  })));
}

// Copy package.json and LICENSE.txt
promise = promise.then(() => {
  delete pkg.private;
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete pkg.eslintConfig;
  delete pkg.babel;
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
