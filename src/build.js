#!/usr/bin/env node

const { clientConfig, serverConfig } = require('./fuse')
const { src, task, exec, context } = require('fuse-box/sparky')
const { FuseBox } = require('fuse-box')
const getBestEntry = require('./utils/getBestEntry')
const {
  ROOT_PATH,
  PROD_BUILD_PATH,
  CACHE_PATH,
  SOURCE_CLIENT,
  SOURCE_SERVER
} = require('./paths')

task('default', ['clean'], async context => {
  // copy static files
  await src(`${SOURCE_CLIENT}/public/**/**.*`, { base: SOURCE_CLIENT })
    .dest(`${PROD_BUILD_PATH}/client/public`)
    .exec()

  const client = FuseBox.init(clientConfig(true, PROD_BUILD_PATH))
  const server = FuseBox.init(serverConfig(true, PROD_BUILD_PATH))

  let clientExtension = await getBestEntry(SOURCE_CLIENT)
  let serverExtension = await getBestEntry(SOURCE_SERVER)

  client
    .bundle('vendor')
    .instructions(`~ client/index.${clientExtension}`)

  client
    .bundle('app')
    .instructions(`!> [client/index.${clientExtension}]`)

  server
    .bundle('server')
    .instructions(` > [server/index.${serverExtension}]`)

  await client.run()
  await server.run()
})
