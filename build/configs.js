const path = require('path')
const buble = require('rollup-plugin-buble')
const flow = require('rollup-plugin-flow-no-whitespace')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const postcss = require('rollup-plugin-postcss')
const version = process.env.VERSION || require('../package.json').version
const banner =
`/*!
  * ddv-multi-window v${version}
  * (c) ${new Date().getFullYear()} yuchonghua@163.com
  * @license MIT
  */`

const resolve = _path => path.resolve(__dirname, '../', _path)

module.exports = [
  // browser dev
  {
    file: resolve('dist/ddv-multi-window.js'),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve('dist/ddv-multi-window.min.js'),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve('dist/ddv-multi-window.common.js'),
    format: 'cjs'
  },
  {
    file: resolve('dist/ddv-multi-window.esm.js'),
    format: 'es'
  }
].map(genConfig)

function genConfig (opts) {
  const config = {
    input: {
      input: resolve('src/index.js'),
      plugins: [
        getDefault(vue)(),
        getDefault(postcss)(
          {
            extract: resolve('dist/style/ddv-multi-window.css')
          }
        ),
        flow(),
        node(),
        cjs(),
        replace({
          __VERSION__: version
        }),
        buble()
      ]
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: 'DdvMultiWindow'
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }
  return config
}

function getDefault (obj) {
  return obj['default'] || obj
}
