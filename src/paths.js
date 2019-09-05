const fs = require('fs')
const path = require('path')
const ROOT_PATH = path.resolve()
const pkg = JSON.parse(fs.readFileSync(ROOT_PATH + '/package.json',  'utf8')) // read package.json
const DEV_BUILD_PATH = ROOT_PATH +'/.dist-dev'
const PROD_BUILD_PATH = ROOT_PATH + '/dist'
const CACHE_PATH = ROOT_PATH + '/.fusebox'
const SOURCE_CLIENT = ROOT_PATH + '/src/client'
const SOURCE_SERVER = ROOT_PATH + '/src/server'
const CLIENT_ROOT_URL = process.env.CLIENT_ROOT_URL || ''

const out = module.exports = {
  DEV_BUILD_PATH,
  PROD_BUILD_PATH,
  ROOT_PATH,
  CACHE_PATH,
  SOURCE_CLIENT,
  SOURCE_SERVER,
  CLIENT_ROOT_URL,
  pkg,
}
