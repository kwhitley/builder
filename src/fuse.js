#!/usr/bin/env node
require('dotenv').config()

const cmd = require('node-cmd')
const fs = require('fs-extra')
const chalk = require('chalk')
const deepmerge = require('deepmerge')
const { src, task, exec, context } = require('fuse-box/sparky')
const {
  FuseBox,
  EnvPlugin,
  JSONPlugin,
  CSSPlugin,
  CSSResourcePlugin,
  SassPlugin,
  LESSPlugin,
  CopyPlugin,
  ImageBase64Plugin,
  SVGPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box')
const { DEV_BUILD_PATH, PROD_BUILD_PATH, pkg, ROOT_PATH, CLIENT_ROOT_URL } = require('./paths')
const isProduction = process.env.NODE_ENV === 'production'

// load options from .builderrc ||
const defaultOptions = fs.readJsonSync(`${__dirname}/defaults.config.json`, { throws: false }) || {}
const userOptionsRC = fs.readJsonSync(`${ROOT_PATH}/.builderrc`, { throws: false }) || {}
const userOptionsJSON = fs.readJsonSync(`${ROOT_PATH}/builder.config.json`, { throws: false }) || {}
const userOptions = deepmerge(userOptionsRC, userOptionsJSON)
const options = deepmerge(options, userOptions)

// display build options
if (!isProduction) {
  console.log({ '@supergeneric/builder options:': options })
  console.log({ defaultOptions })
}

const getPageTitle = (title, obj) => {
  let injections = title.match(/\$\{\w+\}/gi) || []

  injections.forEach((injection) => {
    let key = injection.replace(/^\$\{(\w+)\}$/, '$1')

    if (obj.hasOwnProperty(key)) {
      title = title.replace(injection, obj[key])
    }
  })

  return title
}

// returns only process.env prefixed with CLIENT_{something}
const clientEnv = () =>
  Object
    .keys(process.env)
    .filter(v => v.indexOf('CLIENT_') === 0)
    .reduce((a, key) => {
      a[key] = process.env[key]
      return a
    }, {})

// console.log('CLIENT ENV', clientEnv())

const clientConfig = (isProduction, basePath = DEV_BUILD_PATH) => ({
  alias: options.aliases,
  homeDir: `${ROOT_PATH}/src`,
  output: `${basePath}/client/$name.js`,
  useTypescriptCompiler: true,
  allowSyntheticDefaultImports: true,
  tsConfig: [{ target: 'es5' }],
  hash: isProduction,
  debug: !isProduction,
  cache: !isProduction,
  sourceMaps: true,
  plugins: [
    EnvPlugin(
      Object.assign(
        {
          NODE_ENV: isProduction ? 'production' : 'development',
        },
        clientEnv(),
      )
    ),
    JSONPlugin(),
    [
      SassPlugin(),
      CSSResourcePlugin({
        dist: `${basePath}/client/assets/`,
        resolve: f => `${CLIENT_ROOT_URL}/assets/${f}`,
      }),
      CSSPlugin(),
    ],
    [
      LESSPlugin(),
      CSSResourcePlugin({
        dist: `${basePath}/client/assets/`,
        resolve: f => `${CLIENT_ROOT_URL}/assets/${f}`,
      }),
      CSSPlugin(),
    ],
    [
      CSSResourcePlugin({
        dist: `${basePath}/client/assets/`,
        resolve: f => `${CLIENT_ROOT_URLL}/assets/${f}`,
      }),
      CSSPlugin(),
    ],
    CSSPlugin(),
    CopyPlugin({
      useDefault: true,
      files: ['.jpg', '.png', '.svg'],
      dest: 'images',
      resolve: CLIENT_ROOT_URL + '/images',
    }),
    WebIndexPlugin({
      title: getPageTitle(pkg.title, pkg),
      path: process.env.CLIENT_ROOT_URL || '/',
      description: pkg.description,
      template: ROOT_PATH + '/src/client/index.html',
      bundles: ['app', 'vendor'],
    }),
    isProduction && QuantumPlugin({
      manifest : true,
      target: 'browser',
      replaceTypeOf: false,
      uglify: true,
      bakeApiIntoBundle: true,
      treeshake: true,
      css: {
        clean: true,
      },
    })
  ]
})

const serverConfig = (isProduction, basePath = DEV_BUILD_PATH) => ({
  homeDir: `${ROOT_PATH}/src`,
  output: `${basePath}/$name.js`,
  useTypescriptCompiler: true,
  allowSyntheticDefaultImports: true,
  target : 'server@esnext',
  debug: true,
  sourceMaps: true,
  plugins: [
    !isProduction && EnvPlugin({
      NODE_ENV: 'development',
    }),
    JSONPlugin(),
  ]
})

task('clean:dev', async () => await src('**.*').clean(DEV_BUILD_PATH).exec())

task('clean:prod', async () => await src('**.*').clean(PROD_BUILD_PATH).exec())

task('clean', [
  '&clean:dev', // parallel task mode
  '&clean:prod', // parallel task mode
])

module.exports = {
  clientConfig,
  serverConfig,
}
