#!/usr/bin/env node

const fs = require('fs-extra')
const { clientConfig, serverConfig } = require('./fuse')
const { src, task, exec, context } = require('fuse-box/sparky')
const { FuseBox } = require('fuse-box')
const globby = require('globby')
const chalk = require('chalk')
const getBestEntry = require('./utils/getBestEntry')
const {
  ROOT_PATH,
  DEV_BUILD_PATH,
  CACHE_PATH,
  SOURCE_CLIENT,
  SOURCE_SERVER
} = require('./paths')

task('default', ['clean'], async context => {
  // clear fuse-box cache
  await fs.remove(CACHE_PATH)

  // copy static files
  await src(`${SOURCE_CLIENT}/public/**/**.*`, { base: SOURCE_CLIENT })
    .dest(`${DEV_BUILD_PATH}/client/public`)
    .exec()

  const client = FuseBox.init(clientConfig(false))
  const server = FuseBox.init(serverConfig(false))
  client.dev({ port: 4445, httpServer: false })

  let clientExtension = await getBestEntry(SOURCE_CLIENT)
  let serverExtension = await getBestEntry(SOURCE_SERVER)

  client
    .bundle('app')
    .instructions(` > client/index.${clientExtension}`)
    .watch('src/client/**')
    .hmr()

  server
    .bundle('server')
    .instructions(` > [server/index.${serverExtension}]`)
    .watch('src/server/**')
    .completed(proc => proc.start())

  await client.run()
  await server.run()
})
